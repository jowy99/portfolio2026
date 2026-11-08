import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";

export const createPerformanceServer = async () => {
  process.env.ASTRO_NODE_AUTOSTART = "disabled";
  const { handler } = await import("../dist/server/entry.mjs");
  const compress = compression({ level: 6, threshold: 1024 });

  // Keep Astro's SSR routes and static assets behind the same compression layer.
  return createServer((request, response) => {
    compress(request, response, (error) => {
      if (error) {
        response.statusCode = 500;
        response.end("Internal Server Error");
        return;
      }
      handler(request, response);
    });
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 4322);
  const server = await createPerformanceServer();

  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    console.log(`Performance preview: http://${host}:${server.address().port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => server.close());
  }
}
