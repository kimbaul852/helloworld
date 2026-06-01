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

export function subscribeMemos(uid, callback) {
  // 복합 색인이 필요 없도록 uid로만 조회하고, 정렬은 코드에서 처리합니다.
  const q = query(collection(db, "memos"), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // 최신순 정렬 (createdAt은 Firestore Timestamp, 저장 직후엔 잠깐 null일 수 있음)
      items.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      callback(items);
    },
    (err) => console.error("Firestore 구독 오류:", err)
  );
}

export function addMemo(uid, text) {
  return addDoc(collection(db, "memos"), {
    uid,
    text,
    createdAt: serverTimestamp(),
  });
}

export function removeMemo(id) {
  return deleteDoc(doc(db, "memos", id));
}
