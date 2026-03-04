import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, constants as zlibConstants, gzipSync } from "node:zlib";

const targetDir = path.resolve(process.argv[2] ?? "dist");
const compressibleExt = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".xml",
  ".svg",
  ".txt",
  ".map",
]);

let processed = 0;
let sourceBytes = 0;
let gzipBytes = 0;
let brotliBytes = 0;

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        return;
      }

      if (!entry.isFile()) {
        return;
      }

      if (entry.name.endsWith(".gz") || entry.name.endsWith(".br")) {
        return;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!compressibleExt.has(ext)) {
        return;
      }

      const input = await readFile(fullPath);
      if (!input.length) {
        return;
      }

      const gz = gzipSync(input, { level: 9 });
      const br = brotliCompressSync(input, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
        },
      });

      await Promise.all([writeFile(`${fullPath}.gz`, gz), writeFile(`${fullPath}.br`, br)]);

      processed += 1;
      sourceBytes += input.length;
      gzipBytes += gz.length;
      brotliBytes += br.length;
    }),
  );
};

const formatKB = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

const run = async () => {
  const targetStat = await stat(targetDir).catch(() => null);
  if (!targetStat || !targetStat.isDirectory()) {
    throw new Error(`No se encontro el directorio a comprimir: ${targetDir}`);
  }

  await walk(targetDir);

  if (!processed) {
    console.log("No se encontraron archivos comprimibles en dist.");
    return;
  }

  console.log(`Archivos comprimidos: ${processed}`);
  console.log(`Original: ${formatKB(sourceBytes)}`);
  console.log(`Gzip:     ${formatKB(gzipBytes)} (${Math.round((1 - gzipBytes / sourceBytes) * 100)}% ahorro)`);
  console.log(`Brotli:   ${formatKB(brotliBytes)} (${Math.round((1 - brotliBytes / sourceBytes) * 100)}% ahorro)`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
