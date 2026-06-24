import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  formatOpenAiYaml,
  normalizeSkillName,
  parseArgs,
  skillNamePattern,
  titleCaseSkillName,
} from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const rawName = args._[0];

if (!rawName || !args.description) {
  console.error(
    "Usage: node scripts/create-skill.mjs <skill-name> --description <text> [--display-name <text>] [--short-description <text>] [--default-prompt <text>] [--path skills]",
  );
  process.exit(1);
}

const skillName = normalizeSkillName(rawName);
if (!skillNamePattern.test(skillName)) {
  console.error(`Invalid skill name after normalization: ${skillName}`);
  process.exit(1);
}

const outputRoot = args.path || "skills";
const skillDir = path.resolve(outputRoot, skillName);
const displayName = args["display-name"] || titleCaseSkillName(skillName);
const shortDescription =
  args["short-description"] || `Use ${displayName} guidance`;
const defaultPrompt =
  args["default-prompt"] || `Use $${skillName} to complete the requested task.`;

try {
  await stat(skillDir);
  console.error(`Skill directory already exists: ${skillDir}`);
  process.exit(1);
} catch {
  // Expected when creating a new skill.
}

await mkdir(path.join(skillDir, "agents"), { recursive: true });

await writeFile(
  path.join(skillDir, "SKILL.md"),
  `---\nname: ${skillName}\ndescription: ${args.description}\n---\n\n# ${displayName}\n\nUse this skill for the scenario described in the frontmatter. Replace this body with the concrete workflow, checks, and output shape before publishing the skill for broad use.\n\n## Workflow\n\n1. Inspect relevant context before acting.\n2. Apply the skill-specific checklist.\n3. Produce the smallest useful output.\n4. Validate the result with the local repository command.\n`,
);

await writeFile(
  path.join(skillDir, "agents", "openai.yaml"),
  formatOpenAiYaml({
    displayName,
    shortDescription,
    defaultPrompt,
  }),
);

await writeFile(
  path.join(skillDir, "agents", "claude.md"),
  `# Claude Notes\n\nInvoke this skill proactively when the current request matches \`${skillName}\`. Keep shared instructions in \`SKILL.md\`.\n`,
);

console.log(`Created ${path.relative(process.cwd(), skillDir)}`);
