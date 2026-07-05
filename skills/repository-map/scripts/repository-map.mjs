#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = 1;
const EXTRACTOR_VERSION = 1;
const DEFAULT_MAX_FILES = 2000;
const DEFAULT_MAX_SYMBOLS = 5000;
const DEFAULT_IGNORES = new Set([
  ".git",
  ".hg",
  ".svn",
  ".skill-context",
  ".skill-intake",
  ".next",
  ".turbo",
  ".venv",
  "__pycache__",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "target",
  "vendor",
]);
const BUILTIN_EXTENSIONS = new Set([".go", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".py"]);
const CTAGS_EXTENSIONS = new Set([
  ".c", ".cc", ".cpp", ".cs", ".ex", ".exs", ".h", ".hpp", ".java", ".kt", ".kts",
  ".lua", ".php", ".rb", ".rs", ".scala", ".swift", ".vue",
]);
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
      if (entry.isDirectory() && DEFAULT_IGNORES.has(entry.name)) continue;
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

function escapeMarkdown(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("`", "\\`")
    .trim();
}

function cleanComment(lines) {
  return escapeMarkdown(
    lines
      .map((line) =>
        line
          .replace(/^\s*(?:\/\/\/?|#|\/\*\*?|\*|<!--)\s?/, "")
          .replace(/\s*(?:\*\/|-->)\s*$/, ""),
      )
      .join(" ")
      .trim(),
  );
}

function symbol(name, kind, line, description = "") {
  return { name: escapeMarkdown(name), kind, line, description: escapeMarkdown(description) };
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

function renderFileSection(file, symbols, parser) {
  const metadata = JSON.stringify({
    path: file.path,
    hash: file.hash,
    symbols: symbols.length,
    parser,
  });
  const lines = [
    `<!-- repository-map:file ${metadata} -->`,
    `### \`${file.path}\``,
  ];
  if (!symbols.length) {
    lines.push(`- _No indexed public symbols${parser === "file-only" ? " (file-level mapping only)" : ""}._`);
  } else {
    for (const entry of symbols) {
      const description = entry.description ? ` — ${entry.description}` : "";
      lines.push(`- \`${entry.name}\` · ${entry.kind} · L${entry.line}${description}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

function parseExistingMap(content) {
  if (!content) return null;
  const stateMatch = content.match(/<!-- repository-map:state (.+?) -->/);
  if (!stateMatch) return null;
  let state;
  try {
    state = JSON.parse(stateMatch[1]);
  } catch {
    return null;
  }
  const sections = new Map();
  const pattern = /<!-- repository-map:file (.+?) -->\n[\s\S]*?(?=\n<!-- repository-map:file |\n<!-- repository-map:end -->)/g;
  for (const match of content.matchAll(pattern)) {
    try {
      const metadata = JSON.parse(match[1]);
      sections.set(metadata.path, { metadata, content: `${match[0].trimEnd()}\n` });
    } catch {
      return null;
    }
  }
  return { state, sections };
}

function buildTree(filePaths) {
  const root = {};
  for (const filePath of filePaths) {
    let cursor = root;
    for (const part of filePath.split("/")) {
      cursor[part] ||= {};
      cursor = cursor[part];
    }
  }
  const lines = ["."];
  function visit(node, prefix) {
    const entries = Object.entries(node).sort(([left], [right]) => left.localeCompare(right));
    entries.forEach(([name, child], index) => {
      const last = index === entries.length - 1;
      lines.push(`${prefix}${last ? "└── " : "├── "}${name}`);
      if (Object.keys(child).length) visit(child, `${prefix}${last ? "    " : "│   "}`);
    });
  }
  visit(root, "");
  return lines.join("\n");
}

async function readPackageSignals(root) {
  try {
    const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
    const signals = [];
    if (packageJson.name) signals.push(`Package: \`${escapeMarkdown(packageJson.name)}\``);
    if (packageJson.main) signals.push(`Main: \`${escapeMarkdown(packageJson.main)}\``);
    if (packageJson.bin) {
      const binaries = typeof packageJson.bin === "string" ? [packageJson.bin] : Object.keys(packageJson.bin);
      if (binaries.length) signals.push(`Binaries: ${binaries.map((value) => `\`${escapeMarkdown(value)}\``).join(", ")}`);
    }
    const scripts = Object.keys(packageJson.scripts || {}).sort();
    if (scripts.length) signals.push(`Scripts: ${scripts.map((value) => `\`${escapeMarkdown(value)}\``).join(", ")}`);
    return signals;
  } catch {
    return [];
  }
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
  const candidates = isGit ? gitFiles(root) : await filesystemFiles(root);
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

async function generate(options) {
  const isGit = gitAvailable(options.root);
  const collected = await collectFiles(options.root, options.maxFiles, isGit);
  const files = collected.files;
  const fingerprint = overallFingerprint(files, options);
  const existingContent = await readFile(options.out, "utf8").catch(() => "");
  const existing = parseExistingMap(existingContent);

  if (options.check) {
    const fresh =
      existing?.state?.schema === SCHEMA_VERSION &&
      existing.state.extractor === EXTRACTOR_VERSION &&
      existing.state.fingerprint === fingerprint &&
      existing.state.maxFiles === options.maxFiles &&
      existing.state.maxSymbols === options.maxSymbols;
    if (fresh) {
      console.log(`Repository map is fresh: ${path.relative(process.cwd(), options.out)}`);
      return 0;
    }
    console.error(`Repository map is missing or stale: ${path.relative(process.cwd(), options.out)}`);
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
      const prior = existing.sections.get(file.path);
      if (!prior || prior.metadata.hash !== file.hash) {
        changed.add(file.path);
      } else {
        // The map may already include a worktree change that still differs from HEAD.
        changed.delete(file.path);
      }
    }
    for (const oldPath of existing.sections.keys()) {
      if (!files.some((file) => file.path === oldPath)) changed.add(oldPath);
    }
    mode = "incremental";
  }

  const sections = [];
  let symbolCount = 0;
  let symbolsTruncated = false;
  const coverageWarnings = new Set();
  for (const file of files) {
    const extension = path.extname(file.path).toLowerCase();
    const sourceLike = BUILTIN_EXTENSIONS.has(extension) || CTAGS_EXTENSIONS.has(extension);
    if (!sourceLike) continue;
    const parser = parserFor(file.path, universalCtags);
    if (parser === "file-only") coverageWarnings.add(extension || "[no extension]");
    const prior = existing?.sections.get(file.path);
    const canReuse =
      compatible &&
      !changed.has(file.path) &&
      prior?.metadata?.hash === file.hash &&
      prior.metadata.parser === parser &&
      symbolCount + Number(prior.metadata.symbols || 0) <= options.maxSymbols;
    if (canReuse) {
      sections.push(prior.content);
      symbolCount += Number(prior.metadata.symbols || 0);
      continue;
    }
    let symbols = extractSymbols(file.path, file.content, options.root, universalCtags)
      .sort((left, right) => left.line - right.line || left.name.localeCompare(right.name));
    const remaining = Math.max(0, options.maxSymbols - symbolCount);
    if (symbols.length > remaining) {
      symbols = symbols.slice(0, remaining);
      symbolsTruncated = true;
    }
    symbolCount += symbols.length;
    sections.push(renderFileSection(file, symbols, parser));
  }

  const notableFiles = files
    .map((file) => file.path)
    .filter((filePath) => !filePath.includes("/") && NOTABLE_FILE_PATTERN.test(path.basename(filePath)))
    .sort();
  const packageSignals = await readPackageSignals(options.root);
  const warnings = [];
  if (collected.truncated) warnings.push(`File scan truncated at ${options.maxFiles} of ${collected.totalCandidates} candidate files.`);
  if (symbolsTruncated) warnings.push(`Symbol scan truncated at ${options.maxSymbols} symbols.`);
  if (coverageWarnings.size) {
    warnings.push(`File-level mapping only for: ${[...coverageWarnings].sort().join(", ")}${universalCtags ? "" : " (Universal Ctags not available)"}.`);
  }
  const state = {
    schema: SCHEMA_VERSION,
    extractor: EXTRACTOR_VERSION,
    fingerprint,
    maxFiles: options.maxFiles,
    maxSymbols: options.maxSymbols,
    files: files.length,
    symbols: symbolCount,
  };
  const output = [
    "# Repository Map",
    "",
    `<!-- repository-map:state ${JSON.stringify(state)} -->`,
    "",
    "> Generated cache for navigation. Verify behavior in source before editing.",
    "",
    "## Project Signals",
    "",
    `- Files indexed: ${files.length}`,
    `- Public/key symbols indexed: ${symbolCount}`,
    `- Source fingerprint: \`${fingerprint.slice(0, 16)}\``,
    ...packageSignals.map((signal) => `- ${signal}`),
    ...(notableFiles.length ? [`- Notable files: ${notableFiles.map((value) => `\`${escapeMarkdown(value)}\``).join(", ")}`] : []),
    "",
    "## File Tree",
    "",
    "```text",
    buildTree(files.map((file) => file.path)),
    "```",
    "",
    "## Symbols",
    "",
    ...sections.map((section) => section.trimEnd()),
    "<!-- repository-map:end -->",
    "",
    ...(warnings.length ? ["## Warnings", "", ...warnings.map((warning) => `- ${warning}`), ""] : []),
  ].join("\n");

  await mkdir(path.dirname(options.out), { recursive: true });
  await writeFile(options.out, output);

  const verification = parseExistingMap(output);
  const sectionPaths = new Set(verification?.sections.keys() || []);
  const expectedSourcePaths = files
    .filter((file) => BUILTIN_EXTENSIONS.has(path.extname(file.path).toLowerCase()) || CTAGS_EXTENSIONS.has(path.extname(file.path).toLowerCase()))
    .map((file) => file.path);
  const verified =
    verification?.state?.fingerprint === fingerprint &&
    expectedSourcePaths.every((filePath) => sectionPaths.has(filePath)) &&
    sectionPaths.size === expectedSourcePaths.length;
  if (!verified && mode === "incremental") {
    return generate({ ...options, full: true });
  }
  if (!verified) throw new Error("generated repository map failed verification");

  console.log(`${mode === "incremental" ? "Incrementally regenerated" : "Fully regenerated"} ${path.relative(process.cwd(), options.out)}`);
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
      out: path.resolve(root, String(args.out || ".skill-context/repo-map.md")),
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
  detectUniversalCtags,
  extractGo,
  extractJavaScript,
  extractPython,
  isUniversalCtagsVersion,
  main,
  parseCtagsOutput,
  parseNameStatus,
};
