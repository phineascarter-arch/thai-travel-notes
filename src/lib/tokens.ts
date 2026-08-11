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
