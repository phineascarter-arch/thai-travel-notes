import { useCallback, useEffect, useState } from "react";
import { safeGetItem, safeSetItem } from "../lib/storage";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  const saved = safeGetItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" ? saved : null;
}

// 三態邏輯：使用者從沒手動切換過時（explicitTheme 是 null），畫面要跟著
// 系統設定即時變化（例如手機到了晚上自動切成深色，網站也要跟著變），
// 這裡用 matchMedia 的 change 事件監聽而不是只在 mount 時讀一次。
// 一旦手動點過切換鈕，就記住這個明確選擇（存 localStorage），改用
// [data-theme] 蓋過系統設定，直到使用者自己再切一次。
export function useTheme() {
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemTheme(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = explicitTheme ?? systemTheme;

  useEffect(() => {
    if (explicitTheme) {
      document.documentElement.setAttribute("data-theme", explicitTheme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [explicitTheme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setExplicitTheme(next);
    safeSetItem(STORAGE_KEY, next);
  }, [resolvedTheme]);

  return { theme: resolvedTheme, toggleTheme };
}
