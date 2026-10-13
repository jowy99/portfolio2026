import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const rootDir = path.resolve(process.cwd());
const baselinePath = path.join(rootDir, "scripts", "content-integrity.baseline.json");
const stringsPath = path.join(rootDir, "src", "i18n", "strings.ts");
const projectsDir = path.join(rootDir, "src", "content", "projects");
const tempDir = path.join(rootDir, ".astro");
const updateBaseline = process.argv.includes("--update");

const toPosix = (value) => value.split(path.sep).join("/");

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

const collectFiles = async (dirPath, predicate) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, predicate)));
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
};

const loadStrings = async () => {
  const source = await fs.readFile(stringsPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: stringsPath,
  });

  await fs.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, "tmp-content-integrity-strings.mjs");
  await fs.writeFile(tempPath, transpiled.outputText, "utf8");

  try {
    const moduleUrl = `${pathToFileURL(tempPath).href}?v=${Date.now()}`;
    const mod = await import(moduleUrl);
    return mod.strings;
  } finally {
    await fs.unlink(tempPath).catch(() => undefined);
  }
};

const buildStringEntries = async () => {
  const strings = await loadStrings();
  const entries = {};

  for (const [locale, localeStrings] of Object.entries(strings)) {
    const record = {};
    for (const [key, value] of Object.entries(localeStrings)) {
      record[key] = hash(stableStringify(value));
    }
    entries[locale] = record;
  }

  return entries;
};

const buildProjectEntries = async () => {
  const files = await collectFiles(projectsDir, (filePath) => filePath.endsWith(".md"));
  const entries = {};

  for (const filePath of files) {
    const relativePath = toPosix(path.relative(rootDir, filePath));
    const raw = await fs.readFile(filePath, "utf8");
    entries[relativePath] = hash(raw);
  }

  return entries;
};

const buildSnapshot = async () => {
  const strings = await buildStringEntries();
  const projects = await buildProjectEntries();

  return {
    version: 1,
    generatedFrom: "scripts/content-integrity.mjs",
    strings,
    projects,
  };
};

const flatten = (value, prefix = "") => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return new Map([[prefix, stableStringify(value)]]);
  }

  const result = new Map();
  for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
    const childPrefix = prefix ? `${prefix}.${key}` : key;
    for (const [childKey, childValue] of flatten(value[key], childPrefix)) {
      result.set(childKey, childValue);
    }
  }
  return result;
};

const compareSnapshots = (actual, expected) => {
  const actualFlat = flatten(actual);
  const expectedFlat = flatten(expected);
  const failures = [];

  for (const key of expectedFlat.keys()) {
    if (!actualFlat.has(key)) {
      failures.push(`Missing content fingerprint: ${key}`);
    }
  }

  for (const key of actualFlat.keys()) {
    if (!expectedFlat.has(key)) {
      failures.push(`Unexpected content fingerprint: ${key}`);
      continue;
    }

    if (actualFlat.get(key) !== expectedFlat.get(key)) {
      failures.push(`Changed content fingerprint: ${key}`);
    }
  }

  return failures;
};

const run = async () => {
  const snapshot = await buildSnapshot();

  if (updateBaseline) {
    await fs.writeFile(`${baselinePath}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    await fs.rename(`${baselinePath}.tmp`, baselinePath);
    console.log(`Content integrity baseline updated: ${toPosix(path.relative(rootDir, baselinePath))}`);
    return;
  }

  const baselineRaw = await fs.readFile(baselinePath, "utf8").catch(() => null);
  if (!baselineRaw) {
    console.error("content-integrity: FAILED");
    console.error(`Baseline not found: ${toPosix(path.relative(rootDir, baselinePath))}`);
    console.error("Run: node scripts/content-integrity.mjs --update");
    process.exitCode = 1;
    return;
  }

  const baseline = JSON.parse(baselineRaw);
  const failures = compareSnapshots(snapshot, baseline);

  if (failures.length > 0) {
    console.error("content-integrity: FAILED");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    console.error("If an informational content change was explicitly approved, update the baseline intentionally.");
    process.exitCode = 1;
    return;
  }

  const localeCount = Object.keys(snapshot.strings).length;
  const stringCount = Object.values(snapshot.strings).reduce((total, entries) => total + Object.keys(entries).length, 0);
  const projectCount = Object.keys(snapshot.projects).length;

  console.log("content-integrity: OK");
  console.log(`String fingerprints: ${stringCount} across ${localeCount} locales`);
  console.log(`Project markdown fingerprints: ${projectCount}`);
};

run().catch((error) => {
  console.error("content-integrity: FAILED");
  console.error(error);
  process.exitCode = 1;
});
