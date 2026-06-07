// 실제 Firebase 백엔드입니다. (이메일/비밀번호 로그인 + Firestore)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // 가입 직후 인증 메일 발송
  await sendEmailVerification(cred.user);
  return cred;
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// 인증 메일 다시 보내기
export function sendVerification() {
  if (auth.currentUser) return sendEmailVerification(auth.currentUser);
}

// 메일 링크 클릭 후, 인증 완료 여부를 새로고침해서 알려줌
export async function refreshUser() {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  return auth.currentUser.emailVerified;
}

export function logout() {
  return signOut(auth);
}

// --- 가계부(지출) ---

// 지출 목록 구독 (복합 색인이 필요 없도록 uid로만 조회 후 코드에서 날짜순 정렬)
export function subscribeExpenses(uid, callback) {
  const q = query(collection(db, "expenses"), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
      });
      callback(items);
    },
    (err) => console.error("지출 구독 오류:", err)
  );
}

// 지출 추가. 영수증 사진(imageDataUrl)이 있으면 별도 문서에 저장합니다.
export async function addExpense(uid, data, imageDataUrl) {
  const ref = await addDoc(collection(db, "expenses"), {
    uid,
    amount: data.amount,
    merchant: data.merchant,
    category: data.category,
    date: data.date,
    hasReceipt: !!imageDataUrl,
    createdAt: serverTimestamp(),
  });
  if (imageDataUrl) {
    await setDoc(doc(db, "receipt_images", ref.id), { uid, data: imageDataUrl });
  }
  return ref.id;
}

export async function removeExpense(id) {
  await deleteDoc(doc(db, "expenses", id));
  // 영수증 이미지도 함께 삭제 (없으면 그냥 통과)
  await deleteDoc(doc(db, "receipt_images", id));
}

// 상세 화면에서만 영수증 원본 이미지를 불러옵니다.
export async function getReceiptImage(id) {
  const snap = await getDoc(doc(db, "receipt_images", id));
  return snap.exists() ? snap.data().data : null;
}
