import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
// in test case then commentout this
    // include: [
    //   "src/**/*.test.ts",
    //   "src/**/__tests__/**/*.ts",
    //   "src/**/tests/**/*.ts",
    // ],

    exclude: [
      "node_modules/**",
      "dist/**",
    ],
  },
})