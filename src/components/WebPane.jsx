import { useState } from "react";

// 위쪽 패널: 주소를 입력해 다른 웹사이트를 띄웁니다.
// 단, 사이트가 iframe 삽입을 허용한 경우에만 보입니다(구글 등은 막혀 있어요).
export default function WebPane() {
  const [url, setUrl] = useState("https://example.com");
  const [src, setSrc] = useState("https://example.com");

  const go = (e) => {
    e.preventDefault();
    let u = url.trim();
    if (!u) return;
    // https가 없으면 붙여줌 (https 페이지라 http는 못 띄움)
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    setUrl(u);
    setSrc(u);
  };

  return (
    <div className="webpane">
      <form className="webbar" onSubmit={go}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button type="submit">이동</button>
      </form>
      <iframe className="webframe" src={src} title="외부 웹사이트" />
    </div>
  );
}
