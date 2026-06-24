import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const knowledgeRoot = path.resolve(args.path || "knowledge");
const out = path.resolve(args.out || ".skill-intake/knowledge-refresh-plan.md");

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
  return [...content.matchAll(/\bhttps?:\/\/[^\s)]+/g)].map((match) => match[0]);
}

const files = await listMarkdownFiles(knowledgeRoot);
const sections = [
  "# Knowledge Refresh Plan",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "This file is a review queue, not an automatic internet rewrite. Refresh curated knowledge by checking the listed sources, updating only facts that changed, and keeping skill guidance concise.",
  "",
  "## Review Rules",
  "",
  "- Prefer primary sources, official documentation, specifications, and well-maintained project docs.",
  "- Do not copy long source text into skills; summarize the durable rule and keep the URL.",
  "- Record date-sensitive facts with a date.",
  "- Run `npm run skills:verify-sources` and `npm test` after edits.",
  "",
  "## Files",
  "",
];

for (const file of files) {
  const content = await readFile(file, "utf8");
  const urls = urlsFrom(content);
  sections.push(`### ${path.relative(process.cwd(), file)}`);
  sections.push("");
  sections.push("- Status: pending review");
  sections.push(`- Source count: ${urls.length}`);
  for (const url of urls) sections.push(`- ${url}`);
  sections.push("");
}

await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, `${sections.join("\n")}\n`);
console.log(`Wrote ${path.relative(process.cwd(), out)}`);
