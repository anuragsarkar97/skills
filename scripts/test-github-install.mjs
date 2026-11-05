import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = await mkdtemp(path.join(os.tmpdir(), "github installer test "));
try {
  const script = await readFile("install.sh", "utf8");
  const fixture = path.join(root, "fixture");
  const bin = path.join(root, "bin");
  const scratch = path.join(root, "scratch");
  const project = path.join(root, "project");
  for (const dir of [bin, scratch, project, path.join(fixture, "scripts"), path.join(fixture, "profiles"), path.join(fixture, "knowledge"), path.join(fixture, "skills", "active")]) {
    await mkdir(dir, { recursive: true });
  }
  for (const file of ["install-skills.mjs", "skill-utils.mjs", "install-ui.mjs"]) {
    await cp(path.join("scripts", file), path.join(fixture, "scripts", file));
  }
  await writeFile(path.join(fixture, "skills", "active", "SKILL.md"), "---\nname: active\ndescription: Fixture for testing the GitHub bootstrap installation workflow.\n---\n");
  await writeFile(path.join(fixture, "knowledge", "reference.md"), "Shared reference\n");
  await writeFile(path.join(fixture, "profiles", "frontend.json"), JSON.stringify({ skills: ["active"] }));
  const archive = path.join(root, "source.tar.gz");
  execFileSync("tar", ["-czf", archive, "-C", root, "fixture"]);
  const curl = path.join(bin, "curl");
  await writeFile(curl, `#!/usr/bin/env bash
set -eu
printf '%s\\n' "$@" > "$TEST_CURL_LOG"
if [[ "\${TEST_DOWNLOAD_FAIL:-0}" == 1 ]]; then exit 22; fi
while [[ $# -gt 0 ]]; do
  if [[ "$1" == --output ]]; then cp "$TEST_GITHUB_ARCHIVE" "$2"; exit 0; fi
  shift
done
exit 2
`);
  await chmod(curl, 0o755);
  function run(args, extraEnv = {}) {
    return spawnSync("bash", ["-s", "--", ...args], {
      input: script, cwd: project, encoding: "utf8",
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, TMPDIR: scratch,
        TEST_CURL_LOG: path.join(root, "curl.log"), TEST_GITHUB_ARCHIVE: archive, ...extraEnv },
    });
  }
  const help = run(["--help"]);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--dry-run/);
  assert.notEqual(run(["--mode", "symlink"]).status, 0);
  assert.notEqual(run(["--agent", "unknown"]).status, 0);
  assert.notEqual(run(["--ref"]).status, 0);

  const preview = run(["--target", "installed skills", "--dry-run", "--ref", "v0.2.17"]);
  assert.equal(preview.status, 0, preview.stderr);
  assert.deepEqual(await readdir(project), [], "preview must not install anything");
  assert.match(await readFile(path.join(root, "curl.log"), "utf8"), /\/tar\.gz\/v0\.2\.17/);
  assert.deepEqual(await readdir(scratch), [], "downloads must be cleaned after preview");

  const installArgs = ["--agent", "claude", "--target", "installed skills", "--profile", "frontend"];
  const install = run(installArgs);
  assert.equal(install.status, 0, install.stderr);
  const installed = path.join(project, "installed skills");
  assert.match(await readFile(path.join(installed, "active", "SKILL.md"), "utf8"), /name: active/);
  assert.equal(await readFile(path.join(installed, "_knowledge", "reference.md"), "utf8"), "Shared reference\n");
  await writeFile(path.join(installed, "active", "SKILL.md"), "Local changes\n");
  assert.equal(run(installArgs).status, 0);
  assert.equal(await readFile(path.join(installed, "active", "SKILL.md"), "utf8"), "Local changes\n");
  assert.equal(run([...installArgs, "--force"]).status, 0);
  assert.match(await readFile(path.join(installed, "active", "SKILL.md"), "utf8"), /name: active/);

  const failed = run(["--target", "failed-install"], { TEST_DOWNLOAD_FAIL: "1" });
  assert.notEqual(failed.status, 0);
  assert.deepEqual((await readdir(project)).sort(), ["installed skills"]);
  assert.deepEqual(await readdir(scratch), [], "downloads must be cleaned after failure");
  console.log("GitHub pipe installer tests passed (offline download fixture).");
} finally {
  await rm(root, { recursive: true, force: true });
}
