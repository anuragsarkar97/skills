import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const SCHEMA_VERSION = 2;
export const EXTRACTOR_VERSION = 2;
export const ENRICHMENT_VERSION = 1;

export const FILE_COLUMNS = [
  "path",
  "hash",
  "language",
  "role",
  "layer",
  "purpose",
  "exports",
  "imports",
  "symbol_count",
  "parser",
  "notable",
  "enrichment_status",
  "enriched_at",
  "tags",
];

export const SYMBOL_COLUMNS = ["path", "name", "kind", "line", "description"];

export const ENRICHMENT_STATUSES = new Set(["pending", "heuristic", "enriched"]);

export function resolveOutDir(root, outArg) {
  const resolved = path.resolve(root, String(outArg || ".skill-context"));
  if (resolved.endsWith(".md") || resolved.endsWith(".csv") || resolved.endsWith(".json")) {
    return path.dirname(resolved);
  }
  return resolved;
}

export function artifactPaths(outDir) {
  return {
    filesCsv: path.join(outDir, "repo-files.csv"),
    symbolsCsv: path.join(outDir, "repo-symbols.csv"),
    stateJson: path.join(outDir, "repo-map.state.json"),
  };
}

export function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function csvRow(columns, record) {
  return columns.map((column) => csvEscape(record[column] ?? "")).join(",");
}

export function serializeCsv(columns, rows) {
  return `${[columns.join(","), ...rows.map((row) => csvRow(columns, row))].join("\n")}\n`;
}

export function parseCsv(content) {
  if (!content?.trim()) return { headers: [], rows: [] };
  const rows = [];
  let headers = null;
  let field = "";
  let row = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    if (headers === null) {
      headers = row;
    } else if (row.length === headers.length) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      rows.push(record);
    }
    row = [];
  };

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (inQuotes) {
      if (char === '"') {
        if (content[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      pushField();
      continue;
    }
    if (char === "\n") {
      pushField();
      pushRow();
      continue;
    }
    if (char === "\r") continue;
    field += char;
  }
  if (field.length || row.length) {
    pushField();
    pushRow();
  }
  return { headers: headers || [], rows };
}

export function normalizeFileRow(row) {
  const normalized = {};
  for (const column of FILE_COLUMNS) {
    normalized[column] = row[column] ?? "";
  }
  if (!normalized.enrichment_status) {
    normalized.enrichment_status = isHeuristicPurpose(normalized.purpose) ? "heuristic" : "pending";
  }
  return normalized;
}

export function isHeuristicPurpose(purpose) {
  return /^Role=/.test(String(purpose || "").trim());
}

export function initialEnrichmentStatus(docstring) {
  return docstring ? "heuristic" : "pending";
}

export function needsEnrichment(row, { includeHeuristic = false } = {}) {
  const status = row.enrichment_status || "pending";
  if (status === "pending") return true;
  if (includeHeuristic && status === "heuristic") return true;
  return false;
}

export async function writeAtomically(filePath, content) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, content);
  await rename(tempPath, filePath);
}

export async function loadMapArtifacts(outDir) {
  const paths = artifactPaths(outDir);
  const stateRaw = await readFile(paths.stateJson, "utf8").catch(() => "");
  if (!stateRaw) return null;
  let state;
  try {
    state = JSON.parse(stateRaw);
  } catch {
    return null;
  }
  const filesContent = await readFile(paths.filesCsv, "utf8").catch(() => "");
  const symbolsContent = await readFile(paths.symbolsCsv, "utf8").catch(() => "");
  const files = parseCsv(filesContent).rows.map(normalizeFileRow);
  const symbols = parseCsv(symbolsContent).rows;
  const fileRows = new Map(files.map((row) => [row.path, row]));
  const symbolRows = new Map();
  for (const row of symbols) {
    if (!symbolRows.has(row.path)) symbolRows.set(row.path, []);
    symbolRows.get(row.path).push(row);
  }
  return { state, paths, fileRows, symbolRows, files, symbols };
}

export async function saveFilesCsv(outDir, fileRows) {
  const paths = artifactPaths(outDir);
  await mkdir(outDir, { recursive: true });
  const rows = [...fileRows.values()].sort((left, right) => left.path.localeCompare(right.path));
  await writeAtomically(paths.filesCsv, serializeCsv(FILE_COLUMNS, rows.map(normalizeFileRow)));
  return rows;
}

export async function updateState(outDir, patch) {
  const existing = await loadMapArtifacts(outDir);
  if (!existing?.state) throw new Error("repo-map.state.json is missing; run repository-map first");
  const state = { ...existing.state, ...patch };
  await writeAtomically(existing.paths.stateJson, `${JSON.stringify(state, null, 2)}\n`);
  return state;
}
