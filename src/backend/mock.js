// 설정 없이 바로 써보는 "데모 백엔드"입니다.
// Firebase 설정값이 없을 때 자동으로 사용됩니다.
// - 로그인: 입력한 이메일로 즉시 로그인됩니다(비밀번호는 검사하지 않음).
// - 데이터: 브라우저의 localStorage에 저장됩니다(새로고침해도 유지, 같은 브라우저 안에서만).
const STORAGE_KEY = "demo_memos";

let currentUser = null;
const authListeners = new Set();
const memoListeners = new Set();

function loadMemos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveMemos(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

function notifyAuth() {
  authListeners.forEach((cb) => cb(currentUser));
}

function notifyMemos() {
  if (!currentUser) return;
  const mine = loadMemos()
    .filter((m) => m.uid === currentUser.uid)
    .sort((a, b) => b.createdAt - a.createdAt);
  memoListeners.forEach((cb) => cb(mine));
}

function loginAs(email) {
  // 데모에서는 인증된 것으로 간주합니다.
  currentUser = { uid: `demo-${email}`, email, displayName: email, emailVerified: true };
  notifyAuth();
}

export function subscribeAuth(callback) {
  authListeners.add(callback);
  callback(currentUser);
  return () => authListeners.delete(callback);
}

export async function signUp(email) {
  loginAs(email);
}

export async function signIn(email) {
  loginAs(email);
}

export function sendVerification() {}

export async function refreshUser() {
  return true;
}

export async function logout() {
  currentUser = null;
  notifyAuth();
}

export function subscribeMemos(uid, callback) {
  memoListeners.add(callback);
  notifyMemos();
  return () => memoListeners.delete(callback);
}

export async function addMemo(uid, text) {
  const memos = loadMemos();
  memos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    uid,
    text,
    createdAt: Date.now(),
  });
  saveMemos(memos);
  notifyMemos();
}

export async function removeMemo(id) {
  saveMemos(loadMemos().filter((m) => m.id !== id));
  notifyMemos();
}
