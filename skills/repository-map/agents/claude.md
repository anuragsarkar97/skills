# Claude Notes

Invoke this skill when entering an unfamiliar repository or when stack, commands, entry points, conventions, files, or public symbols are unclear.

Cold-start rule: read `project-context.json`, then filter `repo-files.csv` rows. Never paste entire CSV maps into context.

For weak rows (`enrichment_status=pending`), orchestrate directory-scoped subagents or run `repository-map-enrich` before broad file reads.
