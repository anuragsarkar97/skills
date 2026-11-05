#!/usr/bin/env bash

# Define the full installer before running it, including when read through a pipe.
main() (
  set -euo pipefail

  installer_agent=codex
  installer_ref=master
  installer_args=(--mode copy --no-external)
  installer_write=true

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --agent|--ref|--target|--profile|--skills)
        if [[ $# -lt 2 || -z "$2" || "$2" == --* ]]; then
          printf 'Missing value for %s\n' "$1" >&2
          return 1
        fi
        case "$1" in
          --agent) installer_agent="$2" ;;
          --ref) installer_ref="$2" ;;
          --target)
            installer_target="$2"
            case "$installer_target" in
              /*) ;;
              *) installer_target="$PWD/$installer_target" ;;
            esac
            installer_args+=(--target "$installer_target")
            ;;
          *) installer_args+=("$1" "$2") ;;
        esac
        shift 2
        ;;
      --dry-run) installer_write=false; shift ;;
      --force) installer_args+=(--force); shift ;;
      -h|--help)
        cat <<'HELP'
Install AI Agent Skills directly from GitHub. Requires Bash, curl, tar, and Node.js 18+.

Usage: bash install.sh [options]
  --agent codex|claude  Agent destination (default: codex)
  --target <path>       Custom destination instead of the agent default
  --ref <ref>           GitHub branch, tag, or commit (default: master)
  --profile <name>      Install a repository profile, such as frontend
  --skills <a,b>        Install selected skills
  --dry-run            Download and preview without changing installed skills
  --force              Replace existing skills and shared knowledge

Installs copies, preserves existing content by default, and skips external skills.
HELP
        return 0
        ;;
      *) printf 'Unknown option: %s (use --help)\n' "$1" >&2; return 1 ;;
    esac
  done

  case "$installer_agent" in
    codex|claude) ;;
    *) printf 'Agent must be codex or claude.\n' >&2; return 1 ;;
  esac
  if [[ ! "$installer_ref" =~ ^[a-zA-Z0-9][a-zA-Z0-9._/-]*$ || "$installer_ref" == *..* ]]; then
    printf 'Invalid GitHub ref. Use a branch, tag, or commit.\n' >&2
    return 1
  fi
  for installer_tool in node curl tar mktemp; do
    if ! command -v "$installer_tool" >/dev/null 2>&1; then
      printf 'Required command not found: %s\n' "$installer_tool" >&2
      return 1
    fi
  done
  node -e 'if (Number(process.versions.node.split(".")[0]) < 18) { console.error("Node.js 18+ is required."); process.exit(1); }'

  installer_tmp="$(mktemp -d "${TMPDIR:-/tmp}/ai-agent-skills.XXXXXXXX")"
  trap 'rm -rf -- "$installer_tmp"' EXIT
  mkdir "$installer_tmp/source"
  printf 'Downloading anuragsarkar97/skills at %s\n' "$installer_ref"
  curl --fail --silent --show-error --location --connect-timeout 15 --max-time 120 --retry 2 \
    "https://codeload.github.com/anuragsarkar97/skills/tar.gz/$installer_ref" \
    --output "$installer_tmp/source.tar.gz"
  tar -xzf "$installer_tmp/source.tar.gz" -C "$installer_tmp/source" --strip-components=1
  if [[ ! -f "$installer_tmp/source/scripts/install-skills.mjs" ]]; then
    printf 'Downloaded archive is missing the skill installer.\n' >&2
    return 1
  fi
  if [[ "$installer_write" == true ]]; then installer_args+=(--write); fi
  cd "$installer_tmp/source"
  node scripts/install-skills.mjs --agent "$installer_agent" "${installer_args[@]}"
)

main "$@"
