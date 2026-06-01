// 백엔드 자동 선택:
//   - .env에 Firebase 키가 있으면  -> 진짜 Firebase 사용
//   - 키가 없으면(데모 모드)       -> 브라우저 안에 저장하는 mock 사용
// 앱(App.jsx)은 어느 쪽이든 똑같은 함수 인터페이스로 사용합니다.
export const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY;

const impl = isDemo
  ? await import("./mock.js")
  : await import("./firebaseBackend.js");

export const subscribeAuth = impl.subscribeAuth;
export const login = impl.login;
export const logout = impl.logout;
export const subscribeMemos = impl.subscribeMemos;
export const addMemo = impl.addMemo;
export const removeMemo = impl.removeMemo;
