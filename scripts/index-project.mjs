#!/usr/bin/env node

import { runProjectContextCli } from "../skills/repository-map/scripts/project-context.mjs";

runProjectContextCli().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
