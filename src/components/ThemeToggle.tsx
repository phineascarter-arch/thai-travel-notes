import { useTheme } from "../hooks/useTheme";

// 用 inline SVG 畫太陽／月亮，不用 emoji——emoji 圖示在不同系統上長得
// 差很多（Windows/Mac/Android 各自的 emoji 字型不一樣），跟這次順手把
// cursive 字型、泰文字型都換成明確指定字型是同一個「別交給系統猜」的邏輯。
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "切換成淺色模式" : "切換成深色模式"}
      title={isDark ? "切換成淺色模式" : "切換成深色模式"}
      onClick={toggleTheme}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5" />
            <path d="M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6" />
          </g>
        </svg>
      )}
    </button>
  );
}
