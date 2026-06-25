import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const outputPath = args.out || "CHANGELOG.md";
const write = Boolean(args.write);

function git(argsList) {
  const result = spawnSync("git", argsList, { encoding: "utf8" });
  if (result.status !== 0) return "";
  return result.stdout.trim();
}

const latestTag = args.from || git(["describe", "--tags", "--abbrev=0"]);
const range = latestTag ? `${latestTag}..HEAD` : "HEAD";
const log = git(["log", "--pretty=format:%s", range]);
const commits = log ? log.split("\n").filter(Boolean) : [];
const version = JSON.parse(await readFile("package.json", "utf8")).version || "unreleased";

const groups = new Map([
  ["feat", []],
  ["fix", []],
  ["docs", []],
  ["chore", []],
  ["refactor", []],
  ["test", []],
  ["other", []],
]);

for (const commit of commits) {
  const match = commit.match(/^([a-z]+)(?:\(.+\))?:\s+(.+)$/);
  const type = match?.[1] || "other";
  const message = match?.[2] || commit;
  const group = groups.has(type) ? type : "other";
  groups.get(group).push(message);
}

const lines = [
  "# Changelog",
  "",
  `## ${version}`,
  "",
  latestTag ? `Changes since ${latestTag}.` : "Initial changelog generated from git history.",
  "",
];

for (const [group, messages] of groups) {
  if (!messages.length) continue;
  lines.push(`### ${group}`);
  lines.push("");
  for (const message of messages) lines.push(`- ${message}`);
  lines.push("");
}

if (!commits.length) {
  lines.push("- No commits found in range.");
  lines.push("");
}

const content = `${lines.join("\n")}`;

if (write) {
  await writeFile(outputPath, content);
  console.log(`Wrote ${outputPath}`);
} else {
  process.stdout.write(content);
}
