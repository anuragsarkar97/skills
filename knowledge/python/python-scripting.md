# Python Scripting Knowledge

Use this reference when writing or reviewing Python scripts for automation, maintenance tasks, data transforms, repo tooling, CLI utilities, and one-off operational helpers.

## Script Shape

- Use `argparse` for command-line interfaces instead of reading positional values ad hoc.
- Put behavior in functions and keep top-level code under `if __name__ == "__main__":`.
- Use `pathlib.Path` for filesystem paths and make input/output paths explicit.
- Prefer standard library modules before adding dependencies for small scripts.
- Return non-zero exit codes for failure and print actionable errors to stderr.

## Safety

- Use `subprocess.run([...], check=True)` with argument lists, not shell strings, unless shell behavior is intentionally required.
- Avoid destructive filesystem operations without a dry-run mode or explicit confirmation.
- Treat environment variables as configuration, not hidden required state; validate required variables at startup.
- Stream large files instead of loading them fully when size is unknown.

## Maintainability

- Use `logging` for scripts that may run in CI or cron; use plain stdout for final machine-readable output.
- Keep JSON/YAML parsing structured; avoid regex for formats with parsers.
- Use type hints for public helpers and complex data shapes.
- Prefer deterministic output ordering for generated files.

## Testing

- Test parsing, transformation, and filesystem behavior separately from CLI argument wiring.
- Use temporary directories for write tests.
- Mock subprocess and network boundaries, not the script's core behavior.

## Source Notes

- argparse documentation: https://docs.python.org/3/library/argparse.html
- pathlib documentation: https://docs.python.org/3/library/pathlib.html
- subprocess documentation: https://docs.python.org/3/library/subprocess.html
- logging documentation: https://docs.python.org/3/library/logging.html
