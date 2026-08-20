import { useCallback, useState } from "react";
import { getBookmarkedDays, toggleBookmark } from "../lib/bookmarks";

// 狀態統一放在呼叫端最上層（App.tsx）一份，往下傳給時間軸列表跟筆記
// 彈窗——不讓每個卡片各自呼叫、各自持有一份 Set，不然某張卡片收藏後，
// 畫面上其他還沒重新讀 localStorage 的卡片會暫時顯示過期的收藏狀態。
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<number>>(getBookmarkedDays);

  const toggle = useCallback((day: number) => {
    setBookmarks(toggleBookmark(day));
  }, []);

  return { bookmarks, toggle };
}
