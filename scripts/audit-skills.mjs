import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  extractSkillReferences,
  listSkills,
  parseArgs,
  printIssues,
  readTextIfExists,
} from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const skillsDir = args.path || "skills";
const skills = await listSkills(skillsDir);
const skillNames = new Set(skills.map((skill) => skill.name));
const errors = [];
const warnings = [];

const routerPath = path.resolve(args.router || path.join(skillsDir, "agent-skill-router", "SKILL.md"));
const routerContent = await readTextIfExists(routerPath);
const routerReferences = new Set(extractSkillReferences(routerContent, [...skillNames]));

for (const skill of skills) {
  const label = skill.name;

  if (skill.name !== path.basename(skill.dir)) {
    errors.push(`${label}: folder name and frontmatter name differ`);
  }

  if (!skill.openAiContent) {
    errors.push(`${label}: missing agents/openai.yaml`);
  } else {
    if (!skill.openAi.defaultPrompt?.includes(`$${skill.name}`)) {
      errors.push(`${label}: default_prompt must mention $${skill.name}`);
    }

    if (skill.openAi.allowImplicitInvocation !== true) {
      errors.push(`${label}: policy.allow_implicit_invocation should be true`);
    }

    const shortLength = skill.openAi.shortDescription?.length ?? 0;
    if (shortLength < 25 || shortLength > 64) {
      errors.push(`${label}: short_description must be 25-64 characters`);
    }
  }

  if (!skill.hasClaudeNotes) {
    warnings.push(`${label}: missing agents/claude.md`);
  }

  const description = skill.frontmatter.description || "";
  if (/help with .*tasks|complete the requested task|use when\.\.\.|todo/i.test(description)) {
    warnings.push(`${label}: description may be too generic`);
  }

  const bodyLineCount = skill.skillContent.split("\n").length;
  if (bodyLineCount > 500) {
    warnings.push(`${label}: SKILL.md is ${bodyLineCount} lines; consider moving detail to references/`);
  }

  if (skill.name !== "agent-skill-router" && !routerReferences.has(skill.name)) {
    warnings.push(`${label}: not referenced by agent-skill-router`);
  }
}

if (routerContent) {
  const rawRouterReferences = extractSkillReferences(routerContent);
  for (const reference of rawRouterReferences) {
    if (!skillNames.has(reference)) {
      errors.push(`agent-skill-router: references missing skill ${reference}`);
    }
  }
} else {
  errors.push(`missing router file: ${routerPath}`);
}

const catalogPath = path.resolve(skillsDir, "catalog.json");
try {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const catalogNames = new Set((catalog.skills || []).map((skill) => skill.name));
  for (const skill of skills) {
    if (!catalogNames.has(skill.name)) {
      warnings.push(`${skill.name}: missing from catalog.json; run npm run skills:catalog`);
    }
  }
  if (catalog.count !== skills.length) {
    warnings.push(`catalog.json count is ${catalog.count}, expected ${skills.length}`);
  }
} catch {
  warnings.push("catalog.json missing or unreadable; run npm run skills:catalog");
}

printIssues("Skill audit warnings:", warnings);
printIssues("Skill audit errors:", errors);

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`Skill audit passed with ${warnings.length} warning(s).`);
}
