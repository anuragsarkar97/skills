#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const fields = new Set([
  "title",
  "date",
  "problem",
  "contribution",
  "outcome",
  "evidence",
  "competency",
  "collaborators",
  "status",
  "year",
  "dir",
  "include-drafts",
]);

export function parseArgs(argv) {
  const parsed = { _: [], evidence: [], competency: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }

    const key = token.slice(2);
    if (!fields.has(key)) throw new Error(`Unknown option: --${key}`);
    if (key === "include-drafts") {
      parsed[key] = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    index += 1;
    if (key === "evidence" || key === "competency") parsed[key].push(value);
    else parsed[key] = value;
  }

  return parsed;
}

export function defaultWorklogDir({
  platform = process.platform,
  home = os.homedir(),
  env = process.env,
} = {}) {
  if (env.WORKLOG_DIR) return path.resolve(env.WORKLOG_DIR);
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  return pathApi.join(home, "Desktop", "worklog");
}

export function resolveWorklogDir(args, options) {
  return args.dir ? path.resolve(args.dir) : defaultWorklogDir(options);
}

export async function initializeWorklog(directory) {
  await mkdir(path.join(directory, "reports"), { recursive: true });
  const entriesPath = path.join(directory, "entries.jsonl");
  try {
    await readFile(entriesPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(entriesPath, "", { flag: "wx" });
  }
  return entriesPath;
}

export function createRecord(args, now = new Date()) {
  if (!args.title) throw new Error("--title is required");
  const status = args.status || "confirmed";
  if (!["draft", "confirmed"].includes(status)) {
    throw new Error("--status must be draft or confirmed");
  }

  const date = args.date || now.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("--date must use YYYY-MM-DD");
  }

  return {
    id: randomUUID(),
    date,
    title: args.title,
    problem: args.problem || "",
    contribution: args.contribution || "",
    outcome: args.outcome || "",
    evidence: args.evidence,
    competencies: args.competency,
    collaborators: args.collaborators || "",
    status,
    created_at: now.toISOString(),
  };
}

export async function appendRecord(directory, record) {
  const entriesPath = await initializeWorklog(directory);
  await appendFile(entriesPath, `${JSON.stringify(record)}\n`, "utf8");
  return entriesPath;
}

export async function readRecords(directory) {
  const entriesPath = await initializeWorklog(directory);
  const content = await readFile(entriesPath, "utf8");
  return content
    .split("\n")
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON in ${entriesPath} at line ${index + 1}`);
      }
    });
}

export function filterRecords(records, { year, includeDrafts = false } = {}) {
  return records.filter((record) => {
    if (year && !record.date.startsWith(`${year}-`)) return false;
    return includeDrafts || record.status === "confirmed";
  });
}

function escapeMarkdown(value) {
  return String(value || "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function formatReport(records, year) {
  const lines = [
    `# Work Impact Report ${year}`,
    "",
    `Generated from ${records.length} confirmed record(s).`,
    "",
  ];
  const grouped = new Map();

  for (const record of records) {
    const month = record.date.slice(0, 7);
    if (!grouped.has(month)) grouped.set(month, []);
    grouped.get(month).push(record);
  }

  for (const [month, monthRecords] of [...grouped.entries()].sort()) {
    lines.push(`## ${month}`, "");
    for (const record of monthRecords.sort((a, b) => a.date.localeCompare(b.date))) {
      lines.push(`### ${escapeMarkdown(record.title)}`, "");
      lines.push(`- Date: ${record.date}`);
      if (record.problem) lines.push(`- Problem: ${escapeMarkdown(record.problem)}`);
      if (record.contribution) lines.push(`- Contribution: ${escapeMarkdown(record.contribution)}`);
      if (record.outcome) lines.push(`- Outcome: ${escapeMarkdown(record.outcome)}`);
      if (record.collaborators) lines.push(`- Collaborators: ${escapeMarkdown(record.collaborators)}`);
      if (record.competencies?.length) lines.push(`- Competencies: ${record.competencies.map(escapeMarkdown).join(", ")}`);
      if (record.evidence?.length) lines.push(`- Evidence: ${record.evidence.map(escapeMarkdown).join(", ")}`);
      lines.push("");
    }
  }

  if (records.length === 0) lines.push("No confirmed records found.", "");
  return `${lines.join("\n")}\n`;
}

function printRecords(records) {
  if (records.length === 0) {
    console.log("No matching records found.");
    return;
  }
  for (const record of records) {
    console.log(`${record.date} [${record.status}] ${record.title} (${record.id})`);
  }
}

export async function run(argv, options = {}) {
  const args = parseArgs(argv);
  const command = args._[0];
  const directory = resolveWorklogDir(args, options);

  if (command === "init") {
    const entriesPath = await initializeWorklog(directory);
    console.log(`Initialized worklog: ${entriesPath}`);
    return;
  }

  if (command === "add") {
    const record = createRecord(args, options.now);
    const entriesPath = await appendRecord(directory, record);
    console.log(`Recorded ${record.id}: ${entriesPath}`);
    return;
  }

  if (command === "list") {
    const records = await readRecords(directory);
    printRecords(filterRecords(records, {
      year: args.year,
      includeDrafts: args["include-drafts"],
    }));
    return;
  }

  if (command === "report") {
    const year = args.year || String((options.now || new Date()).getFullYear());
    const records = filterRecords(await readRecords(directory), {
      year,
      includeDrafts: args["include-drafts"],
    });
    const reportPath = path.join(directory, "reports", `appraisal-${year}.md`);
    await writeFile(reportPath, formatReport(records, year), "utf8");
    console.log(`Wrote report: ${reportPath}`);
    return;
  }

  throw new Error("Usage: work-impact.mjs <init|add|list|report> [options]");
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  run(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
