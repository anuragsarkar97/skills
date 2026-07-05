import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildProjectContext } from "../skills/repository-map/scripts/project-context.mjs";

async function write(root, relativePath, content = "") {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

const root = await mkdtemp(path.join(os.tmpdir(), "project-context-test-"));
try {
  await write(root, "package.json", JSON.stringify({
    name: "fixture",
    main: "src/server.ts",
    scripts: { test: "node test.mjs", lint: "eslint ." },
    dependencies: { express: "1.0.0", react: "1.0.0" },
    devDependencies: { typescript: "1.0.0" },
  }));
  await write(root, "src/server.ts", "export function start() {}\n");
  await write(root, ".github/workflows/test.yml", "name: test\n");
  await write(root, "db/migrations/001_init.sql", "create table users(id int);\n");
  await write(root, "Dockerfile", "FROM node:22\n");
  await write(root, ".github/CODEOWNERS", "* @team\n");
  await write(root, "node_modules/ignored.js", "ignored\n");

  const context = await buildProjectContext(root, {
    maxFiles: 100,
    now: new Date("2026-01-02T03:04:05Z"),
  });

  assert.equal(context.generatedAt, "2026-01-02T03:04:05.000Z");
  assert.deepEqual(context.scripts, ["lint", "test"]);
  assert.equal(context.commands.test, "node test.mjs");
  assert.deepEqual(context.stack, ["Node.js", "TypeScript", "React", "Express"]);
  assert.ok(context.entryPoints.includes("src/server.ts"));
  assert.deepEqual(context.ciFiles, [".github/workflows/test.yml"]);
  assert.ok(context.deploymentFiles.includes("Dockerfile"));
  assert.ok(context.migrationPaths.includes("db/migrations"));
  assert.deepEqual(context.ownershipFiles, [".github/CODEOWNERS"]);
  assert.equal(context.fileCountsByExtension[".js"], undefined);

  const cli = spawnSync(process.execPath, [
    path.resolve("bin/ai-agent-skills.mjs"),
    "index-project",
    "--path",
    ".",
  ], { cwd: root, encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  const cliContext = JSON.parse(await readFile(
    path.join(root, ".skill-context", "project-context.json"),
    "utf8",
  ));
  assert.equal(cliContext.package.name, "fixture");
  console.log("Project context tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
