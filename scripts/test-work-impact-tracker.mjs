import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  appendRecord,
  createRecord,
  defaultWorklogDir,
  filterRecords,
  formatReport,
  readRecords,
} from "../skills/work-impact-tracker/scripts/work-impact.mjs";

assert.equal(
  defaultWorklogDir({ platform: "darwin", home: "/Users/ada", env: {} }),
  "/Users/ada/Desktop/worklog",
);
assert.equal(
  defaultWorklogDir({ platform: "win32", home: "C:\\Users\\Ada", env: {} }),
  "C:\\Users\\Ada\\Desktop\\worklog",
);

const root = await mkdtemp(path.join(os.tmpdir(), "work-impact-test-"));
try {
  const confirmed = createRecord({
    title: "Reduced checkout failures",
    problem: "Retries duplicated requests",
    contribution: "Added idempotency handling",
    outcome: "Failures fell by 80%",
    evidence: ["PR-123"],
    competency: ["reliability"],
  }, new Date("2026-03-10T12:00:00Z"));
  const draft = createRecord({
    title: "Candidate from Git",
    evidence: [],
    competency: [],
    status: "draft",
  }, new Date("2026-04-02T12:00:00Z"));

  await appendRecord(root, confirmed);
  await appendRecord(root, draft);
  const records = await readRecords(root);

  assert.equal(records.length, 2);
  assert.deepEqual(filterRecords(records, { year: "2026" }).map(({ title }) => title), [
    "Reduced checkout failures",
  ]);
  assert.equal(filterRecords(records, { year: "2026", includeDrafts: true }).length, 2);

  const report = formatReport(filterRecords(records, { year: "2026" }), "2026");
  assert.match(report, /# Work Impact Report 2026/);
  assert.match(report, /Failures fell by 80%/);
  assert.match(report, /PR-123/);
  assert.doesNotMatch(report, /Candidate from Git/);

  const persisted = await readFile(path.join(root, "entries.jsonl"), "utf8");
  assert.equal(persisted.trim().split("\n").length, 2);
  console.log("Work impact tracker tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}
