// 설정 없이 바로 써보는 "데모 백엔드"입니다.
// Firebase 키가 없을 때 자동으로 사용됩니다.
// - 로그인: 가짜 사용자로 즉시 로그인됩니다.
// - 데이터: 브라우저의 localStorage에 저장됩니다(새로고침해도 유지, 같은 브라우저 안에서만).
const STORAGE_KEY = "demo_memos";

const fakeUser = {
  uid: "demo-user",
  displayName: "데모 사용자",
  email: "demo@example.com",
};

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

export function subscribeAuth(callback) {
  authListeners.add(callback);
  callback(currentUser);
  return () => authListeners.delete(callback);
}

export async function login() {
  currentUser = fakeUser;
  notifyAuth();
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
