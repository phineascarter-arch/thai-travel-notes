// 統一包一層 try/catch 的 localStorage 存取。部分瀏覽器情境（例如舊版
// Safari 私密瀏覽模式，localStorage 配額被鎖成 0）呼叫 setItem 會直接
// 丟出例外，不是靜默失敗；少數環境 getItem 也可能丟例外而不是回傳
// null。這個 app 沒有全域 Error Boundary，讀寫 localStorage 失敗頂多該
// 讓「這筆資料存不進去／讀不到」，不該讓整個畫面掛掉——尤其
// getStoredTheme／複習測驗最高分這幾筆是在初次渲染就會呼叫到，沒包起來
// 的話會直接讓整個 App 一開始就白屏。

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 存不進去就放棄，不影響使用者當下這次互動繼續進行。
  }
}
