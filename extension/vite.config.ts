import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  root: path.resolve(import.meta.dirname),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@extension": path.resolve(import.meta.dirname, "src"),
      "@blankai-core": path.resolve(import.meta.dirname, "../client/src"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/heic2any")) return "heic";
          if (id.includes("node_modules/exifr")) return "exifr";
          return undefined;
        },
      },
    },
  },
  server: {
    port: 4174,
    host: true,
    strictPort: false,
  },
});
