import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { privateUiBuild, obfuscateBuild } from "./build/ui-security";
import { DASHBOARD_ACCESS_ROLES } from "./src/config/dashboardAccess";
import path from "path";

// https://vite.dev/config/
const privateUi = privateUiBuild(DASHBOARD_ACCESS_ROLES);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    privateUi.plugin,
    obfuscateBuild(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        chunkFileNames: privateUi.chunkFileNames,
      },
    },
    minify: "terser",
    sourcemap: false, // Tắt hoàn toàn source map trên production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      mangle: {
        toplevel: true,
        keep_classnames: false,
        keep_fnames: false,
      },
      format: {
        comments: false,
      },
    },
  },
});
