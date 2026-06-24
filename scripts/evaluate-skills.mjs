import { readFile } from "node:fs/promises";
import path from "node:path";
import { listSkills, pathExists } from "./skill-utils.mjs";

const skills = await listSkills("skills");
const examples = JSON.parse(await readFile("examples/skill-prompts.json", "utf8"));
const exampleNames = new Set(examples.map((example) => example.expectedSkill));
const issues = [];

for (const skill of skills) {
  if (!exampleNames.has(skill.name)) {
    issues.push(`${skill.name}: missing prompt example`);
  }

  const hasKnowledgeReference = /\.\.\/_knowledge|knowledge\//.test(skill.skillContent);
  if (["agent-skill-router", "critical-thinking", "product-competitive-thinking", "product-communication", "api-review", "database-schema-design", "test-design-review", "design-principles-review"].includes(skill.name) && !hasKnowledgeReference) {
    issues.push(`${skill.name}: expected reference to shared knowledge`);
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
