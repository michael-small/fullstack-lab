import js from "@eslint/js";
import angular from "angular-eslint";
import tseslint from "typescript-eslint";
// https://eslint.org/docs/latest/rules/

export default [
  {
    ignores: ["projects/**/*"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  ...angular.configs.tsRecommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    processor: angular.processInlineTemplates,

    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],

      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      "no-underscore-dangle": [
        "error",
        {
          allow: ["_id"],
        },
      ],

      // The following few rules are more about how the code looks than how it functions,
      // but these are places where consistency stands out and can be confusing.
      // angular-eslint is more focused on functionality, so this is not promised to work forever:
      // https://github.com/angular-eslint/angular-eslint/blob/main/docs/FORMATTING_RULES.md
      indent: ["error", 2], // https://archive.eslint.org/docs/rules/indent
      "space-before-blocks": "error", // https://archive.eslint.org/docs/rules/space-before-blocks
      "no-trailing-spaces": "error", // https://archive.eslint.org/docs/rules/no-trailing-spaces
      "brace-style": "error", // https://archive.eslint.org/docs/rules/brace-style
      "func-call-spacing": "error", // https://archive.eslint.org/docs/rules/func-call-spacing
      "arrow-spacing": "error", // https://archive.eslint.org/docs/rules/arrow-spacing
    },
  },
  ...angular.configs.templateRecommended.map((config) => ({
    ...config,
    files: ["**/*.html"],
  })),
  ...angular.configs.templateAccessibility.map((config) => ({
    ...config,
    files: ["**/*.html"],
  })),
  {
    files: ["**/*.html"],
    rules: {},
  },
];
