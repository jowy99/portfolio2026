import type { APIRoute } from "astro";

export const prerender = true;

const FALLBACK_SITE_URL = "https://joelarnaud.com";

const normalizeSiteOrigin = (site: URL | undefined): string => {
  const fromContext = site?.toString() ?? FALLBACK_SITE_URL;
  return fromContext.replace(/\/$/u, "");
};

export const GET: APIRoute = ({ site }) => {
  const origin = normalizeSiteOrigin(site);
  const sitemapUrl = `${origin}/sitemap.xml`;
  const body = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
