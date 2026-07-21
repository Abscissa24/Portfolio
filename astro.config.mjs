import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://abscissa24.github.io",
  base: "/Portfolio/",
  integrations: [react(), icon()],
  // The site already ships <ClientRouter /> for SPA-style navigation,
  // but that alone only swaps the DOM faster - it still waits for the
  // next page's HTML to be fetched on click. With just 3 routes total,
  // prefetching all of them up front (as soon as a link scrolls into
  // view, which for the always-visible header/navbar is immediately)
  // means the HTML is already cached by the time someone clicks, so
  // navigation feels instant instead of waiting on a network round trip.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@tsparticles/react", "@tsparticles/engine", "@tsparticles/slim"],
    },
    optimizeDeps: {
      exclude: ["@tsparticles/react", "@tsparticles/engine", "@tsparticles/slim"],
    },
  },
});
