import { readFile } from "node:fs/promises";
import path from "node:path";
import { listSkills, pathExists } from "./skill-utils.mjs";

const skills = await listSkills("skills");
const examples = JSON.parse(await readFile("examples/skill-prompts.json", "utf8"));
const exampleNames = new Set(examples.map((example) => example.expectedSkill));
const issues = [];

// Extract all _knowledge/ paths referenced in a SKILL.md body.
function extractKnowledgePaths(content) {
  const matches = [];
  // Matches both installed form (../_knowledge/foo/bar.md) and repo form (../../knowledge/foo/bar.md)
  const re = /(?:\.\.\/_knowledge|(?:\.\.\/)*knowledge)\/([\w/-]+\.md)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

for (const skill of skills) {
  if (!exampleNames.has(skill.name)) {
    issues.push(`${skill.name}: missing prompt example`);
  }

  // Dynamically verify that every _knowledge/ path referenced in a SKILL.md exists on disk.
  const referencedPaths = extractKnowledgePaths(skill.skillContent);
  for (const ref of referencedPaths) {
    const resolved = path.resolve(`knowledge/${ref}`);
    if (!(await pathExists(resolved))) {
      issues.push(`${skill.name}: references missing knowledge file knowledge/${ref}`);
    }
  }
}

for (const required of [
  "knowledge/architecture/principles.md",
  "knowledge/api/api-review.md",
  "knowledge/database/schema-design.md",
  "knowledge/communication/product-communication.md",
  "knowledge/product/startup-pm.md",
  "knowledge/security/security-review.md",
  "knowledge/testing/testing-strategy.md",
]) {
  if (!(await pathExists(path.resolve(required)))) {
    issues.push(`${required}: missing required knowledge pack`);
  }
}

if (issues.length) {
  console.error("Skill evaluation failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Evaluated ${skills.length} skill(s), ${examples.length} example prompt(s), and shared knowledge hooks.`);
