import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractOpenAiMetadata, parseFrontmatter } from "./skill-utils.mjs";

const root = process.cwd();
const skillsDir = path.join(root, "skills");
const entries = await readdir(skillsDir);
const skills = [];

for (const entry of entries.sort()) {
  const skillDir = path.join(skillsDir, entry);
  const entryStat = await stat(skillDir);
  if (!entryStat.isDirectory()) continue;

  const skillFile = path.join(skillDir, "SKILL.md");
  const skillContent = await readFile(skillFile, "utf8");
  const frontmatter = parseFrontmatter(skillContent, path.relative(root, skillFile));

  let openAi = {};
  try {
    const metadata = await readFile(path.join(skillDir, "agents", "openai.yaml"), "utf8");
    openAi = extractOpenAiMetadata(metadata);
  } catch {
    openAi = {};
  }

  skills.push({
    name: frontmatter.name,
    description: frontmatter.description,
    displayName: openAi.displayName || "",
    shortDescription: openAi.shortDescription || "",
    defaultPrompt: openAi.defaultPrompt || "",
    allowImplicitInvocation: Boolean(openAi.allowImplicitInvocation),
  });
}

const catalog = {
  count: skills.length,
  skills,
};

await writeFile(
  path.join(skillsDir, "catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
);

console.log(`Wrote skills/catalog.json with ${skills.length} skill(s).`);
