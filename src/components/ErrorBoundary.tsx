import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// 這個 app 完全沒有 Error Boundary 包著的話，畫面任何地方（哪怕是很少
// 被走到的路徑）丟出一個沒接住的 render 期例外，React 19 預設會直接把
// 整個 App 解除掛載，變成一片空白，使用者連「發生什麼事、要不要重新
// 整理」都看不到提示。這裡包最外層，接住意外狀況時至少給一個說明和
// 重新整理的按鈕。故意用 inline style 不吃 style.css 的 class——萬一
// 出問題的當下站方樣式表本身也不可靠，這個救援畫面不該跟著一起壞掉。
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught an error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            background: "#f4f1ea",
            color: "#2e2a24",
          }}
        >
          <p style={{ fontSize: 18, margin: 0 }}>畫面出了一點問題</p>
          <p style={{ fontSize: 14, margin: 0, color: "#867b69" }}>重新整理通常就能恢復</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              border: "1px solid #d8cfbc",
              borderRadius: 8,
              background: "#b3572a",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            重新整理
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
