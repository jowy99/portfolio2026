import type { CollectionEntry } from "astro:content";
import { isLocale, type Locale } from "../i18n/locales";

export type ProjectEntry = CollectionEntry<"projects">;

const splitPathSegments = (value: string): string[] => value.split("/").filter(Boolean);

export const getProjectLocale = (entry: Pick<ProjectEntry, "id">): Locale | null => {
  const [candidate] = splitPathSegments(entry.id);
  if (!candidate || !isLocale(candidate)) return null;
  return candidate;
};

export const getProjectSlug = (entry: Pick<ProjectEntry, "id" | "slug">): string => {
  const idSegments = splitPathSegments(entry.id);
  const fromId = idSegments[idSegments.length - 1];
  if (fromId) return fromId.replace(/\.md$/u, "");

  const slugSegments = splitPathSegments(entry.slug);
  return slugSegments[slugSegments.length - 1] ?? entry.slug;
};

export const filterProjectsByLocale = (entries: ProjectEntry[], locale: Locale): ProjectEntry[] => {
  return entries.filter((entry) => getProjectLocale(entry) === locale);
};
