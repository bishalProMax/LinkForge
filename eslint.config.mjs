import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
 
  { ignores: ["dist/**", "node_modules/**"] },

  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  { files: ["**/*.js"], languageOptions: { sourceType: "module", globals: { Chart: "readonly" } } },

  {
    files: ["src/**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^next$", varsIgnorePattern: "^_"  }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);