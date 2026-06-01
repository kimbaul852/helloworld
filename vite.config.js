import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 백엔드를 동적으로 불러오기 위해 top-level await를 사용하므로 최신 타깃으로 빌드합니다.
  build: {
    target: "esnext",
  },
});
