import assert from "node:assert/strict";
import {
  renderInstallHeader,
  renderInstallResult,
  shouldUseColor,
} from "./install-ui.mjs";

assert.equal(shouldUseColor({ isTTY: true, env: {} }), true);
assert.equal(shouldUseColor({ isTTY: true, env: { NO_COLOR: "" } }), false);
assert.equal(shouldUseColor({ isTTY: true, env: { TERM: "dumb" } }), false);
assert.equal(shouldUseColor({ isTTY: false, env: {} }), false);

const header = renderInstallHeader({
  write: false,
  target: "/tmp/skills",
  mode: "copy",
  skillCount: 3,
  externalCount: 1,
});
assert.match(header, /Previewing AI agent skill installation/);
assert.match(header, /Target\s+\/tmp\/skills/);
assert.match(header, /Mode\s+dry run \(copy\)/);
assert.match(header, /Plan\s+4 skills \(1 external\)/);
assert.doesNotMatch(header, /\u001b/);

const result = renderInstallResult({
  write: true,
  operations: [
    "install alpha as copy",
    "replace beta as copy",
    "skip existing gamma",
    "preserve unmarked stale custom",
  ],
});
assert.match(result, /ADD\s+alpha as copy/);
assert.match(result, /UPDATE\s+beta as copy/);
assert.match(result, /SKIP\s+existing gamma/);
assert.match(result, /KEEP\s+unmarked stale custom/);
assert.match(result, /Done\. 2 changes applied, 2 items unchanged\./);

const colored = renderInstallResult({
  write: false,
  operations: ["remove stale alpha"],
  color: true,
});
assert.match(colored, /\u001b\[31mREMOVE/);
assert.match(colored, /Preview complete\. 1 change would be applied\./);

console.log("Install UI tests passed.");
