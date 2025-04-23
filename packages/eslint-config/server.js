import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Express API server applications.
 *
 * @type {import("eslint").Linter.Config[]} 
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        process: true,
        __dirname: true,
        __filename: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  // Configuration for test files
  {
    files: ["**/__tests__/**/*"],
    languageOptions: {
      globals: {
        ...globals.jest,
      }
    }
  },
];
