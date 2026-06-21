# helloworld — 복무유형 빌더

군 복무유형(현역병, 임기제부사관 등)을 폼으로 입력하면 JSON/TS 객체로
만들어 주는 정적 웹 도구입니다. 로그인이나 서버가 필요 없고, 모든 동작은
브라우저 안에서만 일어납니다.

## 기능

- 폼 입력 → 객체 실시간 미리보기 + 검증
- 복무구분(병역의무 / 임기제 · 단기 · 장기), 계급·진급 순서, 입대일별 기간규칙
- 목록에 여러 유형을 모아 JSON / TS 파일로 내보내기, JSON 가져오기
- 현역병 · 임기제부사관 예시 제공

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # dist/ 로 정적 빌드
```

의존성은 빌드 도구(Vite)뿐이며, 앱 자체는 의존성 없는 단일 `index.html`입니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 `dist`를 빌드해 GitHub Pages로
배포합니다. → https://kimbaul852.github.io/helloworld/
