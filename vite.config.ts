/*
 * @Author: Hakob Vardanyan
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3005,
    open: true,
    // 反向代理
    proxy: {
      "/api": {
        target: "http://xxx.xxxxx.xxx/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    terserOptions: {
      compress: {
        drop_debugger: true,
      },
    },
    lib: {
      entry: "./lib/index.js",
      name: "index",
      fileName: "index",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
