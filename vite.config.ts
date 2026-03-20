import { defineConfig } from "vite";
import type { ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import process from "node:process";

export default defineConfig(({ mode }: ConfigEnv) => ({
  base:
    mode === "production" && process.env.GITHUB_ACTIONS
      ? "/gantt-chart-PWA/"
      : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Гант Про - Управління проектами",
        short_name: "Гант Про",
        description:
          "Веб-додаток для управління проектами за допомогою діаграм Ганта з офлайн-доступом",
        theme_color: "#1e50c8",
        background_color: "#f5f4f1",
        display: "standalone",
        orientation: "portrait-primary",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "Нова робота",
            short_name: "Нова робота",
            description: "Швидко додати нову роботу до графіка",
            url: "./index.html?action=new-task",
          },
        ],
        share_target: {
          action: "./index.html",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            files: [
              {
                name: "file",
                accept: ["application/json"],
              },
            ],
          },
        },
      },
    }),
  ],
}));
