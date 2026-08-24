// 本機學習紀錄（localStorage）：每個單字的答對/答錯次數 + 真實造訪天數。
// 全部存在使用者自己的瀏覽器裡，不會上傳到任何地方。

import { safeGetItem, safeSetItem } from "./storage";

const WORD_STATS_KEY = "thai-notes-word-stats";
const VISITED_DAYS_KEY = "thai-notes-visited-days";

interface WordStat {
  correct: number;
  wrong: number;
}

function loadWordStats(): Record<string, WordStat> {
  try {
    const raw = safeGetItem(WORD_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWordStats(stats: Record<string, WordStat>) {
  safeSetItem(WORD_STATS_KEY, JSON.stringify(stats));
}

export function recordAnswer(key: string, correct: boolean) {
  const stats = loadWordStats();
  const s = stats[key] ?? { correct: 0, wrong: 0 };
  if (correct) s.correct += 1;
  else s.wrong += 1;
  stats[key] = s;
  saveWordStats(stats);
}

// 錯得越多權重越高、越容易被抽到；答對次數多的字權重會慢慢降低，
// 但保留一個下限（0.3），不會完全從題庫裡消失。
export function weightOf(key: string): number {
  const s = loadWordStats()[key];
  if (!s) return 1;
  const base = 1 + s.wrong * 2.2;
  const decay = Math.max(0.3, 1 - s.correct * 0.15);
  return base * decay;
}

// ---------- 真實連續學習天數 ----------

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadVisitedDays(): Set<string> {
  try {
    const raw = safeGetItem(VISITED_DAYS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function recordVisitToday() {
  const days = loadVisitedDays();
  days.add(dateKey(new Date()));
  safeSetItem(VISITED_DAYS_KEY, JSON.stringify([...days]));
}

// 從今天開始往回數，只要連續有造訪紀錄就 +1，中斷就停止。
export function getStreak(): number {
  const days = loadVisitedDays();
  let streak = 0;
  const cursor = new Date();
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
