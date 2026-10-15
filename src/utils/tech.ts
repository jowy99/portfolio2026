export type TechKey =
  | "laravel"
  | "astro"
  | "tailwindcss"
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "java"
  | "python"
  | "git"
  | "mysql"
  | "react"
  | "vite"
  | "api"
  | "sql"
  | "cli"
  | "oop"
  | "nextjs"
  | "custom";

type TechDefinition = {
  key: Exclude<TechKey, "custom">;
  label: string;
  accentRgb: string;
  aliases: string[];
};

export type ResolvedTech = {
  key: TechKey;
  label: string;
  accentRgb: string;
  shortLabel: string;
};

const TECH_DEFINITIONS: TechDefinition[] = [
  { key: "laravel", label: "Laravel", accentRgb: "255 45 32", aliases: ["laravel"] },
  { key: "astro", label: "Astro", accentRgb: "255 93 1", aliases: ["astro", "astrojs"] },
  { key: "tailwindcss", label: "Tailwind CSS", accentRgb: "14 165 233", aliases: ["tailwind", "tailwindcss"] },
  { key: "html", label: "HTML", accentRgb: "227 79 38", aliases: ["html", "html5"] },
  { key: "css", label: "CSS", accentRgb: "38 77 228", aliases: ["css", "css3"] },
  { key: "javascript", label: "JavaScript", accentRgb: "245 204 0", aliases: ["javascript", "js"] },
  { key: "typescript", label: "TypeScript", accentRgb: "49 120 198", aliases: ["typescript", "ts"] },
  { key: "java", label: "Java", accentRgb: "234 88 12", aliases: ["java", "openjdk"] },
  { key: "python", label: "Python", accentRgb: "59 130 246", aliases: ["python"] },
  { key: "git", label: "Git", accentRgb: "240 80 50", aliases: ["git"] },
  { key: "mysql", label: "MySQL", accentRgb: "14 116 144", aliases: ["mysql"] },
  { key: "react", label: "React", accentRgb: "34 211 238", aliases: ["react"] },
  { key: "vite", label: "Vite", accentRgb: "139 92 246", aliases: ["vite"] },
  { key: "api", label: "API", accentRgb: "16 185 129", aliases: ["api", "apis"] },
  { key: "sql", label: "SQL", accentRgb: "59 130 246", aliases: ["sql"] },
  { key: "cli", label: "CLI", accentRgb: "99 102 241", aliases: ["cli", "terminal"] },
  { key: "oop", label: "OOP", accentRgb: "217 70 239", aliases: ["oop"] },
  { key: "nextjs", label: "Next.js", accentRgb: "24 24 27", aliases: ["nextjs", "next.js"] },
];

const DEFAULT_TECH_ACCENT_RGB = "115 137 134";

const normalizeTechValue = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const buildShortLabel = (value: string): string => {
  const segments = value
    .trim()
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean);

  if (segments.length === 0) return "{}";
  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("");
};

const TECH_BY_ALIAS = new Map<string, TechDefinition>();

for (const definition of TECH_DEFINITIONS) {
  for (const alias of definition.aliases) {
    TECH_BY_ALIAS.set(normalizeTechValue(alias), definition);
  }
}

export const resolveTech = (value: string): ResolvedTech => {
  const normalized = normalizeTechValue(value);
  const definition = TECH_BY_ALIAS.get(normalized);

  if (!definition) {
    return {
      key: "custom",
      label: value.trim(),
      accentRgb: DEFAULT_TECH_ACCENT_RGB,
      shortLabel: buildShortLabel(value),
    };
  }

  return {
    key: definition.key,
    label: definition.label,
    accentRgb: definition.accentRgb,
    shortLabel: buildShortLabel(definition.label),
  };
};
