#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , command, ...args] = process.argv;

const commands = {
  audit: ["scripts/audit-skills.mjs"],
  bootstrap: ["scripts/bootstrap-agent.mjs"],
  catalog: ["scripts/generate-catalog.mjs"],
  changelog: ["scripts/generate-changelog.mjs"],
  check: ["scripts/validate-skills.mjs", "&&", "scripts/audit-skills.mjs", "&&", "scripts/run-skill-examples.mjs", "&&", "scripts/evaluate-skills.mjs", "&&", "scripts/verify-sources.mjs"],
  create: ["scripts/create-skill.mjs"],
  duplicates: ["scripts/skill_duplicate_audit.py"],
  examples: ["scripts/run-skill-examples.mjs"],
  evaluate: ["scripts/evaluate-skills.mjs"],
  graph: ["scripts/generate-graph.mjs"],
  import: ["scripts/import-skill.mjs"],
  "index-project": ["scripts/index-project.mjs"],
  install: ["scripts/install-skills.mjs"],
  intake: ["scripts/intake-skill.mjs"],
  "knowledge-index": ["scripts/generate-knowledge-index.mjs"],
  list: ["scripts/list-skills.mjs"],
  "package-all": ["scripts/package-all.sh"],
  "package-claude": ["scripts/package-claude.mjs"],
  "marketplace-manifest": ["scripts/generate-marketplace-manifest.mjs"],
  "refresh-knowledge": ["scripts/refresh-knowledge.mjs"],
  release: ["scripts/release.sh"],
  search: ["scripts/search-skills.mjs"],
  "verify-sources": ["scripts/verify-sources.mjs"],
};

function printHelp() {
  console.log(`Usage: ai-agent-skills <command> [options]

Commands:
  install                 Install skills into Codex, Claude, or a custom target
  list                    List available skills
  check                   Run validation, audit, and prompt examples
  search                  Search skills and knowledge references
  bootstrap               Print agent bootstrap instructions
  audit                   Audit metadata, routing, and catalog quality
  catalog                 Generate skills/catalog.json
  knowledge-index         Generate knowledge/index.json
  changelog               Generate changelog text from git commits
  index-project           Generate .skill-context/project-context.json
  graph                   Generate skills/graph.json and skills/graph.mmd
  package-all             Run the full release packaging flow
  release                 Bump, package, publish, tag, and push a release
  package-claude          Create Claude-ready ZIP bundles in dist/claude
  marketplace-manifest    Generate dist/claude/marketplace-manifest.json
  refresh-knowledge       Create a curated knowledge refresh review plan
  verify-sources          Verify curated knowledge source metadata
  evaluate                Evaluate skill examples and knowledge references
  create                  Create a new local skill scaffold
  import                  Import a skill from a local path or Git URL
  intake                  Quarantine and review an external skill
  examples                Validate implicit prompt examples
  duplicates              Run Python duplicate-skill audit

Examples:
  ai-agent-skills install --agent codex --write
  ai-agent-skills install --agent claude --mode symlink --write
  ai-agent-skills install --agent claude --profile frontend --write
  ai-agent-skills install --agent claude --external git@github.com:org/skills.git#skills/ux-pro --write
  ai-agent-skills search "api auth pagination"
  ai-agent-skills bootstrap --agent claude
  ai-agent-skills package-all
  ai-agent-skills release --patch
  ai-agent-skills package-claude
  ai-agent-skills index-project --path .
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
  for (const scriptPath of [
    "scripts/validate-skills.mjs",
    "scripts/audit-skills.mjs",
    "scripts/run-skill-examples.mjs",
    "scripts/evaluate-skills.mjs",
    "scripts/verify-sources.mjs",
  ]) {
    result = runNodeScript(scriptPath, args);
    if (result.status !== 0) break;
  }
} else if (command === "duplicates") {
  result = spawnSync("python3", [path.join(packageRoot, "scripts/skill_duplicate_audit.py"), ...args], {
    cwd: packageRoot,
    stdio: "inherit",
  });
} else if (command === "package-all") {
  result = spawnSync("bash", [path.join(packageRoot, "scripts/package-all.sh"), ...args], {
    cwd: packageRoot,
    stdio: "inherit",
  });
} else if (command === "release") {
  result = spawnSync("bash", [path.join(packageRoot, "scripts/release.sh"), ...args], {
    cwd: packageRoot,
    stdio: "inherit",
  });
} else {
  result = runNodeScript(script[0], args);
}

process.exit(result.status ?? 1);
