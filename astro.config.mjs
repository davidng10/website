// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react()],
  vite: {
    optimizeDeps: {
      exclude: [
        "@lexical/code",
        "@lexical/link",
        "@lexical/list",
        "@lexical/markdown",
        "@lexical/react",
        "@lexical/rich-text",
        "@lexical/selection",
        "@lexical/utils",
        "@monaco-editor/react",
        "lexical",
        "monaco-editor",
      ],
    },
    plugins: [tailwindcss()],
  },
});
