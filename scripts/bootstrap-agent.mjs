import { parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const agent = args.agent || "generic";

const base = `Use installed skills proactively. Start substantial engineering, product, review, testing, reliability, documentation, or communication work by selecting the smallest relevant skill set with agent-skill-router. Do not wait for me to name a skill when the task clearly matches an installed skill.

Load shared _knowledge references only when they are relevant to the current task. Prefer critical-thinking before agreeing to risky designs, product-competitive-thinking before product-facing work, product-communication for firm stakeholder messages, incident-response for production issues, and observability-design for telemetry or alerting work.

For my primary stack, use the Go, React, Python scripting, Kubernetes, and AWS/Azure knowledge references when those technologies affect design, implementation, review, tests, or operations.

If a request is an anti-pattern, say no clearly, explain the concrete risk, and propose the smallest safer alternative.`;

const variants = {
  codex: `# Codex Project Instruction\n\n${base}\n\nWhen editing this repository, run npm test after skill changes and regenerate catalog/graph when inventory, routing, metadata, or references change.`,
  claude: `# Claude Project Instruction\n\n${base}\n\nFor Claude Code, use this as project or global instruction text. Keep answers direct, evidence-based, and action-oriented.`,
  generic: `# Agent Skill Bootstrap\n\n${base}`,
};

console.log(variants[agent] || variants.generic);
