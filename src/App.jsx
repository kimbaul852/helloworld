import { useEffect, useState } from "react";
import {
  isDemo,
  subscribeAuth,
  signUp,
  signIn,
  sendVerification,
  refreshUser,
  logout,
} from "./backend";
import SplitLayout from "./components/SplitLayout";
import WebPane from "./components/WebPane";
import ExpenseTracker from "./components/ExpenseTracker";

// 이메일/비밀번호 로그인 + 가계부(지출 기록 + 영수증 사진) 앱입니다.
// 로그인·이메일 인증한 사용자별로 자기 지출만 보고/추가/삭제할 수 있습니다.
export default function App() {
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [split, setSplit] = useState(false);

  // 로그인 화면용 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return subscribeAuth((u) => {
      setUser(u);
      setVerified(!!u?.emailVerified);
      setAuthReady(true);
    });
  }, []);

  const handleAuth = async (mode) => {
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        setInfo("인증 메일을 보냈어요. 메일함에서 링크를 누른 뒤 아래 버튼으로 확인하세요.");
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

  // 이메일 인증 완료 여부를 새로고침
  const handleCheckVerified = async () => {
    setBusy(true);
    const ok = await refreshUser();
    setVerified(ok);
    if (!ok) setInfo("아직 인증이 확인되지 않았어요. 메일의 링크를 누른 뒤 다시 시도하세요.");
    setBusy(false);
  };

  const handleResend = async () => {
    await sendVerification();
    setInfo("인증 메일을 다시 보냈어요. 메일함(스팸함도)을 확인하세요.");
  };

  if (!authReady) {
    return <div className="container">불러오는 중…</div>;
  }

  // 가계부 본문 (일반 모드와 분할 모드에서 공통으로 사용)
  const body = user && (
    <div className="memo-body">
      <ExpenseTracker uid={user.uid} />
    </div>
  );

  return (
    <div className="container">
      {isDemo && (
        <div className="demo-banner">
          🧪 데모 모드 — 데이터는 이 브라우저에만 저장됩니다.
        </div>
      )}

      {!(user && verified) && <h1>💰 helloworld 가계부</h1>}

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
          {info && <p className="info">{info}</p>}
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
      ) : !verified ? (
        <div className="card">
          <p>
            <b>{user.email}</b> 으로 인증 메일을 보냈어요.
            <br />
            메일함에서 링크를 누른 뒤 아래 버튼을 눌러주세요.
          </p>
          {info && <p className="info">{info}</p>}
          <div className="auth-buttons">
            <button disabled={busy} onClick={handleCheckVerified}>
              인증했어요
            </button>
            <button className="secondary" onClick={handleResend}>
              메일 다시 보내기
            </button>
          </div>
          <p style={{ marginTop: 12 }}>
            <button className="secondary" onClick={() => logout()}>
              로그아웃
            </button>
          </p>
        </div>
      ) : (
        <>
          <header className="appbar">
            <span className="appbar-title">💰 가계부</span>
            <span className="appbar-actions">
              <button className="secondary" onClick={() => setSplit((s) => !s)}>
                {split ? "분할 끄기" : "분할"}
              </button>
              <button onClick={() => logout()}>로그아웃</button>
            </span>
          </header>

          {split ? <SplitLayout top={<WebPane />} bottom={body} /> : body}
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
