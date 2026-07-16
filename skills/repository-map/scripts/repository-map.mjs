#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IGNORED_DIRS, shouldSkipPath } from "./ignore-rules.mjs";
import {
  SCHEMA_VERSION,
  EXTRACTOR_VERSION,
  FILE_COLUMNS,
  SYMBOL_COLUMNS,
  artifactPaths,
  initialEnrichmentStatus,
  loadMapArtifacts,
  parseCsv,
  resolveOutDir,
  serializeCsv,
  writeAtomically,
} from "./map-artifacts.mjs";

const DEFAULT_MAX_FILES = 2000;
const DEFAULT_MAX_SYMBOLS = 5000;
const MAX_EXPORTS = 12;
const MAX_IMPORTS = 8;
const MAX_PURPOSE_LENGTH = 240;

const BUILTIN_EXTENSIONS = new Set([".go", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".py"]);
const CTAGS_EXTENSIONS = new Set([
  ".c", ".cc", ".cpp", ".cs", ".ex", ".exs", ".h", ".hpp", ".java", ".kt", ".kts",
  ".lua", ".php", ".rb", ".rs", ".scala", ".swift", ".vue",
]);
const LANGUAGE_BY_EXTENSION = {
  ".go": "go",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".py": "python",
  ".rs": "rust",
  ".java": "java",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".rb": "ruby",
  ".php": "php",
  ".swift": "swift",
  ".vue": "vue",
  ".c": "c",
  ".cc": "cpp",
  ".cpp": "cpp",
  ".h": "c",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".lua": "lua",
  ".scala": "scala",
  ".ex": "elixir",
  ".exs": "elixir",
};

const NOTABLE_FILE_PATTERN =
  /^(AGENTS|CLAUDE|CONTRIBUTING|Dockerfile|Makefile|README|go\.mod|package\.json|pyproject\.toml|Cargo\.toml|pom\.xml|build\.gradle|tsconfig.*\.json|vite\.config|next\.config)/i;

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

function run(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function nulFields(output) {
  return output.split("\0").filter(Boolean);
}

function gitAvailable(root) {
  const result = run("git", ["rev-parse", "--is-inside-work-tree"], root);
  return result.status === 0 && result.stdout.trim() === "true";
}

function gitFiles(root) {
  const result = run("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], root);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "git ls-files failed");
  }
  return nulFields(result.stdout).map(normalizeRelativePath);
}

function parseNameStatus(output) {
  const fields = nulFields(output);
  const changed = new Set();
  for (let index = 0; index < fields.length;) {
    const status = fields[index++];
    if (/^[RC]/.test(status)) {
      const oldPath = fields[index++];
      const newPath = fields[index++];
      if (oldPath) changed.add(normalizeRelativePath(oldPath));
      if (newPath) changed.add(normalizeRelativePath(newPath));
    } else {
      const filePath = fields[index++];
      if (filePath) changed.add(normalizeRelativePath(filePath));
    }
  }
  return changed;
}

function gitChangedFiles(root) {
  const changed = new Set();
  const commands = [
    ["diff", "--name-status", "-z", "--find-renames"],
    ["diff", "--cached", "--name-status", "-z", "--find-renames"],
  ];
  for (const args of commands) {
    const result = run("git", args, root);
    if (result.status !== 0) {
      throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
    }
    for (const filePath of parseNameStatus(result.stdout)) changed.add(filePath);
  }
  const untracked = run("git", ["ls-files", "--others", "--exclude-standard", "-z"], root);
  if (untracked.status !== 0) {
    throw new Error(untracked.stderr.trim() || "git untracked-file scan failed");
  }
  for (const filePath of nulFields(untracked.stdout)) changed.add(normalizeRelativePath(filePath));
  return changed;
}

async function filesystemFiles(root) {
  const files = [];
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        files.push(normalizeRelativePath(path.relative(root, absolute)));
      }
    }
  }
  await walk(root);
  return files;
}

function normalizeRelativePath(filePath) {
  return filePath.split(path.sep).join("/").replace(/^\.\//, "");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function shortHash(value) {
  return sha256(value).slice(0, 16);
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanComment(lines) {
  return cleanText(
    lines
      .map((line) =>
        line
          .replace(/^\s*(?:\/\/\/?|#|\/\*\*?|\*|<!--)\s?/, "")
          .replace(/\s*(?:\*\/|-->)\s*$/, ""),
      )
      .join(" "),
  );
}

function truncateText(value, max = MAX_PURPOSE_LENGTH) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function symbol(name, kind, line, description = "") {
  return { name: cleanText(name), kind, line, description: cleanText(description) };
}

function extractGo(content) {
  const lines = content.split(/\r?\n/);
  const symbols = [];
  let comments = [];
  let blockComment = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (blockComment) {
      comments.push(line);
      if (trimmed.includes("*/")) blockComment = false;
      continue;
    }
    if (trimmed.startsWith("/*")) {
      comments = [line];
      blockComment = !trimmed.includes("*/");
      continue;
    }
    if (trimmed.startsWith("//")) {
      comments.push(line);
      continue;
    }
    const functionMatch = line.match(/^\s*func\s+(?:\(([^)]+)\)\s+)?([A-Za-z_]\w*)\s*\(/);
    if (functionMatch) {
      const receiver = functionMatch[1]?.trim().split(/\s+/).at(-1)?.replace(/[*[\]]/g, "");
      const name = functionMatch[2];
      if (/^[A-Z]/.test(name) || name === "main" || name === "init") {
        symbols.push(symbol(receiver ? `${receiver}.${name}` : name, receiver ? "method" : "function", index + 1, cleanComment(comments)));
      }
      comments = [];
      continue;
    }
    const typeMatch = line.match(/^\s*type\s+([A-Za-z_]\w*)\s+(struct|interface|\w+)/);
    if (typeMatch && /^[A-Z]/.test(typeMatch[1])) {
      symbols.push(symbol(typeMatch[1], typeMatch[2] === "interface" ? "interface" : "type", index + 1, cleanComment(comments)));
      comments = [];
      continue;
    }
    if (trimmed) comments = [];
  }
  return symbols;
}

function extractJavaScript(content, includeTopLevel = false) {
  const lines = content.split(/\r?\n/);
  const symbols = [];
  let comments = [];
  let blockComment = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (blockComment) {
      comments.push(line);
      if (trimmed.includes("*/")) blockComment = false;
      continue;
    }
    if (trimmed.startsWith("/**") || trimmed.startsWith("/*")) {
      comments = [line];
      blockComment = !trimmed.includes("*/");
      continue;
    }
    if (trimmed.startsWith("//")) {
      comments.push(line);
      continue;
    }
    const declaration = line.match(
      /^\s*export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(function|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/,
    );
    if (declaration) {
      symbols.push(symbol(declaration[2], declaration[1], index + 1, cleanComment(comments)));
      comments = [];
      continue;
    }
    const topLevel = includeTopLevel
      ? line.match(/^(?:async\s+)?(function|class)\s+([A-Za-z_$][\w$]*)/)
      : null;
    if (topLevel && !topLevel[2].startsWith("_")) {
      symbols.push(symbol(topLevel[2], topLevel[1], index + 1, cleanComment(comments)));
      comments = [];
      continue;
    }
    const commonJs = line.match(/^\s*(?:module\.)?exports\.([A-Za-z_$][\w$]*)\s*=/);
    if (commonJs) {
      symbols.push(symbol(commonJs[1], "export", index + 1, cleanComment(comments)));
      comments = [];
      continue;
    }
    const route = line.match(
      /^\s*(?:app|router|server)\.(get|post|put|patch|delete|options|head|use)\s*\(\s*["'`]([^"'`]+)["'`]/i,
    );
    if (route) {
      symbols.push(symbol(`${route[1].toUpperCase()} ${route[2]}`, "route", index + 1, cleanComment(comments)));
      comments = [];
      continue;
    }
    if (trimmed) comments = [];
  }
  for (const match of content.matchAll(/\bexport\s*\{([\s\S]*?)\}/g)) {
    const startLine = content.slice(0, match.index).split(/\r?\n/).length;
    for (const rawName of match[1].split(",")) {
      const parts = rawName.trim().split(/\s+as\s+/);
      const name = parts.at(-1)?.trim();
      if (!name || !/^[A-Za-z_$][\w$]*$/.test(name)) continue;
      if (!symbols.some((entry) => entry.name === name)) {
        symbols.push(symbol(name, "export", startLine));
      }
    }
  }
  return symbols;
}

function extractPython(content) {
  const lines = content.split(/\r?\n/);
  const symbols = [];
  const classStack = [];
  let comments = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      comments.push(line);
      continue;
    }
    const indent = line.match(/^\s*/)[0].replace(/\t/g, "    ").length;
    while (classStack.length && indent <= classStack.at(-1).indent) classStack.pop();
    const classMatch = line.match(/^(\s*)class\s+([A-Za-z_]\w*)/);
    if (classMatch) {
      const name = classMatch[2];
      if (!name.startsWith("_")) {
        symbols.push(symbol(name, "class", index + 1, cleanComment(comments)));
      }
      classStack.push({ name, indent });
      comments = [];
      continue;
    }
    const functionMatch = line.match(/^(\s*)(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\(/);
    if (functionMatch) {
      const name = functionMatch[2];
      if (!name.startsWith("_") && (indent === 0 || classStack.length)) {
        const owner = classStack.at(-1)?.name;
        symbols.push(symbol(owner ? `${owner}.${name}` : name, owner ? "method" : "function", index + 1, cleanComment(comments)));
      }
      comments = [];
      continue;
    }
    if (trimmed) comments = [];
  }
  return symbols;
}

function isUniversalCtagsVersion(output) {
  return /Universal Ctags/i.test(output);
}

function detectUniversalCtags() {
  const result = run("ctags", ["--version"], process.cwd());
  return result.status === 0 && isUniversalCtagsVersion(result.stdout);
}

function parseCtagsOutput(output) {
  const symbols = [];
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (!entry.name || !entry.line || entry.kind === "file") continue;
      symbols.push(symbol(entry.scope ? `${entry.scope}.${entry.name}` : entry.name, entry.kindName || entry.kind || "symbol", entry.line));
    } catch {
      // Ignore non-JSON diagnostics from optional tooling.
    }
  }
  return symbols;
}

function extractWithCtags(absolutePath) {
  const result = run(
    "ctags",
    ["--output-format=json", "--fields=+nK", "--sort=no", "-f", "-", absolutePath],
    path.dirname(absolutePath),
  );
  return result.status === 0 ? parseCtagsOutput(result.stdout) : [];
}

function extractSymbols(filePath, content, root, universalCtags) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".go") return extractGo(content);
  if ([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"].includes(extension)) {
    const keyScript = /(^|\/)(?:bin|scripts)\//.test(filePath);
    return extractJavaScript(content, keyScript);
  }
  if (extension === ".py") return extractPython(content);
  if (universalCtags && CTAGS_EXTENSIONS.has(extension)) {
    return extractWithCtags(path.join(root, filePath));
  }
  return [];
}

function parserFor(filePath, universalCtags) {
  const extension = path.extname(filePath).toLowerCase();
  if (BUILTIN_EXTENSIONS.has(extension)) return "built-in";
  if (CTAGS_EXTENSIONS.has(extension)) return universalCtags ? "universal-ctags" : "file-only";
  return "file-only";
}

function languageFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (LANGUAGE_BY_EXTENSION[extension]) return LANGUAGE_BY_EXTENSION[extension];
  const base = path.basename(filePath).toLowerCase();
  if (base === "dockerfile" || base.startsWith("dockerfile.")) return "docker";
  if (base === "makefile") return "make";
  if ([".json", ".yaml", ".yml", ".toml", ".md", ".mdx"].includes(extension)) {
    return extension.slice(1);
  }
  return extension ? extension.slice(1) : "unknown";
}

function isSourceLike(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return BUILTIN_EXTENSIONS.has(extension) || CTAGS_EXTENSIONS.has(extension);
}

function isNotablePath(filePath) {
  return NOTABLE_FILE_PATTERN.test(path.basename(filePath));
}

function shouldIndexFile(filePath) {
  if (shouldSkipPath(filePath)) return false;
  return isSourceLike(filePath) || isNotablePath(filePath);
}

function classifyRole(filePath) {
  const normalized = normalizeRelativePath(filePath);
  const base = path.basename(normalized);
  if (/\.(test|spec)\./i.test(base) || /(^|\/)(__tests?__|tests?|specs?)(\/|$)/i.test(normalized)) {
    return "test";
  }
  if (/(^|\/)(migrations?|db\/migrate|prisma)(\/|$)/i.test(normalized)) return "migration";
  if (/(^|\/)(routes?|controllers?|handlers?|api)(\/|$)/i.test(normalized)) return "api";
  if (/(^|\/)(services?|domain)(\/|$)/i.test(normalized)) return "service";
  if (/(^|\/)(utils?|helpers?|lib)(\/|$)/i.test(normalized)) return "utility";
  if (/(^|\/)(components?|hooks)(\/|$)/i.test(normalized)) return "ui";
  if (/(^|\/)(cmd|bin|scripts|tools)(\/|$)/i.test(normalized)) return "tool";
  if (/(^|\/)(k8s|kubernetes|helm|terraform|infra|\.github\/workflows)(\/|$)/i.test(normalized)) {
    return "infra";
  }
  if (/\.(md|mdx|txt)$/i.test(base) || /^(README|AGENTS|CLAUDE|CONTRIBUTING)/i.test(base)) {
    return "docs";
  }
  if (
    /^(Dockerfile|Makefile|package\.json|go\.mod|pyproject\.toml|Cargo\.toml|pom\.xml|build\.gradle|tsconfig)/i.test(base)
    || /\.(json|ya?ml|toml)$/i.test(base)
  ) {
    return "config";
  }
  if (/(^|\/)(main|index|server|app)\./i.test(base) || /(^|\/)cmd\/[^/]+\/main\./i.test(normalized)) {
    return "entrypoint";
  }
  return "source";
}

function classifyLayer(role) {
  switch (role) {
    case "api":
      return "api";
    case "service":
      return "service";
    case "utility":
      return "util";
    case "ui":
      return "ui";
    case "infra":
    case "migration":
    case "config":
    case "tool":
      return "infra";
    case "test":
      return "test";
    case "docs":
      return "docs";
    case "entrypoint":
      return "entrypoint";
    default:
      return "unknown";
  }
}

function extractLeadingPurpose(content, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const lines = content.split(/\r?\n/);

  if (extension === ".py") {
    const docstring = content.match(/^\s*(?:[^\n]*\n)?\s*(?:'''|""")([\s\S]*?)(?:'''|""")/);
    if (docstring?.[1]) return truncateText(docstring[1]);
  }

  let index = 0;
  while (index < lines.length && !lines[index].trim()) index += 1;
  if (extension === ".go" && /^package\s+\w+/.test(lines[index]?.trim() || "")) {
    index += 1;
    while (index < lines.length && !lines[index].trim()) index += 1;
  }
  if (index >= lines.length) return "";

  const commentLines = [];
  const first = lines[index].trim();
  if (first.startsWith("/*") || first.startsWith("/**")) {
    while (index < lines.length) {
      commentLines.push(lines[index]);
      if (lines[index].includes("*/")) break;
      index += 1;
    }
    return truncateText(cleanComment(commentLines));
  }

  if (first.startsWith("//") || first.startsWith("#")) {
    const marker = first.startsWith("//") ? "//" : "#";
    while (index < lines.length) {
      const trimmed = lines[index].trim();
      if (!trimmed.startsWith(marker)) break;
      commentLines.push(lines[index]);
      index += 1;
    }
    return truncateText(cleanComment(commentLines));
  }

  if (extension === ".md" || extension === ".mdx") {
    const heading = lines.find((line) => /^#\s+/.test(line.trim()));
    if (heading) return truncateText(heading.replace(/^#+\s*/, ""));
  }

  return "";
}

function extractImports(content, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const imports = [];
  const seen = new Set();

  function add(value) {
    const cleaned = cleanText(value);
    if (!cleaned || seen.has(cleaned) || imports.length >= MAX_IMPORTS) return;
    seen.add(cleaned);
    imports.push(cleaned);
  }

  if ([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"].includes(extension)) {
    for (const match of content.matchAll(/(?:import|export)\s+(?:[^'"\n]+from\s+)?["']([^"']+)["']/g)) {
      add(match[1]);
    }
    for (const match of content.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
      add(match[1]);
    }
  } else if (extension === ".go") {
    const block = content.match(/\bimport\s*\(([\s\S]*?)\)/);
    if (block) {
      for (const match of block[1].matchAll(/["']([^"']+)["']/g)) add(match[1]);
    }
    for (const match of content.matchAll(/^\s*import\s+(?:\w+\s+)?["']([^"']+)["']/gm)) {
      add(match[1]);
    }
  } else if (extension === ".py") {
    for (const match of content.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm)) {
      add(match[1] || match[2]);
    }
  }

  return imports;
}

function buildPurpose({ docstring, role, exports, imports }) {
  if (docstring) return truncateText(docstring);
  const exportText = exports.slice(0, 5).join(", ");
  const importText = imports.slice(0, 4).join(", ");
  const parts = [`Role=${role}.`];
  if (exportText) parts.push(`Exports ${exportText}.`);
  if (importText) parts.push(`Depends on ${importText}.`);
  if (parts.length === 1) parts.push("No docstring or public exports detected.");
  return truncateText(parts.join(" "));
}

function overallFingerprint(files, options) {
  const payload = [
    `schema=${SCHEMA_VERSION}`,
    `extractor=${EXTRACTOR_VERSION}`,
    `maxFiles=${options.maxFiles}`,
    `maxSymbols=${options.maxSymbols}`,
    ...files.map((file) => `${file.path}\0${file.hash}`),
  ].join("\n");
  return sha256(payload);
}

async function collectFiles(root, maxFiles, isGit) {
  const candidates = (isGit ? gitFiles(root) : await filesystemFiles(root))
    .filter((filePath) => shouldIndexFile(filePath));
  const unique = [...new Set(candidates)].sort();
  const files = [];
  let truncated = false;
  for (const relativePath of unique) {
    if (files.length >= maxFiles) {
      truncated = true;
      break;
    }
    const absolute = path.join(root, relativePath);
    const info = await stat(absolute).catch(() => null);
    if (!info?.isFile()) continue;
    const content = await readFile(absolute).catch(() => null);
    if (!content || content.includes(0)) continue;
    files.push({
      path: relativePath,
      hash: shortHash(content),
      content: content.toString("utf8"),
    });
  }
  return { files, truncated, totalCandidates: unique.length };
}

function analyzeFile(file, root, universalCtags, remainingSymbols) {
  const role = classifyRole(file.path);
  const layer = classifyLayer(role);
  const language = languageFor(file.path);
  const parser = parserFor(file.path, universalCtags);
  const docstring = extractLeadingPurpose(file.content, file.path);
  const imports = extractImports(file.content, file.path);
  let symbols = [];
  if (isSourceLike(file.path)) {
    symbols = extractSymbols(file.path, file.content, root, universalCtags)
      .sort((left, right) => left.line - right.line || left.name.localeCompare(right.name));
  }
  let truncated = false;
  if (symbols.length > remainingSymbols) {
    symbols = symbols.slice(0, remainingSymbols);
    truncated = true;
  }
  const exports = symbols
    .filter((entry) => entry.kind !== "route")
    .map((entry) => entry.name)
    .slice(0, MAX_EXPORTS);
  const purpose = buildPurpose({ docstring, role, exports, imports });
  const fileRow = {
    path: file.path,
    hash: file.hash,
    language,
    role,
    layer,
    purpose,
    exports: exports.join("; "),
    imports: imports.join("; "),
    symbol_count: String(symbols.length),
    parser,
    notable: isNotablePath(file.path) ? "true" : "false",
    enrichment_status: initialEnrichmentStatus(docstring),
    enriched_at: "",
    tags: "",
  };
  const symbolRows = symbols.map((entry) => ({
    path: file.path,
    name: entry.name,
    kind: entry.kind,
    line: String(entry.line),
    description: entry.description,
  }));
  return { fileRow, symbolRows, truncated, parser };
}

async function generate(options) {
  const isGit = gitAvailable(options.root);
  const collected = await collectFiles(options.root, options.maxFiles, isGit);
  const files = collected.files;
  const fingerprint = overallFingerprint(files, options);
  const existing = await loadMapArtifacts(options.outDir);
  const artifacts = artifactPaths(options.outDir);

  if (options.check) {
    const fresh =
      existing?.state?.schema === SCHEMA_VERSION &&
      existing.state.extractor === EXTRACTOR_VERSION &&
      existing.state.fingerprint === fingerprint &&
      existing.state.maxFiles === options.maxFiles &&
      existing.state.maxSymbols === options.maxSymbols;
    if (fresh) {
      console.log(`Repository map is fresh: ${path.relative(process.cwd(), options.outDir)}`);
      return 0;
    }
    console.error(`Repository map is missing or stale: ${path.relative(process.cwd(), options.outDir)}`);
    return 1;
  }

  const universalCtags = detectUniversalCtags();
  const compatible =
    !options.full &&
    existing?.state?.schema === SCHEMA_VERSION &&
    existing.state.extractor === EXTRACTOR_VERSION &&
    existing.state.maxFiles === options.maxFiles &&
    existing.state.maxSymbols === options.maxSymbols;
  let changed = new Set(files.map((file) => file.path));
  let mode = "full";
  if (compatible && isGit) {
    changed = gitChangedFiles(options.root);
    for (const file of files) {
      const prior = existing.fileRows.get(file.path);
      if (!prior || prior.hash !== file.hash) {
        changed.add(file.path);
      } else {
        changed.delete(file.path);
      }
    }
    for (const oldPath of existing.fileRows.keys()) {
      if (!files.some((file) => file.path === oldPath)) changed.add(oldPath);
    }
    mode = "incremental";
  }

  const fileRows = [];
  const symbolRows = [];
  let symbolCount = 0;
  let symbolsTruncated = false;
  const coverageWarnings = new Set();

  for (const file of files) {
    const parser = parserFor(file.path, universalCtags);
    if (isSourceLike(file.path) && parser === "file-only") {
      coverageWarnings.add(path.extname(file.path).toLowerCase() || "[no extension]");
    }
    const priorFile = existing?.fileRows.get(file.path);
    const priorSymbols = existing?.symbolRows.get(file.path) || [];
    const canReuse =
      compatible &&
      !changed.has(file.path) &&
      priorFile?.hash === file.hash &&
      priorFile.parser === parser &&
      symbolCount + Number(priorFile.symbol_count || 0) <= options.maxSymbols;
    if (canReuse) {
      fileRows.push(priorFile);
      symbolRows.push(...priorSymbols);
      symbolCount += Number(priorFile.symbol_count || 0);
      continue;
    }
    const remaining = Math.max(0, options.maxSymbols - symbolCount);
    const analyzed = analyzeFile(file, options.root, universalCtags, remaining);
    if (analyzed.truncated) symbolsTruncated = true;
    symbolCount += analyzed.symbolRows.length;
    fileRows.push(analyzed.fileRow);
    symbolRows.push(...analyzed.symbolRows);
  }

  const warnings = [];
  if (collected.truncated) {
    warnings.push(`File scan truncated at ${options.maxFiles} of ${collected.totalCandidates} candidate files.`);
  }
  if (symbolsTruncated) warnings.push(`Symbol scan truncated at ${options.maxSymbols} symbols.`);
  if (coverageWarnings.size) {
    warnings.push(
      `File-level mapping only for: ${[...coverageWarnings].sort().join(", ")}${universalCtags ? "" : " (Universal Ctags not available)"}.`,
    );
  }

  const state = {
    schema: SCHEMA_VERSION,
    extractor: EXTRACTOR_VERSION,
    fingerprint,
    maxFiles: options.maxFiles,
    maxSymbols: options.maxSymbols,
    files: fileRows.length,
    symbols: symbolCount,
    warnings,
  };

  await mkdir(options.outDir, { recursive: true });
  await writeAtomically(artifacts.filesCsv, serializeCsv(FILE_COLUMNS, fileRows));
  await writeAtomically(artifacts.symbolsCsv, serializeCsv(SYMBOL_COLUMNS, symbolRows));
  await writeAtomically(artifacts.stateJson, `${JSON.stringify(state, null, 2)}\n`);

  const verification = await loadMapArtifacts(options.outDir);
  const verifiedPaths = new Set(verification?.fileRows.keys() || []);
  const expectedPaths = files.map((file) => file.path);
  const verified =
    verification?.state?.fingerprint === fingerprint &&
    expectedPaths.every((filePath) => verifiedPaths.has(filePath)) &&
    verifiedPaths.size === expectedPaths.length &&
    Number(verification.state.symbols) === symbolCount;
  if (!verified && mode === "incremental") {
    return generate({ ...options, full: true });
  }
  if (!verified) throw new Error("generated repository map failed verification");

  console.log(
    `${mode === "incremental" ? "Incrementally regenerated" : "Fully regenerated"} ${path.relative(process.cwd(), options.outDir)}`,
  );
  for (const warning of warnings) console.warn(`Warning: ${warning}`);
  return 0;
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
      maxFiles: positiveInteger(args["max-files"], DEFAULT_MAX_FILES, "--max-files"),
      maxSymbols: positiveInteger(args["max-symbols"], DEFAULT_MAX_SYMBOLS, "--max-symbols"),
      check: Boolean(args.check),
      full: Boolean(args.full),
    };
    return await generate(options);
  } catch (error) {
    console.error(`repository-map: ${error.message}`);
    return 2;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exitCode = await main();
}

export {
  classifyLayer,
  classifyRole,
  detectUniversalCtags,
  extractGo,
  extractImports,
  extractJavaScript,
  extractLeadingPurpose,
  extractPython,
  isUniversalCtagsVersion,
  main,
  parseCtagsOutput,
  parseNameStatus,
  shouldIndexFile,
  shouldSkipPath,
};
