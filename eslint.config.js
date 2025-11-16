import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "dist", "build", "coverage", "openapi.yaml"],
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...prettier.rules,

      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
