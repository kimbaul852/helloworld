# helloworld

Firebase 로그인 + Firestore 데이터베이스를 사용하는 React 웹앱 예제입니다.
로그인한 사용자별로 자기 메모를 저장·조회·삭제할 수 있습니다.

## 기술 스택

- [Vite](https://vite.dev/) + [React](https://react.dev/)
- [Firebase Authentication](https://firebase.google.com/docs/auth) (Google 로그인)
- [Cloud Firestore](https://firebase.google.com/docs/firestore) (데이터베이스)

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. Firebase 프로젝트 만들기

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 만듭니다.
2. **Authentication > Sign-in method**에서 **Google** 로그인을 사용 설정합니다.
3. **Firestore Database**를 만듭니다(테스트 모드로 시작해도 됩니다).
4. **프로젝트 설정 > 일반 > 내 앱**에서 웹 앱(`</>`)을 추가하고 SDK 설정 값을 복사합니다.

### 3. 환경 변수 설정

`.env.example` 파일을 복사해 `.env` 파일을 만들고, 위에서 복사한 값을 채웁니다.

```bash
cp .env.example .env
```

### 4. Firestore 보안 규칙 적용

`firestore.rules` 파일의 내용을 Firebase 콘솔의 **Firestore Database > 규칙** 탭에 붙여넣고 게시합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 안내되는 주소(기본 http://localhost:5173)를 엽니다.

## 빌드 & 배포

```bash
npm run build   # dist/ 폴더에 정적 파일 생성
```

생성된 `dist/` 폴더를 [Firebase Hosting](https://firebase.google.com/docs/hosting),
Vercel, Netlify 등에 올리면 배포됩니다.
