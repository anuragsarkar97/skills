import { readdir, readFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { parseArgs } from "./skill-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const knowledgeRoot = path.resolve(args.path || "knowledge");
const online = Boolean(args.online);
const issues = [];

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function urlsFrom(content) {
  return [...content.matchAll(/\bhttps?:\/\/[^\s)]+/g)].map((match) => match[0]);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", timeout: 8000 }, (res) => {
      res.resume();
      resolve({ url, statusCode: res.statusCode || 0 });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ url, statusCode: 0, error: "timeout" });
    });
    req.on("error", (error) => resolve({ url, statusCode: 0, error: error.message }));
    req.end();
  });
}

const files = await listMarkdownFiles(knowledgeRoot);
for (const file of files) {
  const relative = path.relative(process.cwd(), file);
  const content = await readFile(file, "utf8");

  if (!/^## Source Notes$/m.test(content)) {
    issues.push(`${relative}: missing "## Source Notes" section`);
  }

  const urls = urlsFrom(content);
  if (!urls.length) {
    issues.push(`${relative}: no source URLs found`);
  }

  if (online) {
    for (const result of await Promise.all(urls.map(checkUrl))) {
      if (result.statusCode < 200 || result.statusCode >= 400) {
        issues.push(`${relative}: source check failed ${result.url} (${result.error || result.statusCode})`);
      }
    }
  }
}

if (issues.length) {
  console.error("Source verification failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Verified ${files.length} knowledge reference file(s)${online ? " with online checks" : ""}.`);
