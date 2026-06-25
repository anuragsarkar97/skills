#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="dist/release"
CLAUDE_OUT="dist/claude"
PACK_TARBALL=false
RUN_ONLINE_SOURCE_CHECK=false
VERSION_BUMP=""

usage() {
  cat <<'EOF'
Usage: scripts/package-all.sh [options]

Runs the full local release packaging flow:
  1. Validate skills, examples, evaluation hooks, and source metadata
  2. Generate skills/catalog.json
  3. Generate skills/graph.json and skills/graph.mmd
  4. Generate knowledge/index.json
  5. Package Claude ZIP bundles and marketplace manifest
  6. Run npm pack --dry-run

Options:
  --out <dir>               Release output directory for optional tarball copy (default: dist/release)
  --claude-out <dir>        Claude bundle output directory (default: dist/claude)
  --bump <type|version>     Run npm version before packaging (patch, minor, major, or exact version)
  --patch                   Shortcut for --bump patch
  --minor                   Shortcut for --bump minor
  --major                   Shortcut for --bump major
  --pack-tarball            Also create the npm .tgz package and copy it to --out
  --online-source-check     Verify source URLs with network HEAD requests
  -h, --help                Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)
      OUT_DIR="$2"
      shift 2
      ;;
    --claude-out)
      CLAUDE_OUT="$2"
      shift 2
      ;;
    --bump)
      VERSION_BUMP="$2"
      shift 2
      ;;
    --patch)
      VERSION_BUMP="patch"
      shift
      ;;
    --minor)
      VERSION_BUMP="minor"
      shift
      ;;
    --major)
      VERSION_BUMP="major"
      shift
      ;;
    --pack-tarball)
      PACK_TARBALL=true
      shift
      ;;
    --online-source-check)
      RUN_ONLINE_SOURCE_CHECK=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -n "$VERSION_BUMP" ]]; then
  echo "==> Bumping package version ($VERSION_BUMP)"
  npm version "$VERSION_BUMP" --no-git-tag-version
fi

echo "==> Running skill checks"
npm run skills:check

if [[ "$RUN_ONLINE_SOURCE_CHECK" == true ]]; then
  echo "==> Running online source checks"
  npm run skills:verify-sources -- --online
fi

echo "==> Generating catalog"
npm run skills:catalog

echo "==> Generating graph"
npm run skills:graph

echo "==> Generating knowledge index"
npm run skills:knowledge-index

echo "==> Packaging Claude bundles"
npm run skills:package-claude -- --out "$CLAUDE_OUT"

echo "==> Verifying npm package"
npm pack --dry-run --silent

if [[ "$PACK_TARBALL" == true ]]; then
  echo "==> Creating npm tarball"
  mkdir -p "$OUT_DIR"
  TARBALL="$(npm pack --silent)"
  mv "$TARBALL" "$OUT_DIR/"
  echo "Created $OUT_DIR/$TARBALL"
fi

echo "Package flow complete."
