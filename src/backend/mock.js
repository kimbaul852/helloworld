// 설정 없이 바로 써보는 "데모 백엔드"입니다.
// Firebase 설정값이 없을 때 자동으로 사용됩니다.
// - 로그인: 입력한 이메일로 즉시 로그인됩니다(비밀번호는 검사하지 않음).
// - 데이터: 브라우저의 localStorage에 저장됩니다(새로고침해도 유지, 같은 브라우저 안에서만).
const EXP_KEY = "demo_expenses";
const IMG_KEY = "demo_receipts";

let currentUser = null;
const authListeners = new Set();
const expenseListeners = new Set();

function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem(EXP_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveExpenses(list) {
  localStorage.setItem(EXP_KEY, JSON.stringify(list));
}

function loadImages() {
  try {
    return JSON.parse(localStorage.getItem(IMG_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveImages(map) {
  localStorage.setItem(IMG_KEY, JSON.stringify(map));
}

function notifyAuth() {
  authListeners.forEach((cb) => cb(currentUser));
}

function notifyExpenses() {
  if (!currentUser) return;
  const mine = loadExpenses()
    .filter((e) => e.uid === currentUser.uid)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  expenseListeners.forEach((cb) => cb(mine));
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

export function subscribeExpenses(uid, callback) {
  expenseListeners.add(callback);
  notifyExpenses();
  return () => expenseListeners.delete(callback);
}

export async function addExpense(uid, data, imageDataUrl) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const list = loadExpenses();
  list.push({
    id,
    uid,
    amount: data.amount,
    merchant: data.merchant,
    category: data.category,
    date: data.date,
    hasReceipt: !!imageDataUrl,
    createdAt: Date.now(),
  });
  saveExpenses(list);
  if (imageDataUrl) {
    const imgs = loadImages();
    imgs[id] = imageDataUrl;
    saveImages(imgs);
  }
  notifyExpenses();
  return id;
}

export async function removeExpense(id) {
  saveExpenses(loadExpenses().filter((e) => e.id !== id));
  const imgs = loadImages();
  delete imgs[id];
  saveImages(imgs);
  notifyExpenses();
}

export async function getReceiptImage(id) {
  return loadImages()[id] ?? null;
}
