#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , command, ...args] = process.argv;

const commands = {
  audit: ["scripts/audit-skills.mjs"],
  catalog: ["scripts/generate-catalog.mjs"],
  check: ["scripts/validate-skills.mjs", "&&", "scripts/audit-skills.mjs", "&&", "scripts/run-skill-examples.mjs"],
  create: ["scripts/create-skill.mjs"],
  duplicates: ["scripts/skill_duplicate_audit.py"],
  examples: ["scripts/run-skill-examples.mjs"],
  graph: ["scripts/generate-graph.mjs"],
  import: ["scripts/import-skill.mjs"],
  install: ["scripts/install-skills.mjs"],
  intake: ["scripts/intake-skill.mjs"],
  list: ["scripts/list-skills.mjs"],
  "package-claude": ["scripts/package-claude.mjs"],
  "marketplace-manifest": ["scripts/generate-marketplace-manifest.mjs"],
};

function printHelp() {
  console.log(`Usage: ai-agent-skills <command> [options]

Commands:
  install                 Install skills into Codex, Claude, or a custom target
  list                    List available skills
  check                   Run validation, audit, and prompt examples
  audit                   Audit metadata, routing, and catalog quality
  catalog                 Generate skills/catalog.json
  graph                   Generate skills/graph.json and skills/graph.mmd
  package-claude          Create Claude-ready ZIP bundles in dist/claude
  marketplace-manifest    Generate dist/claude/marketplace-manifest.json
  create                  Create a new local skill scaffold
  import                  Import a skill from a local path or Git URL
  intake                  Quarantine and review an external skill
  examples                Validate implicit prompt examples
  duplicates              Run Python duplicate-skill audit

Examples:
  ai-agent-skills install --agent codex --write
  ai-agent-skills install --agent claude --mode symlink --write
  ai-agent-skills package-claude
  ai-agent-skills check
`);
}

if (!command || command === "help" || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

const script = commands[command];
if (!script) {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

function runNodeScript(scriptPath, scriptArgs = []) {
  return spawnSync(process.execPath, [path.join(packageRoot, scriptPath), ...scriptArgs], {
    cwd: packageRoot,
    stdio: "inherit",
  });
}

let result;
if (command === "check") {
  for (const scriptPath of ["scripts/validate-skills.mjs", "scripts/audit-skills.mjs", "scripts/run-skill-examples.mjs"]) {
    result = runNodeScript(scriptPath, args);
    if (result.status !== 0) break;
  }
} else if (command === "duplicates") {
  result = spawnSync("python3", [path.join(packageRoot, "scripts/skill_duplicate_audit.py"), ...args], {
    cwd: packageRoot,
    stdio: "inherit",
  });
} else {
  result = runNodeScript(script[0], args);
}

process.exit(result.status ?? 1);
