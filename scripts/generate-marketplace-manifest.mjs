import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { listSkills, parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const skillsDir = args.path || "skills";
const outputDir = path.resolve(args.out || "dist/claude");
const selected = args.skills
  ? new Set(String(args.skills).split(",").map((skill) => skill.trim()).filter(Boolean))
  : null;
const skills = (await listSkills(skillsDir)).filter((skill) => !selected || selected.has(skill.name));

if (selected) {
  for (const skillName of selected) {
    if (!skills.some((skill) => skill.name === skillName)) {
      console.error(`Unknown skill: ${skillName}`);
      process.exit(1);
    }
  }
}

const manifest = {
  name: "ai-agent-skills",
  displayName: "AI Agent Skills",
  description: "Portable engineering skills for Codex, Claude, and other AI coding agents.",
  generatedAt: new Date().toISOString(),
  skillCount: skills.length,
  skills: skills.map((skill) => ({
    name: skill.name,
    displayName: skill.openAi.displayName || skill.name,
    shortDescription: skill.openAi.shortDescription || "",
    description: skill.frontmatter.description,
    defaultPrompt: skill.openAi.defaultPrompt || `Use $${skill.name}.`,
    archive: `${skill.name}.zip`,
    entrypoint: "SKILL.md",
    allowImplicitInvocation: Boolean(skill.openAi.allowImplicitInvocation),
  })),
};

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "marketplace-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), path.join(outputDir, "marketplace-manifest.json"))}`);
