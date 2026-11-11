// import js from "@eslint/js"
// import globals from "globals"
// import tseslint from "typescript-eslint"

// export default tseslint.config(
//   {
//     ignores: [
//       "dist/**",
//       "node_modules/**",
//       "eslint.config.*",
//     ],
//   },

//   {
//     files: ["**/*.js", "**/*.cjs"],
//     extends: [
//       js.configs.recommended,
//     ],
//     languageOptions: {
//       globals: globals.node,
//       sourceType: "commonjs",
//     },
//   },

//   {
//     files: ["**/*.ts"],
//     extends: [
//       js.configs.recommended,
//       ...tseslint.configs.recommended,
//     ],
//     languageOptions: {
//       globals: globals.node,
//       sourceType: "commonjs",
//     },
//   },
// )

import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "eslint.config.*",
    ],
  },

  {
    files: ["**/*.js", "**/*.cjs"],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
  },

  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
)