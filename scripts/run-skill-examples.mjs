import { readFile } from "node:fs/promises";
import { listSkills, parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const examplesPath = args.file || "examples/skill-prompts.json";
const examples = JSON.parse(await readFile(examplesPath, "utf8"));
const skills = await listSkills(args.path || "skills");
const skillNames = new Set(skills.map((skill) => skill.name));
const covered = new Set();
const errors = [];

for (const [index, example] of examples.entries()) {
  const label = `example ${index + 1}`;
  if (!example.prompt || example.prompt.length < 20) {
    errors.push(`${label}: prompt is too short`);
  }

  if (!skillNames.has(example.expectedSkill)) {
    errors.push(`${label}: unknown expectedSkill ${example.expectedSkill}`);
  } else {
    covered.add(example.expectedSkill);
  }

  for (const companion of example.companionSkills || []) {
    if (!skillNames.has(companion)) {
      errors.push(`${label}: unknown companion skill ${companion}`);
    }
  }

  if (example.implicit !== false && /\$[a-z0-9]+(?:-[a-z0-9]+)*/.test(example.prompt)) {
    errors.push(`${label}: implicit example should not name a $skill explicitly`);
  }
}

for (const skill of skills) {
  if (!covered.has(skill.name)) {
    errors.push(`${skill.name}: missing prompt example`);
  }
}

if (errors.length) {
  console.error("Skill example harness failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${examples.length} skill prompt example(s).`);
