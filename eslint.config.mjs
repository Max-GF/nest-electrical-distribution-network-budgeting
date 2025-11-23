import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.strict, // recommended config for typescript
  tseslint.configs.stylistic,
  eslintPluginPrettier,
  {
    rules: {
      "no-new": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "class",
          format: ["PascalCase"],
        },
        {
          selector: "variable",
          format: ["camelCase"],
          leadingUnderscore: "allow", // allow "_" in variable names
        },
        {
          selector: "variable",
          format: ["PascalCase"],
          modifiers: ["exported"],
          types: ["function"], // allow PascalCase for exported functions (decorators)
        },
        // {
        //   selector: "property",
        //   format: ["camelCase"],
        //   leadingUnderscore: "allow",
        // },
        // {
        //   selector: "parameter",
        //   format: ["camelCase"],
        //   leadingUnderscore: "allow",
        // },
        // {
        //   selector: "objectLiteralProperty",
        //   format: ["camelCase"],
        //   leadingUnderscore: "allow",
        // },
      ],
    },
  },

  globalIgnores([
    "dist/**", // ignore dist folder
    "node_modules/**", // ignore node_modules folder
    "data/**", // ignore data folder
    "prisma/**", // ignore prisma folder
  ]),
]);
