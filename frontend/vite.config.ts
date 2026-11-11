import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite"
import path from "path"
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       // "@": path.resolve(__dirname, "./src"),
//       // modern Node/Vite, change the __dirname
//          "@": path.resolve(import.meta.dirname, "./src"),
//     },
//   },
// });


    /*........................................................................
    // Why this helps

    Instead of one large bundle:

    index.js
    ├── React
    ├── React Router
    ├── Lucide
    ├── TanStack Table
    ├── UI
    └── Application */





export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/")) {
            return "react"
          }

          if (id.includes("node_modules/react-dom/")) {
            return "react"
          }

          if (id.includes("node_modules/react-router-dom/")) {
            return "router"
          }

          if (id.includes("node_modules/@tanstack/react-table/")) {
            return "table"
          }

          if (id.includes("node_modules/lucide-react/")) {
            return "icons"
          }

          if (
            id.includes("node_modules/@base-ui/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/tw-animate-css/")
          ) {
            return "ui"
          }
        },
      },
    },

    chunkSizeWarningLimit: 500,
  },
})