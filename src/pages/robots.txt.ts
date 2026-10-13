import type { APIRoute } from "astro";

export const prerender = false;

const INDEXABLE_HOSTS = new Set(["joelarnaud.com", "www.joelarnaud.com"]);
const CANONICAL_SITEMAP_URL = "https://joelarnaud.com/sitemap.xml";

const normalizeHost = (host: string): string => {
  return host.trim().toLowerCase().replace(/:\d+$/u, "");
};

export const GET: APIRoute = ({ url }) => {
  const host = normalizeHost(url.host);
  const isIndexableHost = INDEXABLE_HOSTS.has(host);

  const body = isIndexableHost
    ? `User-agent: *
Allow: /
Sitemap: ${CANONICAL_SITEMAP_URL}
`
    : `User-agent: *
Disallow: /
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": isIndexableHost ? "public, max-age=300" : "public, max-age=60",
    },
  });
};
