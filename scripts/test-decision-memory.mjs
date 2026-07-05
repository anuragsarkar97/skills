import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  appendDecision,
  createDecision,
  currentDecisionState,
  readDecisions,
  resolveDecisionFile,
  searchDecisions,
} from "../skills/decision-memory/scripts/decision-memory.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "decision-memory-test-"));
try {
  assert.equal(
    resolveDecisionFile({ path: "." }, root),
    path.join(root, ".skill-context", "decisions.jsonl"),
  );

  const original = createDecision({
    title: "Do not retry payments",
    decision: "Payment creation is not retried",
    rationale: "Retries can duplicate charges",
    context: "Checkout reliability",
    alternative: ["Generic retry middleware"],
    evidence: ["INC-142"],
    tag: ["payments"],
  }, new Date("2026-01-02T03:04:05Z"));
  const replacement = createDecision({
    title: "Use idempotent payment retries",
    decision: "Retry only with an idempotency key",
    rationale: "The provider now guarantees idempotency",
    alternative: [],
    evidence: ["ADR-22"],
    tag: ["payments"],
    supersedes: original.id,
  }, new Date("2026-02-03T03:04:05Z"));

  const filePath = resolveDecisionFile({ path: "." }, root);
  await appendDecision(filePath, original);
  await appendDecision(filePath, replacement);
  const decisions = await readDecisions(filePath);

  assert.equal(decisions.length, 2);
  assert.deepEqual(currentDecisionState(decisions).map(({ current }) => current), [false, true]);
  assert.deepEqual(searchDecisions(decisions, "payment idempotency").map(({ id }) => id), [replacement.id]);
  assert.equal(searchDecisions(decisions, "INC-142")[0].current, false);

  const cliRoot = path.join(root, "cli");
  await mkdir(cliRoot);
  const cli = spawnSync(process.execPath, [
    path.resolve("bin/ai-agent-skills.mjs"),
    "decision-memory",
    "add",
    "--path",
    ".",
    "--title",
    "CLI decision",
    "--decision",
    "Use caller-relative storage",
    "--rationale",
    "Repositories own their decisions",
  ], { cwd: cliRoot, encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(
    await readFile(path.join(cliRoot, ".skill-context", "decisions.jsonl"), "utf8"),
    /CLI decision/,
  );
  console.log("Decision memory tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
