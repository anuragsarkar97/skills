import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  extractGo,
  extractJavaScript,
  extractPython,
  isUniversalCtagsVersion,
  parseCtagsOutput,
  parseNameStatus,
} from "../skills/repository-map/scripts/repository-map.mjs";

const generator = path.resolve("skills/repository-map/scripts/repository-map.mjs");
const cli = path.resolve("bin/ai-agent-skills.mjs");

function run(command, args, cwd) {
  return spawnSync(command, args, { cwd, encoding: "utf8" });
}

function runGenerator(root, ...args) {
  return run(process.execPath, [generator, "--path", root, ...args], root);
}

function write(relativePath, content, root) {
  const absolute = path.join(root, relativePath);
  return mkdir(path.dirname(absolute), { recursive: true }).then(() => writeFile(absolute, content));
}

assert.deepEqual(
  [...parseNameStatus("M\0a.js\0R100\0old.py\0new.py\0D\0gone.go\0")],
  ["a.js", "old.py", "new.py", "gone.go"],
);
assert.equal(isUniversalCtagsVersion("Universal Ctags 6.1.0"), true);
assert.equal(isUniversalCtagsVersion("usage: ctags [-BFadtuwvx]"), false);
assert.deepEqual(
  parseCtagsOutput('{"name":"Widget","line":12,"kindName":"class","scope":"UI"}\n').map(({ name, kind, line }) => ({ name, kind, line })),
  [{ name: "UI.Widget", kind: "class", line: 12 }],
);

assert.deepEqual(
  extractGo("// Build creates a value.\nfunc Build() {}\nfunc hidden() {}\n").map(({ name, description }) => [name, description]),
  [["Build", "Build creates a value."]],
);
assert.deepEqual(
  extractJavaScript("/** Loads data. */\nexport async function loadData() {}\nfunction hidden() {}\n").map(({ name, description }) => [name, description]),
  [["loadData", "Loads data."]],
);
assert.deepEqual(
  extractJavaScript("function main() {}\nfunction helper() {}\nexport { helper };\n", true).map(({ name }) => name),
  ["main", "helper"],
);
assert.deepEqual(
  extractPython("# Builds a value.\ndef build_value():\n    pass\n\ndef _hidden():\n    pass\n").map(({ name, description }) => [name, description]),
  [["build_value", "Builds a value."]],
);

const root = await mkdtemp(path.join(os.tmpdir(), "repository-map-test-"));
try {
  assert.equal(run("git", ["init", "-q"], root).status, 0);
  assert.equal(run("git", ["config", "user.email", "test@example.com"], root).status, 0);
  assert.equal(run("git", ["config", "user.name", "Repository Map Test"], root).status, 0);

  await write("package.json", JSON.stringify({
    name: "fixture",
    scripts: { test: "node test.js" },
  }, null, 2), root);
  await write("src/main.go", [
    "package main",
    "",
    "// Server starts the application.",
    "type Server struct {}",
    "",
    "// Start begins serving.",
    "func (s *Server) Start() {}",
    "",
    "func hidden() {}",
    "",
  ].join("\n"), root);
  await write("src/routes.ts", [
    "/** Lists users. */",
    "export async function listUsers() {}",
    "router.get('/users', listUsers)",
    "const hidden = () => {}",
    "",
  ].join("\n"), root);
  await write("tools/report.py", [
    "# Creates the report.",
    "def create_report():",
    "    pass",
    "",
    "class Reporter:",
    "    # Writes output.",
    "    def write(self):",
    "        pass",
    "",
  ].join("\n"), root);
  await write("vendor/ignored.py", "def should_not_appear(): pass\n", root);
  await write(".gitignore", ".skill-context/\nvendor/\n", root);

  assert.equal(run("git", ["add", "."], root).status, 0);
  assert.equal(run("git", ["commit", "-qm", "fixture"], root).status, 0);

  const first = runGenerator(root);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /Fully regenerated/);
  const firstMap = await readFile(path.join(root, ".skill-context/repo-map.md"), "utf8");
  assert.match(firstMap, /`Server\.Start` · method/);
  assert.match(firstMap, /`listUsers` · function/);
  assert.match(firstMap, /`GET \/users` · route/);
  assert.match(firstMap, /`Reporter\.write` · method/);
  assert.doesNotMatch(firstMap, /hidden|should_not_appear/);

  const fresh = runGenerator(root, "--check");
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.match(fresh.stdout, /is fresh/);

  const cliResult = run(process.execPath, [cli, "repository-map", "--path", ".", "--out", ".skill-context/cli.md"], root);
  assert.equal(cliResult.status, 0, cliResult.stderr);
  assert.match(await readFile(path.join(root, ".skill-context/cli.md"), "utf8"), /Package: `fixture`/);

  await write("src/routes.ts", [
    "/** Lists active users. */",
    "export async function listUsers() {}",
    "router.get('/users', listUsers)",
    "",
  ].join("\n"), root);
  await rename(path.join(root, "tools/report.py"), path.join(root, "tools/summary.py"));
  await write("src/new.py", "# Returns status.\ndef status():\n    return 'ok'\n", root);
  assert.equal(run("git", ["add", "tools/report.py", "tools/summary.py"], root).status, 0);
  await rm(path.join(root, "src/main.go"));

  const stale = runGenerator(root, "--check");
  assert.equal(stale.status, 1);

  const incremental = runGenerator(root);
  assert.equal(incremental.status, 0, incremental.stderr);
  assert.match(incremental.stdout, /Incrementally regenerated/);
  const incrementalMap = await readFile(path.join(root, ".skill-context/repo-map.md"), "utf8");
  assert.match(incrementalMap, /Lists active users/);
  assert.match(incrementalMap, /tools\/summary\.py/);
  assert.match(incrementalMap, /src\/new\.py/);
  assert.doesNotMatch(incrementalMap, /src\/main\.go|tools\/report\.py/);

  const full = runGenerator(root, "--full");
  assert.equal(full.status, 0, full.stderr);
  const fullMap = await readFile(path.join(root, ".skill-context/repo-map.md"), "utf8");
  assert.equal(incrementalMap, fullMap);

  const limited = runGenerator(root, "--out", ".skill-context/limited.md", "--max-files", "1", "--max-symbols", "1");
  assert.equal(limited.status, 0, limited.stderr);
  const limitedMap = await readFile(path.join(root, ".skill-context/limited.md"), "utf8");
  assert.match(limitedMap, /File scan truncated/);

  console.log("Repository map tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
