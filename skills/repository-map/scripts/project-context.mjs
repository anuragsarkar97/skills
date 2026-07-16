import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IGNORED_DIRS, shouldSkipPath } from "./ignore-rules.mjs";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (!["path", "out", "max-files"].includes(key)) throw new Error(`Unknown option: --${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

async function pathExists(filePath) {
  return Boolean(await stat(filePath).catch(() => null));
}

const entryPointPattern = /^(src\/)?(main|index|server|app|cmd\/[^/]+\/main)\.(js|jsx|mjs|cjs|ts|tsx|py|go|rs)$/i;
const notablePattern = /^(README|AGENTS|CLAUDE|CODEOWNERS|package|pnpm-lock|yarn\.lock|tsconfig|vite\.config|next\.config|Dockerfile)/i;
const migrationPattern = /(^|\/)(migrations?|db\/migrate|prisma)(\/|$)/i;
const deploymentFilePattern = /(^|\/)(Dockerfile[^/]*|docker-compose[^/]*|compose\.ya?ml)$/i;
const deploymentDirectoryPattern = /^(k8s|kubernetes|helm|terraform|infra)(\/|$)/i;
const ciPattern = /(^|\/)(\.github\/workflows|\.gitlab-ci\.yml|Jenkinsfile|azure-pipelines\.ya?ml|\.circleci)(\/|$)/i;

async function readJsonIfExists(filePath) {
  if (!(await pathExists(filePath))) return null;
  return JSON.parse(await readFile(filePath, "utf8"));
}

function extensionOf(filePath) {
  return path.extname(filePath).toLowerCase() || "[none]";
}

function addUnique(values, value) {
  if (value && !values.includes(value)) values.push(value);
}

function detectNodeStack(packageJson) {
  if (!packageJson) return [];
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const stack = ["Node.js"];
  const signals = [
    ["typescript", "TypeScript"],
    ["react", "React"],
    ["next", "Next.js"],
    ["vue", "Vue"],
    ["@angular/core", "Angular"],
    ["express", "Express"],
    ["fastify", "Fastify"],
    ["nestjs", "NestJS"],
    ["@nestjs/core", "NestJS"],
    ["prisma", "Prisma"],
    ["@prisma/client", "Prisma"],
  ];
  for (const [dependency, label] of signals) {
    if (dependencies[dependency]) addUnique(stack, label);
  }
  return stack;
}

function detectStackFromExtensions(counts) {
  const signals = [
    [[".go"], "Go"],
    [[".py"], "Python"],
    [[".rs"], "Rust"],
    [[".java"], "Java"],
    [[".kt", ".kts"], "Kotlin"],
    [[".cs"], "C#"],
    [[".rb"], "Ruby"],
    [[".tf"], "Terraform"],
    [[".swift"], "Swift"],
  ];
  return signals
    .filter(([extensions]) => extensions.some((extension) => counts[extension]))
    .map(([, label]) => label);
}

function packageEntryPoints(packageJson) {
  if (!packageJson) return [];
  const points = [];
  for (const value of [packageJson.main, packageJson.module]) {
    if (typeof value === "string") addUnique(points, value);
  }
  if (typeof packageJson.bin === "string") addUnique(points, packageJson.bin);
  if (packageJson.bin && typeof packageJson.bin === "object") {
    for (const value of Object.values(packageJson.bin)) addUnique(points, value);
  }
  return points;
}

export async function buildProjectContext(root, {
  maxFiles = 2000,
  now = new Date(),
} = {}) {
  const packageJson = await readJsonIfExists(path.join(root, "package.json"));
  const summary = {
    generatedAt: now.toISOString(),
    root,
    package: packageJson,
    scripts: packageJson?.scripts ? Object.keys(packageJson.scripts).sort() : [],
    commands: packageJson?.scripts || {},
    stack: [],
    entryPoints: packageEntryPoints(packageJson),
    topLevelFiles: [],
    topLevelDirectories: [],
    fileCountsByExtension: {},
    notableFiles: [],
    ciFiles: [],
    deploymentFiles: [],
    migrationPaths: [],
    ownershipFiles: [],
    skills: [],
    warnings: [],
  };
  const state = { seen: 0, truncated: false };

  async function walk(directory) {
    if (state.seen >= maxFiles) {
      state.truncated = true;
      return;
    }
    const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (state.seen >= maxFiles) {
        state.truncated = true;
        return;
      }
      if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(directory, entry.name);
      const relativePath = path.relative(root, fullPath).split(path.sep).join("/");

      if (entry.isDirectory()) {
        if (!relativePath.includes("/")) summary.topLevelDirectories.push(relativePath);
        if (migrationPattern.test(relativePath)) addUnique(summary.migrationPaths, relativePath);
        if (deploymentDirectoryPattern.test(relativePath)) addUnique(summary.deploymentFiles, relativePath);
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (shouldSkipPath(relativePath)) continue;
      state.seen += 1;
      const extension = extensionOf(fullPath);
      summary.fileCountsByExtension[extension] = (summary.fileCountsByExtension[extension] || 0) + 1;

      if (!relativePath.includes("/")) summary.topLevelFiles.push(relativePath);
      if (notablePattern.test(entry.name)) addUnique(summary.notableFiles, relativePath);
      if (entryPointPattern.test(relativePath)) addUnique(summary.entryPoints, relativePath);
      if (ciPattern.test(relativePath)) addUnique(summary.ciFiles, relativePath);
      if (deploymentFilePattern.test(relativePath) || deploymentDirectoryPattern.test(relativePath)) {
        addUnique(summary.deploymentFiles, relativePath);
      }
      if (migrationPattern.test(relativePath)) addUnique(summary.migrationPaths, relativePath);
      if (/CODEOWNERS$/i.test(relativePath)) addUnique(summary.ownershipFiles, relativePath);
    }
  }

  await walk(root);
  summary.stack = [
    ...detectNodeStack(packageJson),
    ...detectStackFromExtensions(summary.fileCountsByExtension),
  ].filter((value, index, values) => values.indexOf(value) === index);

  const skillsDir = path.join(root, "skills");
  if ((await stat(skillsDir).catch(() => null))?.isDirectory()) {
    const entries = await readdir(skillsDir, { withFileTypes: true });
    summary.skills = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  }

  for (const key of [
    "entryPoints",
    "topLevelFiles",
    "topLevelDirectories",
    "notableFiles",
    "ciFiles",
    "deploymentFiles",
    "migrationPaths",
    "ownershipFiles",
  ]) {
    summary[key].sort();
  }

  if (summary.topLevelDirectories.length > 60) {
    summary.warnings.push("Large top-level directory count; load project details selectively.");
  }
  if (state.truncated) summary.warnings.push(`File scan stopped at --max-files ${maxFiles}.`);
  if (summary.entryPoints.length === 0) summary.warnings.push("No likely application entry point detected.");
  if (Object.keys(summary.commands).length === 0) summary.warnings.push("No package scripts detected.");
  return summary;
}

export async function writeProjectContext({
  root,
  out,
  maxFiles = 2000,
  now = new Date(),
}) {
  const summary = await buildProjectContext(root, { maxFiles, now });
  summary.root = path.relative(process.cwd(), root) || ".";
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

export async function runProjectContextCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const root = path.resolve(args.path || ".");
  const out = path.resolve(args.out || path.join(root, ".skill-context", "project-context.json"));
  const maxFiles = Number(args["max-files"] || 2000);
  if (!Number.isInteger(maxFiles) || maxFiles < 1) throw new Error("--max-files must be a positive integer");
  await writeProjectContext({ root, out, maxFiles });
  console.log(`Wrote ${path.relative(process.cwd(), out)}`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  runProjectContextCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
