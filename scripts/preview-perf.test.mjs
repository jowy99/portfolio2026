import assert from "node:assert/strict";
import { once } from "node:events";
import { readdir } from "node:fs/promises";
import { request } from "node:http";
import { test } from "node:test";
import { brotliDecompressSync, gunzipSync } from "node:zlib";
import config from "../astro.config.mjs";
import { createPerformanceServer } from "./preview-perf.mjs";

test("inlining is bounded to small Astro entry scripts", () => {
  const inline = config.vite.build.assetsInlineLimit;
  const entry = "_astro/index.astro_astro_type_script_index_0_lang.hash.js";
  assert.equal(config.build.inlineStylesheets, "always");
  assert.equal(inline(entry, Buffer.alloc(8191)), true);
  assert.equal(inline(entry, Buffer.alloc(8192)), false);
  for (const asset of ["photo.webp", "font.woff2", "library.js", "styles.css"]) {
    assert.equal(inline(asset, Buffer.alloc(1024)), undefined);
  }
});

test("compressed production preview preserves static and SSR responses", async (t) => {
  const server = await createPerformanceServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const get = (pathname, headers = {}, method = "GET") => new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port: server.address().port, path: pathname, method, headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.end();
  });

  const assets = await readdir(new URL("../dist/client/_astro/", import.meta.url));
  const textAssets = assets.filter((name) => /\.(css|js)$/.test(name));
  const paths = [...textAssets.map((name) => `/_astro/${name}`), "/sitemap.xml", "/es/errors/404"];
  for (const locale of ["es", "en", "ca", "fr"]) {
    paths.push(`/${locale}/`, `/${locale}/projects/?q=weather`, `/${locale}/projects/matiz/`);
  }

  for (const pathname of paths) {
    await t.test(pathname, async () => {
      const original = await get(pathname, { "Accept-Encoding": "identity" });
      assert.equal(original.status, pathname.endsWith("/errors/404") ? 404 : 200);
      assert.equal(original.headers["content-encoding"], undefined);
      for (const [encoding, decode] of [["gzip", gunzipSync], ["br", brotliDecompressSync]]) {
        const compressed = await get(pathname, { "Accept-Encoding": encoding });
        assert.equal(compressed.status, original.status);
        assert.equal(compressed.headers["content-encoding"], encoding);
        assert.match(compressed.headers.vary, /Accept-Encoding/i);
        assert.deepEqual(decode(compressed.body), original.body);
        assert(compressed.body.length < original.body.length);
      }
    });
  }

  await t.test("binary assets, HEAD and cache validation", async () => {
    const image = `/_astro/${assets.find((name) => name.endsWith(".webp"))}`;
    const binary = await get(image, { "Accept-Encoding": "br, gzip" });
    assert.equal(binary.status, 200);
    assert.equal(binary.headers["content-encoding"], undefined);
    assert.match(binary.headers["cache-control"], /immutable/);
    const head = await get(image, { "Accept-Encoding": "gzip" }, "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert(head.headers.etag);
    const cached = await get(image, { "If-None-Match": head.headers.etag, "Accept-Encoding": "gzip" });
    assert.equal(cached.status, 304);
    assert.equal(cached.body.length, 0);
  });
});
