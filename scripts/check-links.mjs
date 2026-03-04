import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectsDir = path.join(process.cwd(), "src", "content", "projects");
const files = (await readdir(projectsDir)).filter((entry) => entry.endsWith(".md"));

const problems = [];
const placeholders = [];

const readFrontmatter = (raw) => {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : "";
};

const parseLink = (frontmatter, key) => {
  const regex = new RegExp(`^\\s*${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, "m");
  return frontmatter.match(regex)?.[1]?.trim() ?? null;
};

for (const file of files) {
  const fullPath = path.join(projectsDir, file);
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
        problems.push(`${file}: ${kind} must use https (${value})`);
      }
      if (url.hostname.endsWith("example.com")) {
        placeholders.push(`${file}: ${kind} uses placeholder hostname (${value})`);
      }
      if (kind === "github" && url.hostname !== "github.com") {
        problems.push(`${file}: github link must point to github.com (${value})`);
      }
    } catch {
      problems.push(`${file}: ${kind} is not a valid URL (${value})`);
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
  console.log("Link check passed without placeholders.");
}
