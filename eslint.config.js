// Flat config for ESLint
// Covers JS/TS, Svelte, and Vite environment
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,ts,svelte}", "*.{js,ts}", "src/**/*.{js,ts,svelte}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        extraFileExtensions: [".svelte"],
      },
      globals: {
        // Browser environment
        document: "readonly",
        window: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        performance: "readonly",
        AbortController: "readonly",
        // DOM types
        HTMLElement: "readonly",
        HTMLCanvasElement: "readonly",
        MouseEvent: "readonly",
        TouchEvent: "readonly",
        KeyboardEvent: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        // Node.js
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      svelte,
    },
    rules: {
      // General
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Svelte-specific
      ...svelte.configs["flat/recommended"].rules,
    },
  },
  // Tests (Vitest / Playwright)
  {
    files: ["**/*.{test,spec}.{js,ts}", "tests/**/*.ts"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsparser,
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      // Keep templates clean but not overbearing for kid-mode visuals
      "svelte/no-at-html-tags": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "test-results/**"],
  },
];
