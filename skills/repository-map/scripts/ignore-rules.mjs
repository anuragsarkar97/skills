import path from "node:path";

/** Directories never walked or indexed for repository discovery. */
export const IGNORED_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  ".air",
  ".skill-context",
  ".skill-intake",
  ".next",
  ".nuxt",
  ".turbo",
  ".vercel",
  ".cache",
  ".parcel-cache",
  ".svelte-kit",
  ".output",
  ".expo",
  ".venv",
  "venv",
  "__pycache__",
  ".tox",
  ".gradle",
  "Pods",
  "DerivedData",
  "build",
  "coverage",
  "dist",
  "out",
  "node_modules",
  "target",
  "vendor",
]);

const LOCKFILE_NAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "poetry.lock",
  "composer.lock",
  "Gemfile.lock",
  "go.sum",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".svg",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".mp3", ".mp4", ".wav", ".webm", ".mov",
  ".zip", ".gz", ".tgz", ".bz2", ".xz", ".7z", ".rar",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".exe", ".dll", ".so", ".dylib", ".bin", ".o", ".a", ".class", ".pyc",
  ".wasm", ".map",
]);

const DATA_EXTENSIONS = new Set([".csv", ".tsv", ".parquet", ".avro", ".feather", ".arrow"]);

const DATA_DIR_PATTERN = /(^|\/)(data|datasets|fixtures\/data|testdata|fixtures)(\/|$)/i;

/**
 * True when a relative path should be excluded from repository maps and context walks.
 */
export function shouldSkipPath(relativePath) {
  const normalized = relativePath.split(path.sep).join("/").replace(/^\.\//, "");
  const parts = normalized.split("/");
  if (parts.some((part) => IGNORED_DIRS.has(part))) return true;

  const base = parts.at(-1) || "";
  if (LOCKFILE_NAMES.has(base)) return true;

  const lower = base.toLowerCase();
  if (/\.min\.(js|css)$/.test(lower)) return true;
  if (/\.bundle\.js$/.test(lower)) return true;
  if (/\.generated\./i.test(base)) return true;

  const extension = path.extname(base).toLowerCase();
  if (BINARY_EXTENSIONS.has(extension)) return true;
  if (DATA_EXTENSIONS.has(extension) && DATA_DIR_PATTERN.test(normalized)) return true;

  return false;
}
