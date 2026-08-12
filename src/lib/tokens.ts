// 保留「第一次出現」的版本，不是最後一次——設計規格要求重複詞要用最早出現
// 的那筆。之前有一版改用 Map 存值（後面的 key 相同會直接覆蓋前面的），會
// 悄悄變成保留最後一筆，這裡故意用 filter + Set 避免那個回歸。
export function dedupeByThai<T extends { thai: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.thai)) {
      return false;
    }
    seen.add(item.thai);
    return true;
  });
}
