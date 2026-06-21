import { defineConfig } from "vite";

// https://vite.dev/config/
// 의존성 없는 정적 HTML(복무유형 빌더)을 빌드합니다.
// GitHub Pages는 https://<사용자>.github.io/helloworld/ 경로로 서비스되므로 base를 맞춰줍니다.
export default defineConfig({
  base: "/helloworld/",
});
