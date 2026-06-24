import { listSkills, parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const skills = await listSkills(args.path || "skills");

if (args.json) {
  console.log(
    JSON.stringify(
      skills.map((skill) => ({
        name: skill.name,
        displayName: skill.openAi.displayName || skill.name,
        description: skill.frontmatter.description,
        defaultPrompt: skill.openAi.defaultPrompt || "",
      })),
      null,
      2,
    ),
  );
} else {
  for (const skill of skills) {
    console.log(`${skill.name} - ${skill.openAi.shortDescription || skill.frontmatter.description}`);
  }
}
