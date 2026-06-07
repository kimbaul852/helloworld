import { useEffect, useState } from "react";
import {
  subscribeExpenses,
  addExpense,
  removeExpense,
  getReceiptImage,
} from "../backend";

const CATEGORIES = ["식비", "카페", "교통", "쇼핑", "생활", "의료", "기타"];
const CAT_EMOJI = {
  식비: "🍱",
  카페: "☕",
  교통: "🚇",
  쇼핑: "🛍️",
  생활: "🏠",
  의료: "💊",
  기타: "📦",
};

function todayStr() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function won(n) {
  return "₩" + Number(n || 0).toLocaleString("ko-KR");
}

// 사진을 캔버스로 줄이고 JPEG로 압축해 data URL로 반환 (Firestore에 넣기 위함)
function compressImage(file, maxDim = 1024, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ExpenseTracker({ uid }) {
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  // 입력 폼
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(todayStr());
  const [image, setImage] = useState(null); // 압축된 data URL
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 상세 보기
  const [detail, setDetail] = useState(null);
  const [detailImg, setDetailImg] = useState(null);

  useEffect(() => subscribeExpenses(uid, setExpenses), [uid]);

  const month = todayStr().slice(0, 7);
  const monthTotal = expenses
    .filter((e) => (e.date || "").startsWith(month))
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setImage(await compressImage(file));
    } catch {
      setError("사진을 처리하지 못했어요.");
    }
  };

  const reset = () => {
    setAmount("");
    setMerchant("");
    setCategory(CATEGORIES[0]);
    setDate(todayStr());
    setImage(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("금액을 올바르게 입력하세요.");
      return;
    }
    if (!merchant.trim()) {
      setError("가게명을 입력하세요.");
      return;
    }
    setBusy(true);
    try {
      await addExpense(
        uid,
        { amount: amt, merchant: merchant.trim(), category, date },
        image
      );
      reset();
      setShowAdd(false);
    } catch (err) {
      setError("저장에 실패했어요: " + (err?.message ?? ""));
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (exp) => {
    setDetail(exp);
    setDetailImg(null);
    if (exp.hasReceipt) {
      setDetailImg(await getReceiptImage(exp.id));
    }
  };

  const del = async (id) => {
    await removeExpense(id);
    setDetail(null);
  };

  return (
    <div className="expense">
      <div className="exp-summary">
        <span>이번 달 지출</span>
        <b>{won(monthTotal)}</b>
      </div>

      {!showAdd ? (
        <button className="exp-add-btn" onClick={() => setShowAdd(true)}>
          + 지출 추가
        </button>
      ) : (
        <form className="exp-form" onSubmit={submit}>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="금액 (원)"
          />
          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="가게명"
          />
          <div className="exp-row">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_EMOJI[c]} {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <label className="exp-photo">
            {image ? "📷 영수증 첨부됨 (다시 선택)" : "📷 영수증 사진 (선택)"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={pickImage}
              hidden
            />
          </label>
          {image && <img className="exp-preview" src={image} alt="미리보기" />}

          {error && <p className="error">{error}</p>}

          <div className="exp-form-actions">
            <button type="submit" disabled={busy}>
              {busy ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                reset();
                setShowAdd(false);
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}

      <ul className="exp-list">
        {expenses.length === 0 && (
          <li className="empty">아직 지출 내역이 없어요.</li>
        )}
        {expenses.map((e) => (
          <li key={e.id} onClick={() => openDetail(e)}>
            <span className="exp-cat">{CAT_EMOJI[e.category] ?? "📦"}</span>
            <span className="exp-info">
              <span className="exp-merchant">{e.merchant}</span>
              <span className="exp-date">
                {e.date} {e.hasReceipt && "📎"}
              </span>
            </span>
            <span className="exp-amount">{won(e.amount)}</span>
          </li>
        ))}
      </ul>

      {detail && (
        <div className="exp-modal" onClick={() => setDetail(null)}>
          <div className="exp-modal-box" onClick={(ev) => ev.stopPropagation()}>
            <h3>
              {CAT_EMOJI[detail.category] ?? "📦"} {detail.merchant}
            </h3>
            <p className="exp-modal-amount">{won(detail.amount)}</p>
            <p className="exp-modal-meta">
              {detail.category} · {detail.date}
            </p>
            {detail.hasReceipt ? (
              detailImg ? (
                <img className="exp-receipt" src={detailImg} alt="영수증" />
              ) : (
                <p className="info">영수증 불러오는 중…</p>
              )
            ) : (
              <p className="exp-modal-meta">첨부된 영수증 없음</p>
            )}
            <div className="exp-form-actions">
              <button className="danger" onClick={() => del(detail.id)}>
                삭제
              </button>
              <button className="secondary" onClick={() => setDetail(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
