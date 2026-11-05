import { parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const agent = args.agent || "generic";

const base = `Use agent-skill-router to choose a specialized workflow only when it adds task-specific value. Ordinary coding, naming, test writing, concise output, and context management do not need extra skills. Prefer one primary workflow; add another only for a distinct unresolved risk or deliverable.

Read relevant source files directly. Load shared _knowledge references when a concrete domain or stack question needs them. Generate repository maps for broad discovery, and consult decision-memory when revisiting prior rationale.

Complete the authorized task through affected callers and appropriate validation. Do not add approval checkpoints for routine steps already authorized. Respect host permissions and explicit boundaries for external messages, publishing, deployments, and production data.

Challenge unsafe or overbuilt approaches with concrete evidence and the smallest safer alternative.`;

const variants = {
  codex: `# Codex Project Instruction\n\n${base}\n\nWhen editing this repository, run npm test after skill changes and regenerate catalog/graph when inventory, routing, metadata, or references change.`,
  claude: `# Claude Project Instruction\n\n${base}\n\nFor Claude Code, use this as project or global instruction text. Keep answers direct, evidence-based, and action-oriented.`,
  generic: `# Agent Skill Bootstrap\n\n${base}`,
};

console.log(variants[agent] || variants.generic);
