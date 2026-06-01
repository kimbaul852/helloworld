// 백엔드 자동 선택:
//   - firebaseConfig에 apiKey가 채워져 있으면 -> 진짜 Firebase 사용
//   - 비어 있으면(데모 모드)                  -> 브라우저에 저장하는 mock 사용
// 앱(App.jsx)은 어느 쪽이든 똑같은 함수 인터페이스로 사용합니다.
import { firebaseConfig } from "../firebaseConfig";

export const isDemo = !firebaseConfig.apiKey;

const impl = isDemo
  ? await import("./mock.js")
  : await import("./firebaseBackend.js");

export const subscribeAuth = impl.subscribeAuth;
export const signUp = impl.signUp;
export const signIn = impl.signIn;
export const sendVerification = impl.sendVerification;
export const refreshUser = impl.refreshUser;
export const logout = impl.logout;
export const subscribeMemos = impl.subscribeMemos;
export const addMemo = impl.addMemo;
export const removeMemo = impl.removeMemo;
