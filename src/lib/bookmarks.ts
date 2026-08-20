// 使用者手動收藏的 Day（localStorage）。跟 progress.ts 的答題統計不同——
// 那個是「答錯越多、越常被抽到」的自動權重，這個是使用者自己主動標記
// 「這句我想特別記住／之後想再複習」，兩者互不影響、可以同時存在。

const BOOKMARKS_KEY = "thai-notes-bookmarks";

function loadBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(days: Set<number>) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...days]));
}

export function getBookmarkedDays(): Set<number> {
  return loadBookmarks();
}

export function toggleBookmark(day: number): Set<number> {
  const days = loadBookmarks();
  if (days.has(day)) days.delete(day);
  else days.add(day);
  saveBookmarks(days);
  return days;
}
