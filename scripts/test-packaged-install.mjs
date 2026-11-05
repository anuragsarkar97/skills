import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, lstat, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = await mkdtemp(path.join(os.tmpdir(), "packed skill test "));
const repository = process.cwd();
const project = path.join(root, "unrelated project");
function run(command, args, cwd = project) {
  return execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}
try {
  await mkdir(project);
  const packed = JSON.parse(run("npm", [
    "pack", "--json", "--pack-destination", root, "--cache", path.join(root, "npm-cache"),
  ], repository));
  run("tar", ["-xzf", path.join(root, packed[0].filename), "-C", root]);
  const packageRoot = path.join(root, "package");
  const cli = path.join(packageRoot, "bin", "ai-agent-skills.mjs");
  const catalog = JSON.parse(await readFile(path.join(packageRoot, "skills", "catalog.json"), "utf8"));
  const expected = catalog.skills.map(({ name }) => name).sort();
  assert.equal(catalog.count, expected.length);

  // Run the shipped checks, not source-tree imports, from an unrelated working directory.
  run(process.execPath, [cli, "check"]);
  const target = path.join(root, "installed skills");
  run(process.execPath, [cli, "install", "--target", target, "--write"]);
  assert.deepEqual((await readdir(target)).filter((name) => name !== "_knowledge").sort(), expected);
  for (const name of expected) {
    for (const file of ["SKILL.md", "agents/openai.yaml", "agents/claude.md"]) {
      await access(path.join(target, name, file));
    }
    const content = await readFile(path.join(target, name, "SKILL.md"), "utf8");
    for (const match of content.matchAll(/\.\.\/_knowledge\/([\w/-]+\.md)/g)) {
      await access(path.join(target, "_knowledge", match[1]));
    }
  }

  const profile = JSON.parse(await readFile(path.join(packageRoot, "profiles", "frontend.json"), "utf8"));
  const frontend = path.join(root, "frontend");
  run(process.execPath, [cli, "install", "--profile", "frontend", "--target", frontend, "--write"]);
  assert.deepEqual((await readdir(frontend)).filter((name) => name !== "_knowledge").sort(), [...profile.skills].sort());

  const linked = path.join(root, "linked skills");
  run(process.execPath, [cli, "install", "--mode", "symlink", "--target", linked, "--write"]);
  for (const name of expected) {
    assert.equal((await lstat(path.join(linked, name))).isSymbolicLink(), true);
    await access(path.join(linked, name, "SKILL.md"));
  }
  run(process.execPath, [path.join(target, "decision-memory", "scripts", "decision-memory.mjs"), "init", "--path", project]);
  run(process.execPath, [path.join(target, "work-impact-tracker", "scripts", "work-impact.mjs"), "init", "--dir", path.join(root, "worklog")]);
  console.log(`Packed CLI, ${expected.length} copied/linked skills, frontend profile, references, and installed scripts passed.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
