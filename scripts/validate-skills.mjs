import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skillsDir = path.join(root, "skills");
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIN_DESC_LENGTH = 40;
const requiredOpenAiFields = ["display_name", "short_description", "default_prompt"];

function parseFrontmatter(content, filePath) {
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

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateSkill(skillName) {
  const skillPath = path.join(skillsDir, skillName);
  const skillStat = await stat(skillPath);
  if (!skillStat.isDirectory()) return { errors: [], validated: false };

  const errors = [];
  if (!namePattern.test(skillName)) {
    errors.push(`${skillName}: directory name must use lowercase letters, numbers, and hyphens`);
  }

  const skillFile = path.join(skillPath, "SKILL.md");
  if (!(await exists(skillFile))) {
    errors.push(`${skillName}: missing SKILL.md`);
    return { errors, validated: true };
  }

  const content = await readFile(skillFile, "utf8");

  try {
    const frontmatter = parseFrontmatter(content, path.relative(root, skillFile));
    const keys = Object.keys(frontmatter).sort();

    if (keys.join(",") !== "description,name") {
      errors.push(`${skillName}: SKILL.md frontmatter must contain only name and description`);
    }

    if (frontmatter.name !== skillName) {
      errors.push(`${skillName}: frontmatter name must match directory name`);
    }

    if (!frontmatter.description || frontmatter.description.length < MIN_DESC_LENGTH) {
      errors.push(
        `${skillName}: description must be at least ${MIN_DESC_LENGTH} characters and clearly explain what the skill does and when to use it`,
      );
    }
  } catch (error) {
    errors.push(error.message);
  }

  const openAiFile = path.join(skillPath, "agents", "openai.yaml");
  if (await exists(openAiFile)) {
    const metadata = await readFile(openAiFile, "utf8");
    for (const field of requiredOpenAiFields) {
      if (!new RegExp(`^${field}:`, "m").test(metadata)) {
        errors.push(`${skillName}: agents/openai.yaml missing ${field}:`);
      }
    }
  }

  return { errors, validated: true };
}

async function main() {
  const entries = await readdir(skillsDir);
  const allErrors = [];
  let validatedCount = 0;

  for (const entry of entries) {
    const result = await validateSkill(entry);
    allErrors.push(...result.errors);
    if (result.validated) {
      validatedCount += 1;
    }
  }

  if (allErrors.length > 0) {
    console.error("Skill validation failed:");
    for (const error of allErrors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${validatedCount} skill(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
