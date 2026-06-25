import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { listSkills, parseArgs, pathExists } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const knowledgeRoot = path.resolve(args.path || "knowledge");
const outputPath = path.resolve(args.out || "knowledge/index.json");
const existingIndex = await readExistingIndex(outputPath);

async function readExistingIndex(filePath) {
  if (!(await pathExists(filePath))) return new Map();
  const parsed = JSON.parse(await readFile(filePath, "utf8"));
  return new Map((parsed.references || []).map((entry) => [entry.path, entry]));
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function urlsFrom(content) {
  return [...new Set([...content.matchAll(/\bhttps?:\/\/[^\s)]+/g)].map((match) => match[0]))];
}

function titleFrom(content, filePath) {
  return content.match(/^#\s+(.+)$/m)?.[1] || path.basename(filePath, ".md");
}

function summaryFrom(content) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("-")) || "";
}

const skills = await listSkills("skills");
const references = [];

for (const file of await listMarkdownFiles(knowledgeRoot)) {
  const relativePath = path.relative(knowledgeRoot, file);
  const content = await readFile(file, "utf8");
  const previous = existingIndex.get(relativePath) || {};
  const relatedSkills = skills
    .filter((skill) => skill.skillContent.includes(relativePath) || skill.skillContent.includes(`_knowledge/${relativePath}`))
    .map((skill) => skill.name)
    .sort();

  references.push({
    path: relativePath,
    title: titleFrom(content, file),
    summary: summaryFrom(content),
    owner: previous.owner || "maintainers",
    sourceQuality: previous.sourceQuality || "curated",
    refreshCadenceDays: previous.refreshCadenceDays || 90,
    lastReviewed: previous.lastReviewed || null,
    relatedSkills,
    sources: urlsFrom(content),
  });
}

const index = {
  version: 1,
  referenceCount: references.length,
  references,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} with ${references.length} reference(s).`);
