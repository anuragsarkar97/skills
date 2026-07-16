import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  classifyRole,
  extractGo,
  extractImports,
  extractJavaScript,
  extractLeadingPurpose,
  extractPython,
  isUniversalCtagsVersion,
  parseCtagsOutput,
  parseNameStatus,
  shouldSkipPath,
} from "../skills/repository-map/scripts/repository-map.mjs";
import { needsEnrichment, parseCsv } from "../skills/repository-map/scripts/map-artifacts.mjs";

const generator = path.resolve("skills/repository-map/scripts/repository-map.mjs");
const enricher = path.resolve("skills/repository-map/scripts/repository-map-enrich.mjs");
const cli = path.resolve("bin/ai-agent-skills.mjs");

function run(command, args, cwd) {
  return spawnSync(command, args, { cwd, encoding: "utf8" });
}

function runGenerator(root, ...args) {
  return run(process.execPath, [generator, "--path", root, ...args], root);
}

function runEnricher(root, ...args) {
  return run(process.execPath, [enricher, "--path", root, ...args], root);
}

function write(relativePath, content, root) {
  const absolute = path.join(root, relativePath);
  return mkdir(path.dirname(absolute), { recursive: true }).then(() => writeFile(absolute, content));
}

function csvByPath(content) {
  const { rows } = parseCsv(content);
  return new Map(rows.map((row) => [row.path, row]));
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

assert.equal(shouldSkipPath("node_modules/pkg/index.js"), true);
assert.equal(shouldSkipPath("dist/bundle.js"), true);
assert.equal(shouldSkipPath("package-lock.json"), true);
assert.equal(shouldSkipPath("src/app.min.js"), true);
assert.equal(shouldSkipPath("data/export.csv"), true);
assert.equal(shouldSkipPath("src/main.go"), false);
assert.equal(classifyRole("src/routes/users.ts"), "api");
assert.equal(classifyRole("src/services/billing.go"), "service");
assert.equal(
  extractLeadingPurpose("/** Lists users for the dashboard. */\nexport function listUsers() {}\n", "src/users.ts"),
  "Lists users for the dashboard.",
);
assert.deepEqual(
  extractImports('import { x } from "./local";\nimport express from "express";\n', "src/app.ts"),
  ["./local", "express"],
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
  await write("package-lock.json", "{}\n", root);
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
  await write("node_modules/pkg/index.js", "export const noise = 1;\n", root);
  await write("dist/out.js", "export const built = 1;\n", root);
  await write(".gitignore", ".skill-context/\nvendor/\nnode_modules/\ndist/\n", root);

  assert.equal(run("git", ["add", "."], root).status, 0);
  assert.equal(run("git", ["commit", "-qm", "fixture"], root).status, 0);

  const first = runGenerator(root);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /Fully regenerated/);

  const filesCsv = await readFile(path.join(root, ".skill-context/repo-files.csv"), "utf8");
  const symbolsCsv = await readFile(path.join(root, ".skill-context/repo-symbols.csv"), "utf8");
  const state = JSON.parse(await readFile(path.join(root, ".skill-context/repo-map.state.json"), "utf8"));
  const files = csvByPath(filesCsv);
  const symbols = parseCsv(symbolsCsv).rows;

  assert.equal(state.schema, 2);
  assert.ok(files.has("src/main.go"));
  assert.ok(files.has("src/routes.ts"));
  assert.ok(files.has("tools/report.py"));
  assert.ok(files.has("package.json"));
  assert.equal(files.get("src/main.go").purpose.includes("Server starts the application"), true);
  assert.equal(files.get("src/routes.ts").role, "source");
  assert.equal(files.get("src/routes.ts").purpose.includes("Lists users"), true);
  assert.equal(files.get("tools/report.py").role, "tool");
  assert.equal(files.get("package.json").enrichment_status, "pending");
  assert.equal(needsEnrichment(files.get("package.json")), true);
  assert.equal(files.get("src/routes.ts").enrichment_status, "heuristic");
  assert.doesNotMatch(filesCsv, /vendor\/ignored|node_modules|dist\/out|package-lock/);
  assert.ok(symbols.some((row) => row.name === "Server.Start" && row.kind === "method"));
  assert.ok(symbols.some((row) => row.name === "listUsers" && row.kind === "function"));
  assert.ok(symbols.some((row) => row.name === "GET /users" && row.kind === "route"));
  assert.ok(symbols.some((row) => row.name === "Reporter.write" && row.kind === "method"));
  assert.ok(!symbols.some((row) => /hidden|should_not_appear/.test(row.name)));

  const fresh = runGenerator(root, "--check");
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.match(fresh.stdout, /is fresh/);

  const cliResult = run(process.execPath, [cli, "repository-map", "--path", ".", "--out", ".skill-context/cli-out"], root);
  assert.equal(cliResult.status, 0, cliResult.stderr);
  const cliFiles = await readFile(path.join(root, ".skill-context/cli-out/repo-files.csv"), "utf8");
  assert.match(cliFiles, /package\.json/);

  const enrichCli = run(process.execPath, [cli, "repository-map-enrich", "--path", ".", "--mock", "package.json"], root);
  assert.equal(enrichCli.status, 0, enrichCli.stderr);
  assert.match(enrichCli.stdout, /Enriched 1 file row/);

  const enrich = runEnricher(root, "--mock", "--include-heuristic");
  assert.equal(enrich.status, 0, enrich.stderr);
  assert.match(enrich.stdout, /Enriched/);
  const enrichedCsv = await readFile(path.join(root, ".skill-context/repo-files.csv"), "utf8");
  const enrichedFiles = csvByPath(enrichedCsv);
  const enrichedState = JSON.parse(await readFile(path.join(root, ".skill-context/repo-map.state.json"), "utf8"));
  assert.equal(enrichedFiles.get("package.json").enrichment_status, "enriched");
  assert.ok(enrichedFiles.get("package.json").tags.includes("config"));
  assert.ok(enrichedState.enrichment?.enriched >= 1);

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
  const incrementalFiles = await readFile(path.join(root, ".skill-context/repo-files.csv"), "utf8");
  const incrementalSymbols = await readFile(path.join(root, ".skill-context/repo-symbols.csv"), "utf8");
  assert.match(incrementalFiles, /Lists active users/);
  assert.match(incrementalFiles, /tools\/summary\.py/);
  assert.match(incrementalFiles, /src\/new\.py/);
  assert.doesNotMatch(incrementalFiles, /src\/main\.go|tools\/report\.py/);
  assert.match(incrementalSymbols, /listUsers/);
  const incrementalRows = csvByPath(incrementalFiles);
  assert.equal(incrementalRows.get("src/routes.ts").enrichment_status, "heuristic");
  assert.equal(incrementalRows.get("package.json").enrichment_status, "enriched");

  const full = runGenerator(root, "--full");
  assert.equal(full.status, 0, full.stderr);
  const fullFiles = await readFile(path.join(root, ".skill-context/repo-files.csv"), "utf8");
  const fullSymbols = await readFile(path.join(root, ".skill-context/repo-symbols.csv"), "utf8");
  const fullRows = csvByPath(fullFiles);
  assert.equal(fullRows.get("package.json").enrichment_status, "pending");
  assert.equal(incrementalSymbols, fullSymbols);

  const limited = runGenerator(root, "--out", ".skill-context/limited", "--max-files", "1", "--max-symbols", "1");
  assert.equal(limited.status, 0, limited.stderr);
  const limitedState = JSON.parse(await readFile(path.join(root, ".skill-context/limited/repo-map.state.json"), "utf8"));
  assert.ok(limitedState.warnings.some((warning) => /File scan truncated/.test(warning)));

  console.log("Repository map tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
