import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const installer = path.resolve("scripts/install-skills.mjs");
const root = await mkdtemp(path.join(os.tmpdir(), "skill-install-test-"));
const source = path.join(root, "source", "skills");
const target = path.join(root, "installed");
const marker = ".managed-by-ai-agent-skills";
const exists = async (file) => Boolean(await lstat(file).catch(() => null));
function run(args) {
  return spawnSync(process.execPath, [installer, "--path", source, ...args], {
    cwd: root, encoding: "utf8",
  });
}
async function fixture(dir, name, managed = false) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "SKILL.md"), `---\nname: ${name}\ndescription: Fixture for testing safe skill installation and migration.\n---\n`);
  if (managed) await writeFile(path.join(dir, marker), `source=${path.join(source, name)}\n`);
}
try {
  await fixture(path.join(source, "active"), "active");
  await mkdir(path.join(root, "source", "knowledge"), { recursive: true });
  await writeFile(path.join(root, "source", "knowledge", "reference.md"), "Shared reference\n");
  await mkdir(target);

  // Reject an absent destination before resolving an empty value to the working directory.
  const missing = run(["--write"]);
  assert.notEqual(missing.status, 0, "an install must require --target or a known --agent");
  assert.match(missing.stderr, /Usage:/);
  assert.equal(await exists(path.join(root, "_knowledge")), false, "missing destination must not write into cwd");

  const selfInstall = run(["--target", source, "--write", "--force"]);
  assert.notEqual(selfInstall.status, 0, "installation must not overwrite its source");
  assert.equal(await exists(path.join(source, "active", "SKILL.md")), true);
  const nested = run(["--target", path.join(source, "nested"), "--write"]);
  assert.notEqual(nested.status, 0);
  assert.equal(await exists(path.join(source, "nested")), false);
  const sourceAlias = path.join(root, "source-alias");
  await symlink(source, sourceAlias);
  const aliased = run(["--target", sourceAlias, "--write", "--force"]);
  assert.notEqual(aliased.status, 0);
  assert.equal(await exists(path.join(source, "active", "SKILL.md")), true);

  await fixture(path.join(target, "retired-copy"), "retired-copy", true);
  await fixture(path.join(target, "custom"), "custom");
  await mkdir(path.join(target, "unrelated-directory"));
  await symlink(path.join(source, "retired-link"), path.join(target, "retired-link"));
  const neighbor = path.join(root, "source", "skills-other", "foreign");
  await fixture(neighbor, "foreign");
  await symlink(neighbor, path.join(target, "foreign"));
  // An existing dangling link for a selected skill must be replaceable with --force.
  await symlink(path.join(source, "missing"), path.join(target, "active"));

  const preview = run(["--target", target, "--force", "--remove-stale"]);
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /remove stale retired-link/i);
  assert.equal(await exists(path.join(target, "retired-link")), true, "preview must not delete links");
  assert.equal(await exists(path.join(target, "_knowledge")), false, "preview must not copy references");

  const install = run(["--target", target, "--force", "--remove-stale", "--write"]);
  assert.equal(install.status, 0, install.stderr);
  assert.equal((await lstat(path.join(target, "active"))).isDirectory(), true);
  assert.equal(await exists(path.join(target, "retired-copy")), false);
  assert.equal(await exists(path.join(target, "retired-link")), false);
  assert.equal(await exists(path.join(target, "custom")), true);
  assert.equal(await exists(path.join(target, "foreign")), true, "a matching path prefix does not establish ownership");
  assert.equal(await exists(path.join(target, "unrelated-directory")), true);
  assert.equal(await readFile(path.join(target, "_knowledge", "reference.md"), "utf8"), "Shared reference\n");

  await writeFile(path.join(target, "_knowledge", "reference.md"), "Local customization\n");
  const preserveKnowledge = run(["--target", target, "--write"]);
  assert.equal(preserveKnowledge.status, 0, preserveKnowledge.stderr);
  assert.equal(await readFile(path.join(target, "_knowledge", "reference.md"), "utf8"), "Local customization\n");
  const replaceKnowledge = run(["--target", target, "--write", "--force"]);
  assert.equal(replaceKnowledge.status, 0, replaceKnowledge.stderr);
  assert.equal(await readFile(path.join(target, "_knowledge", "reference.md"), "utf8"), "Shared reference\n");

  const linkTarget = path.join(root, "symlink-install");
  const link = run(["--target", linkTarget, "--mode", "symlink", "--write"]);
  assert.equal(link.status, 0, link.stderr);
  assert.equal((await lstat(path.join(linkTarget, "active"))).isSymbolicLink(), true);
  assert.match(await readFile(path.join(linkTarget, "active", "SKILL.md"), "utf8"), /name: active/);
  console.log("Skill install and upgrade tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
