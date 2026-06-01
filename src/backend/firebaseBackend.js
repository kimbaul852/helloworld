// 실제 Firebase 백엔드입니다. (이메일/비밀번호 로그인 + Firestore)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
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

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeMemos(uid, callback) {
  const q = query(
    collection(db, "memos"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
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
