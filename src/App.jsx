import { useEffect, useState } from "react";
import {
  isDemo,
  subscribeAuth,
  login,
  logout,
  subscribeMemos,
  addMemo,
  removeMemo,
} from "./backend";

// 로그인 + 데이터베이스를 함께 보여주는 예제 앱입니다.
// 로그인한 사용자별로 자기 메모만 보고/추가/삭제할 수 있습니다.
// 백엔드(진짜 Firebase / 데모)는 backend 폴더에서 자동으로 선택됩니다.
export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [memos, setMemos] = useState([]);
  const [text, setText] = useState("");

  // 로그인 상태 감시
  useEffect(() => {
    return subscribeAuth((u) => {
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
    return subscribeMemos(user.uid, setMemos);
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !user) return;
    setText("");
    await addMemo(user.uid, value);
  };

  if (!authReady) {
    return <div className="container">불러오는 중…</div>;
  }

  return (
    <div className="container">
      {isDemo && (
        <div className="demo-banner">
          🧪 데모 모드 — Firebase 설정 없이 체험 중이에요. 데이터는 이 브라우저에만
          저장됩니다.
        </div>
      )}

      <h1>📝 helloworld</h1>

      {!user ? (
        <div className="card">
          <p>로그인하면 나만의 메모를 저장할 수 있어요.</p>
          <button onClick={() => login().catch(console.error)}>
            {isDemo ? "데모로 로그인" : "Google 계정으로 로그인"}
          </button>
        </div>
      ) : (
        <>
          <div className="topbar">
            <span>
              안녕하세요, <b>{user.displayName ?? user.email}</b> 님
            </span>
            <button onClick={() => logout()}>로그아웃</button>
          </div>

          <form onSubmit={handleAdd} className="memo-form">
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
