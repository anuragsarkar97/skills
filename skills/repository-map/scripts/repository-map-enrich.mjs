#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ENRICHMENT_VERSION,
  FILE_COLUMNS,
  initialEnrichmentStatus,
  isHeuristicPurpose,
  loadMapArtifacts,
  needsEnrichment,
  normalizeFileRow,
  resolveOutDir,
  saveFilesCsv,
  updateState,
} from "./map-artifacts.mjs";
import { classifyLayer, classifyRole } from "./repository-map.mjs";

const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_MAX_SNIPPET_LINES = 80;
const MAX_PURPOSE_LENGTH = 240;
const BOOLEAN_FLAGS = new Set(["mock", "include-heuristic"]);
const VALID_ROLES = new Set([
  "test", "migration", "api", "service", "utility", "ui", "tool", "infra", "docs", "config", "entrypoint", "source",
]);
const VALID_LAYERS = new Set([
  "api", "service", "util", "ui", "infra", "test", "docs", "entrypoint", "unknown",
]);

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      args._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = argv[index + 1];
    if (BOOLEAN_FLAGS.has(key)) {
      args[key] = true;
      continue;
    }
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function positiveInteger(value, fallback, flag) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer`);
  }
  return parsed;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function truncateText(value, max = MAX_PURPOSE_LENGTH) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function readSnippet(content, maxLines = DEFAULT_MAX_SNIPPET_LINES) {
  return content.split(/\r?\n/).slice(0, maxLines).join("\n");
}

function parseJsonArray(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("enrichment response did not contain a JSON array");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function validateEnrichment(entry, expectedPaths) {
  if (!entry || typeof entry !== "object") {
    throw new Error("enrichment entry must be an object");
  }
  const filePath = cleanText(entry.path);
  if (!expectedPaths.has(filePath)) {
    throw new Error(`unexpected enrichment path: ${filePath}`);
  }
  const purpose = truncateText(entry.purpose);
  if (!purpose) throw new Error(`missing purpose for ${filePath}`);
  const role = cleanText(entry.role || "");
  const layer = cleanText(entry.layer || "");
  if (role && !VALID_ROLES.has(role)) throw new Error(`invalid role for ${filePath}: ${role}`);
  if (layer && !VALID_LAYERS.has(layer)) throw new Error(`invalid layer for ${filePath}: ${layer}`);
  const tags = Array.isArray(entry.tags)
    ? entry.tags.map(cleanText).filter(Boolean).slice(0, 8)
    : String(entry.tags || "")
      .split(/[;,]/)
      .map(cleanText)
      .filter(Boolean)
      .slice(0, 8);
  return { path: filePath, purpose, role, layer, tags };
}

function buildBatchPrompt(batch, root) {
  const files = batch.map((row) => ({
    path: row.path,
    language: row.language,
    role: row.role,
    layer: row.layer,
    purpose: row.purpose,
    exports: row.exports,
    imports: row.imports,
    snippet: readSnippet(row.content),
  }));
  return [
    "You enrich repository map rows for AI cold starts.",
    "Return ONLY a JSON array. No markdown outside the array.",
    "Each item must include: path, purpose, role, layer, tags.",
    "- purpose: one concise sentence about what the file does in this repo",
    "- role: one of test, migration, api, service, utility, ui, tool, infra, docs, config, entrypoint, source",
    "- layer: one of api, service, util, ui, infra, test, docs, entrypoint, unknown",
    "- tags: array of 1-5 short keywords",
    "",
    `Repository root: ${root}`,
    "",
    JSON.stringify(files, null, 2),
  ].join("\n");
}

function mockEnrichRow(row) {
  const role = classifyRole(row.path);
  const layer = classifyLayer(role);
  const basename = path.basename(row.path);
  const dirname = path.dirname(row.path).replace(/^\.$/, "root");
  const exportHint = row.exports ? ` Exposes ${row.exports.split(";").slice(0, 3).join(", ")}.` : "";
  const purpose = truncateText(
    `${basename} in ${dirname} implements ${role} behavior at the ${layer} layer.${exportHint}`,
  );
  const tags = [
    role,
    layer,
    row.language,
    ...dirname.split("/").filter((part) => part && part !== "."),
  ]
    .filter(Boolean)
    .slice(0, 5);
  return {
    path: row.path,
    purpose,
    role,
    layer,
    tags,
  };
}

async function enrichWithMock(batch) {
  return batch.map((row) => mockEnrichRow(row));
}

async function enrichWithSdk(batch, root) {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is required for AI enrichment (or pass --mock)");
  }
  let Agent;
  try {
    ({ Agent } = await import("@cursor/sdk"));
  } catch {
    throw new Error("@cursor/sdk is not installed. Install it or pass --mock");
  }
  const prompt = buildBatchPrompt(batch, root);
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: process.env.CURSOR_MODEL || "composer-2.5" },
    local: { cwd: root },
  });
  const text = result?.result || result?.output || "";
  const expectedPaths = new Set(batch.map((row) => row.path));
  const parsed = parseJsonArray(text);
  if (!Array.isArray(parsed)) throw new Error("enrichment response was not an array");
  const byPath = new Map();
  for (const entry of parsed) {
    const validated = validateEnrichment(entry, expectedPaths);
    byPath.set(validated.path, validated);
  }
  for (const row of batch) {
    if (!byPath.has(row.path)) {
      throw new Error(`enrichment response missing path: ${row.path}`);
    }
  }
  return [...byPath.values()];
}

function applyEnrichment(row, enrichment, enrichedAt) {
  const next = normalizeFileRow({ ...row });
  next.purpose = truncateText(enrichment.purpose);
  if (enrichment.role) next.role = enrichment.role;
  if (enrichment.layer) next.layer = enrichment.layer;
  next.tags = enrichment.tags.join("; ");
  next.enrichment_status = "enriched";
  next.enriched_at = enrichedAt;
  return next;
}

function selectRows(fileRows, options) {
  const rows = [...fileRows.values()];
  if (options.paths?.length) {
    const wanted = new Set(options.paths);
    return rows.filter((row) => wanted.has(row.path));
  }
  return rows.filter((row) => needsEnrichment(row, { includeHeuristic: options.includeHeuristic }));
}

async function attachContent(rows, root) {
  const enriched = [];
  for (const row of rows) {
    const absolute = path.join(root, row.path);
    const content = await readFile(absolute, "utf8").catch(() => "");
    enriched.push({ ...row, content });
  }
  return enriched;
}

function chunk(items, size) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

export async function enrichRepositoryMap(options) {
  const map = await loadMapArtifacts(options.outDir);
  if (!map) throw new Error("repository map is missing; run repository-map first");

  const candidates = await attachContent(selectRows(map.fileRows, options), options.root);
  if (!candidates.length) {
    console.log("No files need enrichment.");
    return { enriched: 0, pending: 0 };
  }

  const batches = chunk(candidates, options.batchSize);
  const enrichedAt = new Date().toISOString();
  let enrichedCount = 0;

  for (const batch of batches) {
    const results = options.mock
      ? await enrichWithMock(batch)
      : await enrichWithSdk(batch, options.root);
    for (const enrichment of results) {
      const current = map.fileRows.get(enrichment.path);
      if (!current) continue;
      map.fileRows.set(enrichment.path, applyEnrichment(current, enrichment, enrichedAt));
      enrichedCount += 1;
    }
  }

  const saved = await saveFilesCsv(options.outDir, map.fileRows);
  const pending = saved.filter((row) => row.enrichment_status === "pending").length;
  const heuristic = saved.filter((row) => row.enrichment_status === "heuristic").length;
  const enriched = saved.filter((row) => row.enrichment_status === "enriched").length;

  await updateState(options.outDir, {
    enrichmentVersion: ENRICHMENT_VERSION,
    enrichment: {
      enriched,
      heuristic,
      pending,
      lastEnrichedAt: enrichedAt,
      mode: options.mock ? "mock" : "cursor-sdk",
    },
  });

  console.log(
    `Enriched ${enrichedCount} file row(s) in ${path.relative(process.cwd(), options.outDir)} (${options.mock ? "mock" : "cursor-sdk"})`,
  );
  return { enriched: enrichedCount, pending, heuristic, enrichedTotal: enriched };
}

async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv);
    const root = path.resolve(String(args.path || "."));
    const info = await stat(root).catch(() => null);
    if (!info?.isDirectory()) throw new Error(`repository path is not a directory: ${root}`);
  const options = {
      root,
      outDir: resolveOutDir(root, args.out),
      batchSize: positiveInteger(args["batch-size"], DEFAULT_BATCH_SIZE, "--batch-size"),
      mock: Boolean(args.mock),
      includeHeuristic: Boolean(args["include-heuristic"]),
      paths: args._.length ? args._.map((value) => value.split(path.sep).join("/")) : [],
    };
    await enrichRepositoryMap(options);
    return 0;
  } catch (error) {
    console.error(`repository-map-enrich: ${error.message}`);
    return 2;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exitCode = await main();
}

export {
  buildBatchPrompt,
  main,
  mockEnrichRow,
  validateEnrichment,
};
