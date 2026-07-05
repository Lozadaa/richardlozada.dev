import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://richardlozada.dev",
  output: "static",
  // Emit source maps so Lighthouse's "valid-source-maps" passes for first-party JS.
  vite: { build: { sourcemap: true } },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", es: "es" } },
      // Stamp every URL with the build time so crawlers see a fresh <lastmod> on deploy.
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
});
