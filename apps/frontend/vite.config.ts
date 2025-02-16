import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: [
      {
        find: "./runtimeConfig",
        replacement: "./runtimeConfig.browser",
      },
      // Reference: https://github.com/vercel/turbo/discussions/620#discussioncomment-2136195
      {
        find: "@repo/ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src"),
      },
    ],
  },
});
