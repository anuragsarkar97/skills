import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import {
  normalizeSkillName,
  parseArgs,
  readSkillFrontmatter,
  skillNamePattern,
} from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const sourceSpec = args._[0];

if (!sourceSpec) {
  console.error(
    "Usage: node scripts/import-skill.mjs <local-path-or-git-url[#subdir]> [--name <skill-name>] [--path skills] [--force]",
  );
  process.exit(1);
}

function splitSource(spec) {
  const hashIndex = spec.indexOf("#");
  if (hashIndex === -1) {
    return { source: spec, subdir: "" };
  }
  return { source: spec.slice(0, hashIndex), subdir: spec.slice(hashIndex + 1) };
}

function isGitSource(value) {
  return /^(https?:\/\/|ssh:\/\/|git@)/.test(value);
}

async function resolveSource(spec) {
  const { source, subdir } = splitSource(spec);
  if (!isGitSource(source)) {
    return path.resolve(source, subdir);
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "skill-import-"));
  execFileSync("git", ["clone", "--depth", "1", source, tempDir], {
    stdio: "inherit",
  });
  return path.join(tempDir, subdir);
}

const sourceDir = await resolveSource(sourceSpec);
const sourceStat = await stat(sourceDir);
if (!sourceStat.isDirectory()) {
  console.error(`Source is not a directory: ${sourceDir}`);
  process.exit(1);
}

const frontmatter = await readSkillFrontmatter(sourceDir);
const skillName = normalizeSkillName(args.name || frontmatter.name || path.basename(sourceDir));
if (!skillNamePattern.test(skillName)) {
  console.error(`Invalid imported skill name: ${skillName}`);
  process.exit(1);
}

const targetRoot = path.resolve(args.path || "skills");
const targetDir = path.join(targetRoot, skillName);
const isReplacing = Boolean(args.force);
await mkdir(targetRoot, { recursive: true });
if (isReplacing) {
  await rm(targetDir, { recursive: true, force: true });
} else {
  try {
    await stat(targetDir);
    console.error(`Target skill already exists: ${targetDir}`);
    process.exit(1);
  } catch {
    // Expected when importing a new skill.
  }
}

await cp(sourceDir, targetDir, {
  recursive: true,
  errorOnExist: true,
  force: false,
  filter: (source) => !source.includes(`${path.sep}.git${path.sep}`),
});

if (frontmatter.name !== skillName) {
  const targetSkillFile = path.join(targetDir, "SKILL.md");
  const content = await readFile(targetSkillFile, "utf8");
  const updated = content.replace(/^name:\s*.*$/m, `name: ${skillName}`);
  await writeFile(targetSkillFile, updated);
}

try {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  execFileSync("node", [path.join(scriptDir, "validate-skills.mjs"), "--path", targetRoot], {
    stdio: "inherit",
  });
} catch {
  console.error(`Imported skill failed validation: ${skillName}`);
  if (!isReplacing) {
    await rm(targetDir, { recursive: true, force: true });
  }
  process.exit(1);
}

console.log(`Imported ${skillName} from ${sourceSpec}`);
