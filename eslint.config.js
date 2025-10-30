
// eslint.config.js

import globals from "globals";
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    // 1. Base JavaScript Recommended Rules
    js.configs.recommended,

    // 2. TypeScript-Specific Setup and Rules
    {
        files: ["**/*.ts"], // Target only TypeScript files
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                // IMPORTANT: This path must match your server's tsconfig file
                project: "./tsconfig.json",
                ecmaVersion: 2020,
                sourceType: "module",
            },
            // Define Node.js global variables (like require, module, etc.)
            globals: globals.node,
        },
        plugins: {
            "@typescript-eslint": ts,
        },
        rules: {
            // Apply recommended TypeScript rules
            ...ts.configs.recommended.rules,

            // Allow 'any' (Often useful for quick prototyping or specific library interfaces in Express)
            "@typescript-eslint/no-explicit-any": "off",

            // You may want to turn this on for cleaner imports
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
        },
    },

    // 3. Ignore files like compiled output and node_modules
    {
        ignores: ["node_modules/", "dist/"],
    },
];