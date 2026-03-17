import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const extensionRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  base: "./",
  root: extensionRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../client/src"),
      "@extension": path.resolve(import.meta.dirname, "src"),
      "@blankai-core": path.resolve(import.meta.dirname, "../client/src"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(extensionRoot, "index.html"),
        sandboxHeic: path.resolve(extensionRoot, "sandbox/heic.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/heic2any")) return "heic";
          if (id.includes("node_modules/piexifjs")) return "piexif";
          if (id.includes("commonjsHelpers")) return "piexif";
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
