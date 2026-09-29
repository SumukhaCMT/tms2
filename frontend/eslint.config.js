// import js from '@eslint/js'
// import globals from 'globals'
// import reactHooks from 'eslint-plugin-react-hooks'
// import reactRefresh from 'eslint-plugin-react-refresh'
// import tseslint from 'typescript-eslint'
// import { defineConfig, globalIgnores } from 'eslint/config'

// export default defineConfig([
//   globalIgnores(['dist']),
//   {
//     files: ['**/*.{ts,tsx}'],
//     extends: [
//       js.configs.recommended,
//       tseslint.configs.recommended,
//       reactHooks.configs.flat.recommended,
//       reactRefresh.configs.vite,
//     ],
//     languageOptions: {
//       globals: globals.browser,
//     },
//   },

  
// ])


import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      globals: globals.browser,
    },
  },

  // shadcn/ui components intentionally export
  // component helpers/variants alongside components.
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],

    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  // Shared feature modules intentionally export field components
  // alongside the constants/schemas/helpers they're built from.
  {
    files: ["src/features/**/shared/**/*.{ts,tsx}"],

    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
])