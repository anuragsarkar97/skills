import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs, pathExists } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.path || ".");
const out = path.resolve(args.out || ".skill-context/project-context.json");
const maxFiles = Number(args["max-files"] || 2000);
const ignoredDirs = new Set([
  ".git",
  ".hg",
  ".svn",
  ".air",
  ".skill-context",
  ".skill-intake",
  "coverage",
  "dist",
  "node_modules",
]);

const summary = {
  generatedAt: new Date().toISOString(),
  root: path.relative(process.cwd(), root) || ".",
  package: null,
  scripts: [],
  topLevelFiles: [],
  topLevelDirectories: [],
  fileCountsByExtension: {},
  notableFiles: [],
  skills: [],
  warnings: [],
};

async function readJsonIfExists(filePath) {
  if (!(await pathExists(filePath))) return null;
  return JSON.parse(await readFile(filePath, "utf8"));
}

function extensionOf(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext || "[none]";
}

async function walk(dir, state = { seen: 0 }) {
  if (state.seen >= maxFiles) return;
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    if (state.seen >= maxFiles) return;
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!relativePath.includes(path.sep)) summary.topLevelDirectories.push(relativePath);
      await walk(fullPath, state);
      continue;
    }

    if (!entry.isFile()) continue;
    state.seen += 1;
    const ext = extensionOf(fullPath);
    summary.fileCountsByExtension[ext] = (summary.fileCountsByExtension[ext] || 0) + 1;

    if (!relativePath.includes(path.sep)) summary.topLevelFiles.push(relativePath);
    if (/^(README|AGENTS|CLAUDE|package|pnpm-lock|yarn.lock|tsconfig|vite.config|next.config|Dockerfile)/i.test(entry.name)) {
      summary.notableFiles.push(relativePath);
    }
  }
}

summary.package = await readJsonIfExists(path.join(root, "package.json"));
if (summary.package?.scripts) {
  summary.scripts = Object.keys(summary.package.scripts).sort();
}

const skillsDir = path.join(root, "skills");
if ((await stat(skillsDir).catch(() => null))?.isDirectory()) {
  const entries = await readdir(skillsDir, { withFileTypes: true });
  summary.skills = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."))
    .sort();
}

await walk(root);

if (summary.topLevelDirectories.length > 60) {
  summary.warnings.push("Large top-level directory count; load project details selectively.");
}
if (Object.values(summary.fileCountsByExtension).reduce((sum, count) => sum + count, 0) >= maxFiles) {
  summary.warnings.push(`File scan stopped at --max-files ${maxFiles}.`);
}

await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), out)}`);
