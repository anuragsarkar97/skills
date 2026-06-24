import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { listSkills, parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const skillsDir = args.path || "skills";
const outputDir = path.resolve(args.out || "dist/claude");
const selected = args.skills
  ? new Set(String(args.skills).split(",").map((skill) => skill.trim()).filter(Boolean))
  : null;
const skills = (await listSkills(skillsDir)).filter((skill) => !selected || selected.has(skill.name));

if (selected) {
  for (const skillName of selected) {
    if (!skills.some((skill) => skill.name === skillName)) {
      console.error(`Unknown skill: ${skillName}`);
      process.exit(1);
    }
  }
}

await mkdir(outputDir, { recursive: true });

for (const skill of skills) {
  const stageRoot = path.join(os.tmpdir(), `claude-skill-${skill.name}-${Date.now()}`);
  await rm(stageRoot, { recursive: true, force: true });
  await mkdir(stageRoot, { recursive: true });

  const stagedSkillDir = path.join(stageRoot, skill.name);
  await cp(skill.dir, stagedSkillDir, {
    recursive: true,
    filter: (filePath) => !filePath.includes(`${path.sep}.git${path.sep}`),
  });

  const zipPath = path.join(outputDir, `${skill.name}.zip`);
  await rm(zipPath, { force: true });
  const result = spawnSync("zip", ["-qr", zipPath, skill.name], {
    cwd: stageRoot,
    stdio: "inherit",
  });
  await rm(stageRoot, { recursive: true, force: true });

  if (result.status !== 0) {
    console.error(`Failed to package ${skill.name}`);
    process.exit(result.status ?? 1);
  }
}

const manifestResult = spawnSync(process.execPath, [
  path.join(process.cwd(), "scripts/generate-marketplace-manifest.mjs"),
  "--path",
  skillsDir,
  "--out",
  outputDir,
  ...(selected ? ["--skills", [...selected].join(",")] : []),
], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (manifestResult.status !== 0) {
  process.exit(manifestResult.status ?? 1);
}

console.log(`Packaged ${skills.length} Claude skill archive(s) in ${path.relative(process.cwd(), outputDir)}`);
