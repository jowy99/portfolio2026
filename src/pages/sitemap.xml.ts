import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { locales } from "../i18n/locales";
import { getProjectLocale, getProjectSlug } from "../utils/projects";

export const prerender = true;

const FALLBACK_SITE_URL = "https://joelarnaud.com";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

const normalizeSiteOrigin = (site: URL | undefined): string => {
  const fromContext = site?.toString() ?? FALLBACK_SITE_URL;
  return fromContext.replace(/\/$/u, "");
};

const escapeXml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
};

const toEntryXml = (entry: SitemapEntry): string => {
  const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
  return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${lastmod}
  </url>`;
};

export const GET: APIRoute = async ({ site }) => {
  const origin = normalizeSiteOrigin(site);

  const entries: SitemapEntry[] = [
    { loc: `${origin}/` },
    ...locales.map((lang) => ({ loc: `${origin}/${lang}` })),
    ...locales.map((lang) => ({ loc: `${origin}/${lang}/projects` })),
  ];

  const projects = await getCollection("projects");
  for (const project of projects) {
    const locale = getProjectLocale(project);
    if (!locale) continue;

    const slug = getProjectSlug(project);
    entries.push({
      loc: `${origin}/${locale}/projects/${slug}`,
      lastmod: project.data.date.toISOString().split("T")[0],
    });
  }

  // Preserve insertion order while deduplicating routes.
  const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.loc, entry])).values());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueEntries.map(toEntryXml).join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
