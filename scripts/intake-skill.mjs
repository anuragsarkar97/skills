import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import {
  normalizeSkillName,
  parseArgs,
  readSkillFrontmatter,
  skillNamePattern,
} from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const source = args._[0];

if (!source) {
  console.error("Usage: node scripts/intake-skill.mjs <local-skill-dir-or-git-url[#subdir]> [--name <skill-name>] [--quarantine .skill-intake] [--accept] [--force]");
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
  const { source: sourceRoot, subdir } = splitSource(spec);
  if (!isGitSource(sourceRoot)) {
    return path.resolve(sourceRoot, subdir);
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "skill-intake-"));
  execFileSync("git", ["clone", "--depth", "1", sourceRoot, tempDir], {
    stdio: "inherit",
  });
  return path.join(tempDir, subdir);
}

const sourceDir = await resolveSource(source);
const sourceStat = await stat(sourceDir);
if (!sourceStat.isDirectory()) {
  console.error(`Source is not a directory: ${sourceDir}`);
  process.exit(1);
}

const frontmatter = await readSkillFrontmatter(sourceDir);
const skillName = normalizeSkillName(args.name || frontmatter.name || path.basename(sourceDir));
if (!skillNamePattern.test(skillName)) {
  console.error(`Invalid skill name: ${skillName}`);
  process.exit(1);
}

const quarantineRoot = path.resolve(args.quarantine || ".skill-intake");
const quarantineDir = path.join(quarantineRoot, skillName);
await mkdir(quarantineRoot, { recursive: true });
await rm(quarantineDir, { recursive: true, force: true });
await cp(sourceDir, quarantineDir, {
  recursive: true,
  filter: (filePath) => !filePath.includes(`${path.sep}.git${path.sep}`),
});

if (frontmatter.name !== skillName) {
  const skillFile = path.join(quarantineDir, "SKILL.md");
  const content = await readFile(skillFile, "utf8");
  await writeFile(skillFile, content.replace(/^name:\s*.*$/m, `name: ${skillName}`));
}

execFileSync("node", ["scripts/validate-skills.mjs", "--path", quarantineRoot], { stdio: "inherit" });

const report = {
  skillName,
  source: sourceDir,
  quarantineDir,
  accepted: Boolean(args.accept),
  checks: ["copied without .git", "frontmatter normalized", "validated in quarantine"],
};

await writeFile(path.join(quarantineDir, "intake-report.json"), `${JSON.stringify(report, null, 2)}\n`);

if (args.accept) {
  execFileSync(
    "node",
    [
      "scripts/import-skill.mjs",
      quarantineDir,
      "--name",
      skillName,
      ...(args.force ? ["--force"] : []),
    ],
    { stdio: "inherit" },
  );
}

console.log(`Intake complete for ${skillName}. Review ${path.relative(process.cwd(), quarantineDir)} before accepting.`);
