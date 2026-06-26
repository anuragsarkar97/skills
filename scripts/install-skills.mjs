import { cp, lstat, mkdir, mkdtemp, readFile, readlink, rm, stat, symlink, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import {
  listSkills,
  normalizeSkillName,
  parseArgs,
  pathExists,
  readSkillFrontmatter,
  skillNamePattern,
} from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = args.mode || "copy";
const write = Boolean(args.write);
const force = Boolean(args.force);
const removeStale = Boolean(args["remove-stale"]);
const sourceRoot = path.resolve(args.path || "skills");
const repositoryRoot = path.dirname(sourceRoot);
const knowledgeRoot = path.join(repositoryRoot, "knowledge");
const profileName = args.profile ? normalizeSkillName(String(args.profile)) : "";
const installExternal = !args["no-external"];

if (!["copy", "symlink"].includes(mode)) {
  console.error("--mode must be copy or symlink");
  process.exit(1);
}

function defaultTarget(agent) {
  if (agent === "codex") return path.join(os.homedir(), ".codex", "skills");
  if (agent === "claude") return path.join(os.homedir(), ".claude", "skills");
  return "";
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

async function resolveExternalSource(spec, baseDir = process.cwd()) {
  const { source, subdir } = splitSource(spec);
  if (!isGitSource(source)) {
    return path.resolve(baseDir, source, subdir);
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "external-skill-install-"));
  execFileSync("git", ["clone", "--depth", "1", source, tempDir], {
    stdio: "inherit",
  });
  return path.join(tempDir, subdir);
}

async function readProfile(name) {
  if (!name) return { skills: [], external: [], externalManifests: [] };
  const profilePath = path.resolve("profiles", `${name}.json`);
  if (!(await pathExists(profilePath))) {
    console.error(`Unknown profile: ${name}`);
    process.exit(1);
  }
  const profile = JSON.parse(await readFile(profilePath, "utf8"));
  return { ...profile, baseDir: path.dirname(profilePath) };
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function readExternalManifest(filePath) {
  if (!filePath) return [];
  const manifestPath = path.resolve(String(filePath));
  const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
  const sources = Array.isArray(parsed) ? parsed : parsed.sources || [];
  return sources.map((entry) =>
    typeof entry === "string"
      ? { source: entry, baseDir: path.dirname(manifestPath) }
      : { ...entry, baseDir: path.dirname(manifestPath) }
  );
}

const targetRoot = path.resolve(args.target || defaultTarget(args.agent));
if (!targetRoot) {
  console.error("Usage: node scripts/install-skills.mjs --target <dir> [--all|--skills a,b] [--mode copy|symlink] [--write] [--force] [--remove-stale]");
  process.exit(1);
}

const profile = await readProfile(profileName);
const skills = await listSkills(sourceRoot);
const selectedNames = args.skills
  ? new Set(String(args.skills).split(",").map((name) => name.trim()).filter(Boolean))
  : new Set(profile.skills?.length ? profile.skills : skills.map((skill) => skill.name));
const selectedSkills = skills.filter((skill) => selectedNames.has(skill.name));
const profileExternalManifests = [];
if (installExternal) {
  for (const manifest of [...asArray(profile.externalManifest), ...asArray(profile.externalManifests)]) {
    const manifestPath = path.isAbsolute(manifest) ? manifest : path.resolve(profile.baseDir || process.cwd(), "..", manifest);
    profileExternalManifests.push(...(await readExternalManifest(manifestPath)));
  }
}
const externalSpecs = installExternal
  ? [
      ...String(args.external || "").split(",").map((source) => source.trim()).filter(Boolean).map((source) => ({ source, baseDir: process.cwd() })),
      ...(profile.external || []).map((entry) =>
        typeof entry === "string"
          ? { source: entry, baseDir: profile.baseDir || process.cwd() }
          : { ...entry, baseDir: profile.baseDir || process.cwd() }
      ),
      ...profileExternalManifests,
      ...(await readExternalManifest(args["external-manifest"])),
    ]
  : [];

for (const name of selectedNames) {
  if (!skills.some((skill) => skill.name === name)) {
    console.error(`Unknown skill: ${name}`);
    process.exit(1);
  }
}

const markerName = ".managed-by-ai-agent-skills";
const operations = [];
const selectedExternalNames = new Set();

if (write) {
  await mkdir(targetRoot, { recursive: true });
}

if (await pathExists(knowledgeRoot)) {
  const knowledgeTarget = path.join(targetRoot, "_knowledge");
  operations.push(`${await pathExists(knowledgeTarget) ? "replace" : "install"} shared knowledge as copy`);
  if (write) {
    await rm(knowledgeTarget, { recursive: true, force: true });
    await cp(knowledgeRoot, knowledgeTarget, { recursive: true });
    await writeFile(path.join(knowledgeTarget, markerName), `source=${knowledgeRoot}\n`);
  }
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

for (const external of externalSpecs) {
  const sourceSpec = typeof external === "string" ? external : external.source;
  if (!sourceSpec) continue;

  const sourceDir = await resolveExternalSource(sourceSpec, external.baseDir || process.cwd());
  const sourceStat = await stat(sourceDir).catch(() => null);
  if (!sourceStat?.isDirectory()) {
    console.error(`External skill source is not a directory: ${sourceSpec}`);
    process.exit(1);
  }

  const frontmatter = await readSkillFrontmatter(sourceDir);
  const skillName = normalizeSkillName(external.name || frontmatter.name || path.basename(sourceDir));
  if (!skillNamePattern.test(skillName)) {
    console.error(`Invalid external skill name: ${skillName}`);
    process.exit(1);
  }
  selectedExternalNames.add(skillName);

  const targetDir = path.join(targetRoot, skillName);
  const exists = await pathExists(targetDir);
  if (exists && !force) {
    operations.push(`skip existing external ${skillName}`);
    continue;
  }

  operations.push(`${exists ? "replace" : "install"} external ${skillName} as copy`);
  if (!write) continue;

  if (exists) {
    await rm(targetDir, { recursive: true, force: true });
  }
  await cp(sourceDir, targetDir, {
    recursive: true,
    filter: (filePath) => !filePath.includes(`${path.sep}.git${path.sep}`),
  });
  await writeFile(path.join(targetDir, markerName), `source=${sourceSpec}\nexternal=true\n`);
}

if (removeStale) {
  const installed = await listSkills(targetRoot).catch(() => []);
  const selectedSet = new Set([
    ...selectedSkills.map((skill) => skill.name),
    ...selectedExternalNames,
  ]);
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
