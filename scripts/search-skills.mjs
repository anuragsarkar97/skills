import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { listSkills, parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const query = args._.join(" ").trim();
const limit = Number(args.limit || 10);

if (!query) {
  console.error("Usage: node scripts/search-skills.mjs <query> [--limit 10]");
  process.exit(1);
}

function tokens(value) {
  return String(value).toLowerCase().match(/[a-z0-9]+/g) || [];
}

function scoreText(queryTokens, text, weight = 1) {
  const textTokens = tokens(text);
  let score = 0;
  for (const token of queryTokens) {
    score += textTokens.filter((textToken) => textToken.includes(token)).length * weight;
  }
  return score;
}

async function listKnowledgeFiles(dir = "knowledge") {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listKnowledgeFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

const queryTokens = tokens(query);
const results = [];

for (const skill of await listSkills("skills")) {
  const score =
    scoreText(queryTokens, skill.name, 6) +
    scoreText(queryTokens, skill.frontmatter.description, 4) +
    scoreText(queryTokens, skill.skillContent, 1);

  if (score > 0) {
    results.push({
      type: "skill",
      name: skill.name,
      path: skill.relativeDir,
      summary: skill.openAi.shortDescription || skill.frontmatter.description,
      score,
    });
  }
}

for (const file of await listKnowledgeFiles()) {
  const content = await readFile(file, "utf8");
  const fileStat = await stat(file);
  if (!fileStat.isFile()) continue;

  const score =
    scoreText(queryTokens, path.basename(file), 5) +
    scoreText(queryTokens, path.dirname(file), 3) +
    scoreText(queryTokens, content, 1);

  if (score > 0) {
    const firstParagraph = content
      .split("\n")
      .find((line) => line.trim() && !line.startsWith("#"))
      ?.trim() || "";
    results.push({
      type: "knowledge",
      name: path.relative("knowledge", file),
      path: file,
      summary: firstParagraph,
      score,
    });
  }
}

results.sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));

for (const result of results.slice(0, limit)) {
  console.log(`[${result.type}] ${result.name}`);
  console.log(`  path: ${result.path}`);
  console.log(`  score: ${result.score}`);
  if (result.summary) console.log(`  ${result.summary}`);
}

if (!results.length) {
  console.log(`No skills or knowledge references matched "${query}".`);
}
