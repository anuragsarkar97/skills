import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
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

  const bundles = path.join(root, "bundles");
  await mkdir(bundles);
  await writeFile(path.join(bundles, "marketplace-manifest.json"), JSON.stringify({ skills: [{ name: "retired-fixture" }] }));
  await writeFile(path.join(bundles, "retired-fixture.zip"), "Previously generated archive");
  await writeFile(path.join(bundles, "custom-backup.zip"), "Unrelated archive");
  run(process.execPath, [path.join(packageRoot, "scripts", "package-claude.mjs"), "--out", bundles], packageRoot);
  await assert.rejects(access(path.join(bundles, "retired-fixture.zip")), { code: "ENOENT" });
  assert.equal(await readFile(path.join(bundles, "custom-backup.zip"), "utf8"), "Unrelated archive");
  const manifest = JSON.parse(await readFile(path.join(bundles, "marketplace-manifest.json"), "utf8"));
  assert.deepEqual(manifest.skills.map(({ name }) => name).sort(), expected);

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
  console.log(`Packed CLI, ${expected.length} copied/linked skills, frontend profile, references, and installed scripts passed.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
