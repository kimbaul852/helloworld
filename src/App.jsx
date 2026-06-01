import { useEffect, useState } from "react";
import { auth, googleProvider, db } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
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

// 로그인 + Firestore 데이터베이스를 함께 보여주는 예제 앱입니다.
// 로그인한 사용자별로 자기 메모만 보고/추가/삭제할 수 있습니다.
export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [memos, setMemos] = useState([]);
  const [text, setText] = useState("");

  // 로그인 상태 감시
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  // 로그인한 사용자의 메모를 실시간으로 구독
  useEffect(() => {
    if (!user) {
      setMemos([]);
      return;
    }
    const q = query(
      collection(db, "memos"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setMemos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const login = () => signInWithPopup(auth, googleProvider).catch(console.error);
  const logout = () => signOut(auth);

  const addMemo = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !user) return;
    setText("");
    await addDoc(collection(db, "memos"), {
      uid: user.uid,
      text: value,
      createdAt: serverTimestamp(),
    });
  };

  const removeMemo = (id) => deleteDoc(doc(db, "memos", id));

  if (!authReady) {
    return <div className="container">불러오는 중…</div>;
  }

  return (
    <div className="container">
      <h1>📝 helloworld</h1>

      {!user ? (
        <div className="card">
          <p>로그인하면 나만의 메모를 저장할 수 있어요.</p>
          <button onClick={login}>Google 계정으로 로그인</button>
        </div>
      ) : (
        <>
          <div className="topbar">
            <span>
              안녕하세요, <b>{user.displayName ?? user.email}</b> 님
            </span>
            <button onClick={logout}>로그아웃</button>
          </div>

          <form onSubmit={addMemo} className="memo-form">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="메모를 입력하세요"
            />
            <button type="submit">추가</button>
          </form>

          <ul className="memo-list">
            {memos.length === 0 && <li className="empty">아직 메모가 없어요.</li>}
            {memos.map((m) => (
              <li key={m.id}>
                <span>{m.text}</span>
                <button onClick={() => removeMemo(m.id)}>삭제</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
