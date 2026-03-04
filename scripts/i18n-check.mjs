import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const rootDir = path.resolve(process.cwd());
const sourceLocale = "es";
const locales = ["es", "en", "ca", "fr"];
const failures = [];

const toPosix = (value) => value.split(path.sep).join("/");

const collectFiles = async (dirPath, extensions) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, extensions)));
      continue;
    }
    if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
};

const loadStrings = async () => {
  const stringsPath = path.join(rootDir, "src/i18n/strings.ts");
  const source = await fs.readFile(stringsPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: stringsPath,
  });

  const tempPath = path.join(rootDir, ".astro", "tmp-i18n-strings.mjs");
  await fs.writeFile(tempPath, transpiled.outputText, "utf8");

  try {
    const moduleUrl = `${pathToFileURL(tempPath).href}?v=${Date.now()}`;
    const mod = await import(moduleUrl);
    return mod.strings;
  } finally {
    await fs.unlink(tempPath).catch(() => undefined);
  }
};

const checkLocaleKeys = (strings) => {
  const base = strings[sourceLocale];
  if (!base || typeof base !== "object") {
    failures.push(`[keys] Source locale "${sourceLocale}" not found in strings.ts`);
    return;
  }

  const baseKeys = Object.keys(base);
  const baseKeySet = new Set(baseKeys);

  for (const locale of locales) {
    const localeStrings = strings[locale];
    if (!localeStrings || typeof localeStrings !== "object") {
      failures.push(`[keys] Locale "${locale}" not found in strings.ts`);
      continue;
    }

    const localeKeys = Object.keys(localeStrings);
    const localeKeySet = new Set(localeKeys);
    const missing = baseKeys.filter((key) => !localeKeySet.has(key));
    const extra = localeKeys.filter((key) => !baseKeySet.has(key));

    if (missing.length > 0) {
      failures.push(`[keys] Missing keys in "${locale}": ${missing.join(", ")}`);
    }
    if (extra.length > 0) {
      failures.push(`[keys] Extra keys in "${locale}": ${extra.join(", ")}`);
    }
  }
};

const collectMarkdownSlugs = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/u, ""))
    .sort();
};

const checkProjectCoverage = async () => {
  const projectsRoot = path.join(rootDir, "src/content/projects");
  const topEntries = await fs.readdir(projectsRoot, { withFileTypes: true });
  const topLevelMarkdown = topEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  if (topLevelMarkdown.length > 0) {
    failures.push(
      `[projects] Top-level markdown files are not allowed in src/content/projects: ${topLevelMarkdown
        .map((entry) => entry.name)
        .join(", ")}`,
    );
  }

  const localeSlugs = new Map();
  for (const locale of locales) {
    const localeDir = path.join(projectsRoot, locale);
    const stat = await fs
      .stat(localeDir)
      .then((value) => value)
      .catch(() => null);
    if (!stat || !stat.isDirectory()) {
      failures.push(`[projects] Missing locale folder: src/content/projects/${locale}`);
      continue;
    }
    localeSlugs.set(locale, await collectMarkdownSlugs(localeDir));
  }

  const sourceSlugs = localeSlugs.get(sourceLocale) ?? [];
  const sourceSet = new Set(sourceSlugs);
  if (sourceSlugs.length === 0) {
    failures.push(`[projects] Source locale "${sourceLocale}" has no project markdown files.`);
    return;
  }

  for (const locale of locales) {
    const slugs = localeSlugs.get(locale);
    if (!slugs) continue;
    const localeSet = new Set(slugs);
    const missing = sourceSlugs.filter((slug) => !localeSet.has(slug));
    const extra = slugs.filter((slug) => !sourceSet.has(slug));

    if (missing.length > 0) {
      failures.push(`[projects] Missing slugs in "${locale}": ${missing.join(", ")}`);
    }
    if (extra.length > 0) {
      failures.push(`[projects] Extra slugs in "${locale}": ${extra.join(", ")}`);
    }
  }
};

const checkHardcodedUiStrings = async () => {
  const roots = ["src/components", "src/layouts", "src/pages"].map((value) => path.join(rootDir, value));
  const astroFiles = [];
  for (const entry of roots) {
    astroFiles.push(...(await collectFiles(entry, new Set([".astro"]))));
  }

  const attrPattern = /\b(?:aria-label|placeholder|title|alt)\s*=\s*"([^"{][^"]*[A-Za-zÀ-ÿ][^"]*)"/gu;
  const textPattern = />([^<>{}]*[A-Za-zÀ-ÿ][^<>{}]*)</gu;

  const issues = [];
  for (const filePath of astroFiles) {
    let source = await fs.readFile(filePath, "utf8");
    source = source.replace(/^---[\s\S]*?---\s*/u, "");
    source = source.replace(/<script\b[\s\S]*?<\/script>/gu, "");
    source = source.replace(/<style\b[\s\S]*?<\/style>/gu, "");

    let match;
    while ((match = attrPattern.exec(source)) !== null) {
      const value = match[1]?.trim();
      if (!value) continue;
      issues.push(`${toPosix(path.relative(rootDir, filePath))}: static attribute text "${value}"`);
    }

    while ((match = textPattern.exec(source)) !== null) {
      const value = match[1]?.replace(/\s+/gu, " ").trim();
      if (!value) continue;
      if (value.startsWith("/")) continue;
      issues.push(`${toPosix(path.relative(rootDir, filePath))}: static text node "${value}"`);
    }
  }

  if (issues.length > 0) {
    failures.push(`[hardcoded] Visible hardcoded UI strings found:\n- ${issues.join("\n- ")}`);
  }
};

const run = async () => {
  const strings = await loadStrings();
  checkLocaleKeys(strings);
  await checkProjectCoverage();
  await checkHardcodedUiStrings();

  if (failures.length > 0) {
    console.error("i18n-check: FAILED\n");
    for (const issue of failures) {
      console.error(issue);
      console.error("");
    }
    process.exitCode = 1;
    return;
  }

  console.log("i18n-check: OK");
  console.log(`Locales checked: ${locales.join(", ")}`);
  console.log("Keys parity: OK (source = es)");
  console.log("Projects coverage by locale: OK");
  console.log("Hardcoded UI scan: OK");
};

run().catch((error) => {
  console.error("i18n-check: FAILED");
  console.error(error);
  process.exitCode = 1;
});
