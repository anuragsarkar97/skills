import { cp, lstat, mkdir, readFile, readlink, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { listSkills, parseArgs, pathExists } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = args.mode || "copy";
const write = Boolean(args.write);
const force = Boolean(args.force);
const removeStale = Boolean(args["remove-stale"]);
const sourceRoot = path.resolve(args.path || "skills");

if (!["copy", "symlink"].includes(mode)) {
  console.error("--mode must be copy or symlink");
  process.exit(1);
}

function defaultTarget(agent) {
  if (agent === "codex") return path.join(os.homedir(), ".codex", "skills");
  if (agent === "claude") return path.join(os.homedir(), ".claude", "skills");
  return "";
}

const targetRoot = path.resolve(args.target || defaultTarget(args.agent));
if (!targetRoot) {
  console.error("Usage: node scripts/install-skills.mjs --target <dir> [--all|--skills a,b] [--mode copy|symlink] [--write] [--force] [--remove-stale]");
  process.exit(1);
}

const skills = await listSkills(sourceRoot);
const selectedNames = args.skills
  ? new Set(String(args.skills).split(",").map((name) => name.trim()).filter(Boolean))
  : new Set(skills.map((skill) => skill.name));
const selectedSkills = skills.filter((skill) => selectedNames.has(skill.name));

for (const name of selectedNames) {
  if (!skills.some((skill) => skill.name === name)) {
    console.error(`Unknown skill: ${name}`);
    process.exit(1);
  }
}

const markerName = ".managed-by-ai-agent-skills";
const operations = [];

if (write) {
  await mkdir(targetRoot, { recursive: true });
}

for (const skill of selectedSkills) {
  const targetDir = path.join(targetRoot, skill.name);
  const exists = await pathExists(targetDir);

  if (exists && !force) {
    operations.push(`skip existing ${skill.name}`);
    continue;
  }

  operations.push(`${exists ? "replace" : "install"} ${skill.name} as ${mode}`);
  if (!write) continue;

  if (exists) {
    await rm(targetDir, { recursive: true, force: true });
  }

  if (mode === "symlink") {
    await symlink(skill.dir, targetDir, "dir");
  } else {
    await cp(skill.dir, targetDir, { recursive: true });
    await writeFile(path.join(targetDir, markerName), `source=${skill.dir}\n`);
  }
}

if (removeStale) {
  const installed = await listSkills(targetRoot).catch(() => []);
  const selectedSet = new Set(selectedSkills.map((skill) => skill.name));
  for (const installedSkill of installed) {
    if (selectedSet.has(installedSkill.name)) continue;

    const targetDir = path.join(targetRoot, installedSkill.name);
    const markerPath = path.join(targetDir, markerName);
    const stat = await lstat(targetDir);
    let managed = false;

    if (stat.isSymbolicLink()) {
      const linkTarget = await readlink(targetDir);
      managed = path.resolve(targetRoot, linkTarget).startsWith(sourceRoot);
    } else if (await pathExists(markerPath)) {
      const marker = await readFile(markerPath, "utf8");
      managed = marker.includes("ai-agent-skills") || marker.includes("source=");
    }

    if (!managed) {
      operations.push(`preserve unmarked stale ${installedSkill.name}`);
      continue;
    }

    operations.push(`remove stale ${installedSkill.name}`);
    if (write) {
      await rm(targetDir, { recursive: true, force: true });
    }
  }
}

console.log(write ? "Install operations:" : "Dry-run install operations:");
for (const operation of operations) {
  console.log(`- ${operation}`);
}
