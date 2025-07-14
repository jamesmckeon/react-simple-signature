import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'
import { globalIgnores } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'

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
        "@typescript-eslint/restrict-template-expressions": ["error", {allowNumber: true}],
        "max-len": ["error", { code: 80, ignoreComments: true }],
        "@stylistic/jsx-max-props-per-line": ["error", { when: "multiline" }],
        "@stylistic/jsx-indent": ["error", 2],
      }
    },
  ]
);
