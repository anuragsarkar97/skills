const ansi = {
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  reset: "\u001b[0m",
};

const styles = {
  install: { label: "ADD", color: "green" },
  replace: { label: "UPDATE", color: "cyan" },
  skip: { label: "SKIP", color: "yellow" },
  remove: { label: "REMOVE", color: "red" },
  preserve: { label: "KEEP", color: "yellow" },
};

function paint(value, style, enabled) {
  return enabled ? `${ansi[style]}${value}${ansi.reset}` : value;
}

function operationType(operation) {
  return operation.split(" ", 1)[0];
}

function operationDetail(operation) {
  return operation.slice(operation.indexOf(" ") + 1);
}

function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function shouldUseColor({
  isTTY = process.stdout.isTTY,
  env = process.env,
} = {}) {
  return Boolean(isTTY && !("NO_COLOR" in env) && env.TERM !== "dumb");
}

export function renderInstallHeader({
  write,
  target,
  mode,
  skillCount,
  externalCount,
  color = false,
}) {
  const title = write ? "Installing AI agent skills" : "Previewing AI agent skill installation";
  const total = skillCount + externalCount;
  return [
    "",
    paint(title, "bold", color),
    paint("-".repeat(title.length), "dim", color),
    `${paint("Target", "dim", color)}  ${target}`,
    `${paint("Mode", "dim", color)}    ${write ? mode : `dry run (${mode})`}`,
    `${paint("Plan", "dim", color)}    ${plural(total, "skill")}${externalCount ? ` (${externalCount} external)` : ""}`,
    "",
  ].join("\n");
}

export function renderInstallResult({ operations, write, color = false }) {
  const counts = new Map();
  const lines = operations.map((operation) => {
    const type = operationType(operation);
    const style = styles[type] || { label: "INFO", color: "cyan" };
    counts.set(type, (counts.get(type) || 0) + 1);
    const label = style.label.padEnd(6);
    return `  ${paint(label, style.color, color)} ${operationDetail(operation)}`;
  });

  const changed = (counts.get("install") || 0) + (counts.get("replace") || 0) + (counts.get("remove") || 0);
  const unchanged = (counts.get("skip") || 0) + (counts.get("preserve") || 0);
  const summary = write
    ? `Done. ${plural(changed, "change")} applied${unchanged ? `, ${plural(unchanged, "item")} unchanged` : ""}.`
    : `Preview complete. ${plural(changed, "change")} would be applied${unchanged ? `, ${plural(unchanged, "item")} unchanged` : ""}.`;

  return [
    ...lines,
    "",
    paint(summary, "bold", color),
  ].join("\n");
}
