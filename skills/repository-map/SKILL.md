---
name: repository-map
description: Generate and use compact repository context and a semantic file-symbol map for faster cold starts and smaller targeted searches. Use when an AI agent explores an unfamiliar codebase or needs stack, commands, entry points, CI, deployment, migrations, ownership, important files, or public-symbol guidance.
---

# Repository Map

Use this skill to create disposable discovery aids, not replacements for reading source code:

- `project-context.json` identifies stack, commands, entry points, CI, deployment, migrations, ownership, and important files.
- `repo-map.md` identifies the file tree and public or key symbols.

## Workflow

1. Generate or refresh `.skill-context/project-context.json`.
2. Look for `.skill-context/repo-map.md`.
3. Run the map generator with `--check`. If the map is missing or stale, regenerate it.
4. Read both artifacts before broad directory trees or repository-wide symbol searches.
5. Use discovered commands, paths, and symbols for targeted searches and focused reads.
6. Verify behavior against source code before editing; all detection is heuristic.

## Commands

Resolve this skill's directory, then run:

```bash
node <skill-dir>/scripts/repository-map.mjs --path <repository>
node <skill-dir>/scripts/repository-map.mjs --path <repository> --check
node <skill-dir>/scripts/repository-map.mjs --path <repository> --full
node <skill-dir>/scripts/project-context.mjs --path <repository>
```

The default outputs are `<repository>/.skill-context/repo-map.md` and `<repository>/.skill-context/project-context.json`. Use `--out` and the relevant file or symbol bounds for large repositories.

## Regeneration Rules

- In Git repositories, regeneration reads staged, unstaged, renamed, deleted, and untracked paths, then re-extracts affected sections.
- Content hashes verify Git's change hints and catch reverts, branch switches, or incompatible prior maps.
- If incremental verification cannot prove correctness, the generator performs a full rebuild.
- Outside Git repositories, the generator performs a full filesystem scan.
- Universal Ctags is optional. The generator uses it only when `ctags --version` identifies Universal Ctags; incompatible BSD Ctags is ignored.

## Output

Produce both discovery artifacts and use them to guide exploration. Report detected stack, commands, entry points, operational files, map freshness, and any truncation or language-coverage warnings.
