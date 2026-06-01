import { useRef, useState } from "react";

// 위/아래 두 패널을 보여주고, 가운데 경계선을 드래그해 크기를 조절합니다.
// 패널을 탭하면 그 패널이 "포커스(활성)" 표시됩니다.
export default function SplitLayout({ top, bottom }) {
  const [ratio, setRatio] = useState(50); // 위쪽 패널 비율(%)
  const [focused, setFocused] = useState("bottom");
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const onDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let r = ((e.clientY - rect.top) / rect.height) * 100;
    r = Math.min(85, Math.max(15, r));
    setRatio(r);
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div className="split" ref={containerRef}>
      <div
        className={"split-pane" + (focused === "top" ? " focused" : "")}
        style={{ height: `calc(${ratio}% - 7px)` }}
        onPointerDown={() => setFocused("top")}
      >
        {top}
      </div>

      <div
        className="split-divider"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        ⋯⋯⋯
      </div>

      <div
        className={"split-pane" + (focused === "bottom" ? " focused" : "")}
        style={{ height: `calc(${100 - ratio}% - 7px)` }}
        onPointerDown={() => setFocused("bottom")}
      >
        {bottom}
      </div>
    </div>
  );
}
