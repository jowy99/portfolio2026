import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  site: "https://joelarnaud.com",
  build: {
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Inline small Astro entry scripts without changing image/font handling.
      assetsInlineLimit(filePath, content) {
        if (filePath.includes(".astro_") && filePath.endsWith(".js")) {
          return content.length < 8 * 1024;
        }
      },
    },
    server: {
      hmr: false,
    },
  },
});
