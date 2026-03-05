import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: node({
    mode: "standalone",
  }),
  site: "https://joelarnaud.com",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: false,
    },
  },
});
