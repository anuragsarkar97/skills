import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const skillNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSkillName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function titleCaseSkillName(skillName) {
  return skillName
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function parseFrontmatter(content, filePath = "SKILL.md") {
  if (!content.startsWith("---\n")) {
    throw new Error(`${filePath}: missing YAML frontmatter`);
  }

  const end = content.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error(`${filePath}: unterminated YAML frontmatter`);
  }

  const block = content.slice(4, end).trim();
  const data = {};

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      throw new Error(`${filePath}: unsupported frontmatter line "${line}"`);
    }

    const [, key, rawValue] = match;
    data[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return data;
}

export async function readSkillFrontmatter(skillDir) {
  const skillFile = path.join(skillDir, "SKILL.md");
  const content = await readFile(skillFile, "utf8");
  return parseFrontmatter(content, skillFile);
}

export async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextIfExists(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function listSkills(skillsDir = "skills") {
  const absoluteSkillsDir = path.resolve(skillsDir);
  const entries = await readdir(absoluteSkillsDir);
  const skills = [];

  for (const entry of entries.sort()) {
    const skillDir = path.join(absoluteSkillsDir, entry);
    const entryStat = await stat(skillDir).catch(() => null);
    if (!entryStat?.isDirectory()) continue;

    const skillFile = path.join(skillDir, "SKILL.md");
    const skillContent = await readFile(skillFile, "utf8");
    const frontmatter = parseFrontmatter(skillContent, skillFile);
    const openAiFile = path.join(skillDir, "agents", "openai.yaml");
    const openAiContent = await readTextIfExists(openAiFile);
    const claudeFile = path.join(skillDir, "agents", "claude.md");

    skills.push({
      name: frontmatter.name,
      dir: skillDir,
      relativeDir: path.relative(process.cwd(), skillDir),
      skillFile,
      skillContent,
      frontmatter,
      openAiFile,
      openAiContent,
      openAi: openAiContent ? extractOpenAiMetadata(openAiContent) : {},
      claudeFile,
      hasClaudeNotes: await pathExists(claudeFile),
    });
  }

  return skills;
}

export function yamlQuote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}

export function formatOpenAiYaml({
  displayName,
  shortDescription,
  defaultPrompt,
  allowImplicitInvocation = true,
}) {
  return [
    "interface:",
    `  display_name: ${yamlQuote(displayName)}`,
    `  short_description: ${yamlQuote(shortDescription)}`,
    `  default_prompt: ${yamlQuote(defaultPrompt)}`,
    "",
    "policy:",
    `  allow_implicit_invocation: ${allowImplicitInvocation ? "true" : "false"}`,
    "",
  ].join("\n");
}

export function extractOpenAiMetadata(content) {
  const field = (name) => {
    const match = content.match(new RegExp(`^\\s*${name}:\\s*["']?(.+?)["']?\\s*$`, "m"));
    return match?.[1] ?? "";
  };

  return {
    displayName: field("display_name"),
    shortDescription: field("short_description"),
    defaultPrompt: field("default_prompt"),
    allowImplicitInvocation: /^\s*allow_implicit_invocation:\s*true\s*$/m.test(content),
  };
}

export function extractSkillReferences(content, knownSkillNames = []) {
  const known = new Set(knownSkillNames);
  const references = new Set();
  const patterns = [
    /`([a-z0-9]+(?:-[a-z0-9]+)*)`/g,
    /\$([a-z0-9]+(?:-[a-z0-9]+)*)/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const skillName = match[1];
      if (!known.size || known.has(skillName)) {
        references.add(skillName);
      }
    }
  }

  return [...references].sort();
}

export function printIssues(title, issues) {
  if (!issues.length) return;
  console.log(title);
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
}
