import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".astro/", ".wrangler/", "dist/", "node_modules/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.flat["recommended-latest"].rules,
  },
];
