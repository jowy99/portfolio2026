import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectsDir = path.join(process.cwd(), "src", "content", "projects");

const problems = [];
const placeholders = [];

const toPosix = (value) => value.split(path.sep).join("/");

const collectMarkdownFiles = async (dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
};

const readFrontmatter = (raw) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : "";
};

const parseLink = (frontmatter, key) => {
  const regex = new RegExp(`^\\s*${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m");
  return frontmatter.match(regex)?.[1]?.trim() ?? null;
};

const files = await collectMarkdownFiles(projectsDir);

if (files.length === 0) {
  console.error(`Link check failed: no Markdown files found in ${toPosix(path.relative(process.cwd(), projectsDir))}`);
  process.exit(1);
}

for (const fullPath of files) {
  const relativePath = toPosix(path.relative(process.cwd(), fullPath));
  const raw = await readFile(fullPath, "utf8");
  const frontmatter = readFrontmatter(raw);

  const live = parseLink(frontmatter, "live");
  const github = parseLink(frontmatter, "github");
  const links = [
    ["live", live],
    ["github", github],
  ];

  for (const [kind, value] of links) {
    if (!value) {
      continue;
    }

    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        problems.push(`${relativePath}: ${kind} must use https (${value})`);
      }
      if (url.hostname.endsWith("example.com")) {
        placeholders.push(`${relativePath}: ${kind} uses placeholder hostname (${value})`);
      }
      if (kind === "github" && url.hostname !== "github.com") {
        problems.push(`${relativePath}: github link must point to github.com (${value})`);
      }
    } catch {
      problems.push(`${relativePath}: ${kind} is not a valid URL (${value})`);
    }
  }
}

if (problems.length) {
  console.error("Link check failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

if (placeholders.length) {
  console.warn("Link check warnings (placeholders found):");
  for (const warning of placeholders) {
    console.warn(`- ${warning}`);
  }
} else {
  console.log(`Link check passed without placeholders. Files checked: ${files.length}`);
}
