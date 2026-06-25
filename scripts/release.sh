#!/usr/bin/env bash
set -euo pipefail

BUMP="patch"
ACCESS="public"
DRY_RUN=false
PUSH=true
TAG=true

usage() {
  cat <<'EOF'
Usage: scripts/release.sh [options]

Runs an npm release:
  1. Bump package version
  2. Run package-all
  3. Generate changelog
  4. Commit release files
  5. Publish to npm
  6. Create and push a git tag

Options:
  --patch                  Patch release (default)
  --minor                  Minor release
  --major                  Major release
  --bump <type|version>    npm version argument
  --dry-run                Run publish dry-run and skip commit/tag/push
  --no-push                Do not push branch or tags
  --no-tag                 Do not create a git tag
  --access <access>        npm publish access (default: public)
  -h, --help               Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --patch)
      BUMP="patch"
      shift
      ;;
    --minor)
      BUMP="minor"
      shift
      ;;
    --major)
      BUMP="major"
      shift
      ;;
    --bump)
      BUMP="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-push)
      PUSH=false
      shift
      ;;
    --no-tag)
      TAG=false
      shift
      ;;
    --access)
      ACCESS="$2"
      shift 2
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

if [[ "$DRY_RUN" == false ]] && [[ -n "$(git status --porcelain)" ]]; then
  echo "Release requires a clean working tree. Commit or stash changes first." >&2
  exit 1
fi

if [[ "$DRY_RUN" == true ]]; then
  echo "==> Dry-run release using bump: $BUMP"
  npm run skills:package-all
  npm publish --access "$ACCESS" --dry-run
  echo "Dry-run release complete."
  exit 0
fi

echo "==> Packaging and bumping version"
npm run skills:package-all -- --bump "$BUMP"
VERSION="$(node -p "require('./package.json').version")"

echo "==> Generating changelog"
npm run skills:changelog -- --write

echo "==> Committing release v$VERSION"
git add package.json package-lock.json CHANGELOG.md skills/catalog.json skills/graph.json skills/graph.mmd knowledge/index.json
git commit -m "chore: release v$VERSION"

echo "==> Publishing to npm"
npm publish --access "$ACCESS"

if [[ "$TAG" == true ]]; then
  echo "==> Creating tag v$VERSION"
  git tag "v$VERSION"
fi

if [[ "$PUSH" == true ]]; then
  echo "==> Pushing branch and tags"
  git push
  if [[ "$TAG" == true ]]; then
    git push origin "v$VERSION"
  fi
fi

echo "Released v$VERSION."
