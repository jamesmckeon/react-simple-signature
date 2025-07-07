import prettier from "eslint-config-prettier";
// ...other imports

export default tseslint.config(
  [
    globalIgnores(["dist"]),
    {
      files: ["**/*.{ts,tsx}"],
      extends: [
        js.configs.recommended,
        ...tseslint.configs.strictTypeChecked,
        reactHooks.configs["recommended-latest"],
        reactRefresh.configs.vite,
        reactX.configs["recommended-typescript"],
        reactDom.configs.recommended,
        prettier, // <-- Add this line
      ],
      plugins: {
        "@stylistic": stylistic,
      },
      languageOptions: {
        parserOptions: {
          project: ["./tsconfig.node.json", "./tsconfig.app.json"],
          tsconfigRootDir: import.meta.dirname,
        },
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      rules: {
        // Note: you must disable the base rule as it can report incorrect errors
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "max-len": ["error", { code: 80, ignoreComments: true }],
        "@stylistic/jsx-max-props-per-line": ["error", { when: "multiline" }],
        "prettier/prettier": "error",
      },
    },
  ],
  storybook.configs["flat/recommended"],
);
