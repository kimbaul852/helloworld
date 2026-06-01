import { useEffect, useState } from "react";
import {
  isDemo,
  subscribeAuth,
  signUp,
  signIn,
  logout,
  subscribeMemos,
  addMemo,
  removeMemo,
} from "./backend";

// 이메일/비밀번호 로그인 + 데이터베이스 예제 앱입니다.
// 로그인한 사용자별로 자기 메모만 보고/추가/삭제할 수 있습니다.
export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [memos, setMemos] = useState([]);
  const [text, setText] = useState("");

  // 로그인 화면용 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return subscribeAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setMemos([]);
      return;
    }
    return subscribeMemos(user.uid, setMemos);
  }, [user]);

  const handleAuth = async (mode) => {
    setError("");
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

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
          🧪 데모 모드 — 데이터는 이 브라우저에만 저장됩니다.
        </div>
      )}

      <h1>📝 helloworld</h1>

      {!user ? (
        <div className="card">
          <p>로그인하거나 새 계정을 만들어 보세요.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            autoComplete="current-password"
          />
          {error && <p className="error">{error}</p>}
          <div className="auth-buttons">
            <button disabled={busy} onClick={() => handleAuth("signin")}>
              로그인
            </button>
            <button
              disabled={busy}
              className="secondary"
              onClick={() => handleAuth("signup")}
            >
              회원가입
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="topbar">
            <span>
              안녕하세요, <b>{user.email}</b> 님
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

// Firebase 인증 에러 코드를 한국어 안내로 바꿔줍니다.
function translateError(e) {
  const code = e?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않아요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 해요.";
    case "auth/email-already-in-use":
      return "이미 가입된 이메일이에요. '로그인'을 눌러보세요.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "이메일 또는 비밀번호가 맞지 않아요. (새 계정이면 '회원가입')";
    default:
      return "문제가 발생했어요: " + (e?.message ?? code);
  }
}
