interface Props {
  active: boolean;
  onToggle: () => void;
  size?: "md" | "sm";
}

// 跟 SpeakButton 同樣的理由要 stopPropagation：這顆按鈕常常放在整張卡片
// 本身就是可點擊的 role="button" 容器裡面，不擋掉冒泡的話點收藏會
// 連帶把卡片也打開/關閉。星星用 SVG 畫、不用 emoji（跟這次幫深色模式
// 切換鈕挑圖示是同一個理由：emoji 在不同系統長得不一樣）。
export default function BookmarkButton({ active, onToggle, size = "md" }: Props) {
  return (
    <button
      type="button"
      className={`bookmark-btn ${active ? "bookmark-btn-active" : ""} ${size === "sm" ? "bookmark-btn-sm" : ""}`}
      aria-label={active ? "取消收藏" : "加入收藏"}
      aria-pressed={active}
      title={active ? "取消收藏" : "加入收藏"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 3.5Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
