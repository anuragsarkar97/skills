import { writeFile } from "node:fs/promises";
import path from "node:path";
import { extractSkillReferences, listSkills, parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const skillsDir = args.path || "skills";
const skills = await listSkills(skillsDir);
const skillNames = skills.map((skill) => skill.name);
const skillNameSet = new Set(skillNames);

const nodes = skills.map((skill) => ({
  id: skill.name,
  displayName: skill.openAi.displayName || skill.name,
  description: skill.frontmatter.description,
  allowImplicitInvocation: Boolean(skill.openAi.allowImplicitInvocation),
}));

const edgeKeys = new Set();
const edges = [];

for (const skill of skills) {
  const referenced = extractSkillReferences(skill.skillContent, skillNames);
  for (const target of referenced) {
    if (target === skill.name || !skillNameSet.has(target)) continue;
    const key = `${skill.name}->${target}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    edges.push({ from: skill.name, to: target, reason: "mentions" });
  }
}

const graph = {
  count: nodes.length,
  nodes,
  edges: edges.sort((left, right) => `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`)),
};

const outputDir = path.resolve(skillsDir);
await writeFile(path.join(outputDir, "graph.json"), `${JSON.stringify(graph, null, 2)}\n`);

const mermaid = [
  "graph TD",
  ...graph.edges.map((edge) => `  ${edge.from.replaceAll("-", "_")}["${edge.from}"] --> ${edge.to.replaceAll("-", "_")}["${edge.to}"]`),
  "",
].join("\n");

await writeFile(path.join(outputDir, "graph.mmd"), mermaid);
console.log(`Wrote skills graph with ${nodes.length} node(s) and ${edges.length} edge(s).`);
