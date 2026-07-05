#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repeatable = new Set(["alternative", "evidence", "tag"]);
const valued = new Set([
  "path",
  "file",
  "title",
  "date",
  "status",
  "context",
  "decision",
  "rationale",
  "alternative",
  "evidence",
  "tag",
  "supersedes",
  "query",
]);

export function parseDecisionArgs(argv) {
  const args = { _: [], alternative: [], evidence: [], tag: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    if (!valued.has(key)) throw new Error(`Unknown option: --${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    index += 1;
    if (repeatable.has(key)) args[key].push(value);
    else args[key] = value;
  }
  return args;
}

export function resolveDecisionFile(args, cwd = process.cwd()) {
  if (args.file) return path.resolve(cwd, args.file);
  return path.join(path.resolve(cwd, args.path || "."), ".skill-context", "decisions.jsonl");
}

export async function initializeDecisionFile(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
  try {
    await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(filePath, "", { flag: "wx" });
  }
  return filePath;
}

export function createDecision(args, now = new Date()) {
  for (const field of ["title", "decision", "rationale"]) {
    if (!args[field]) throw new Error(`--${field} is required`);
  }
  const status = args.status || "accepted";
  if (!["accepted", "proposed"].includes(status)) {
    throw new Error("--status must be accepted or proposed");
  }
  const date = args.date || now.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("--date must use YYYY-MM-DD");
  }
  return {
    id: randomUUID(),
    date,
    status,
    title: args.title,
    context: args.context || "",
    decision: args.decision,
    rationale: args.rationale,
    alternatives: args.alternative,
    evidence: args.evidence,
    tags: args.tag,
    supersedes: args.supersedes || "",
    created_at: now.toISOString(),
  };
}

export async function appendDecision(filePath, decision) {
  await initializeDecisionFile(filePath);
  await appendFile(filePath, `${JSON.stringify(decision)}\n`, "utf8");
  return filePath;
}

export async function readDecisions(filePath) {
  await initializeDecisionFile(filePath);
  const content = await readFile(filePath, "utf8");
  return content
    .split("\n")
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON in ${filePath} at line ${index + 1}`);
      }
    });
}

export function currentDecisionState(decisions) {
  const supersededIds = new Set(decisions.map(({ supersedes }) => supersedes).filter(Boolean));
  return decisions.map((decision) => ({
    ...decision,
    current: !supersededIds.has(decision.id),
  }));
}

export function searchDecisions(decisions, query) {
  const terms = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) throw new Error("--query is required");
  return currentDecisionState(decisions).filter((decision) => {
    const text = [
      decision.title,
      decision.context,
      decision.decision,
      decision.rationale,
      ...(decision.alternatives || []),
      ...(decision.evidence || []),
      ...(decision.tags || []),
    ].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

function printDecisions(decisions) {
  if (decisions.length === 0) {
    console.log("No matching decisions found.");
    return;
  }
  for (const decision of decisions) {
    const state = decision.current === false ? "superseded" : decision.status;
    console.log(`${decision.date} [${state}] ${decision.title} (${decision.id})`);
    console.log(`  Decision: ${decision.decision}`);
    console.log(`  Rationale: ${decision.rationale}`);
    if (decision.evidence?.length) console.log(`  Evidence: ${decision.evidence.join(", ")}`);
  }
}

export async function run(argv, options = {}) {
  const args = parseDecisionArgs(argv);
  const command = args._[0];
  const filePath = resolveDecisionFile(args, options.cwd);

  if (command === "init") {
    await initializeDecisionFile(filePath);
    console.log(`Initialized decision memory: ${filePath}`);
    return;
  }
  if (command === "add") {
    const decision = createDecision(args, options.now);
    await appendDecision(filePath, decision);
    console.log(`Recorded ${decision.id}: ${filePath}`);
    return;
  }

  const decisions = await readDecisions(filePath);
  if (command === "search") {
    printDecisions(searchDecisions(decisions, args.query));
    return;
  }
  if (command === "list") {
    const status = args.status;
    if (status && !["accepted", "proposed", "superseded"].includes(status)) {
      throw new Error("--status must be accepted, proposed, or superseded");
    }
    const current = currentDecisionState(decisions);
    printDecisions(status
      ? current.filter((decision) =>
          status === "superseded" ? !decision.current : decision.current && decision.status === status)
      : current);
    return;
  }
  throw new Error("Usage: decision-memory.mjs <init|add|list|search> [options]");
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  run(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
