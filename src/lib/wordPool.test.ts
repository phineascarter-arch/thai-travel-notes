import { describe, it, expect } from "vitest";
import { wordPool } from "./wordPool";
import { CATEGORIES } from "../data/notes";

describe("wordPool", () => {
  it("is not empty", () => {
    expect(wordPool.length).toBeGreaterThan(0);
  });

  it("has no duplicate thai entries", () => {
    const thaiTexts = wordPool.map((w) => w.thai);
    expect(new Set(thaiTexts).size).toBe(thaiTexts.length);
  });

  it("gives every word a non-empty roman/zh and a valid category", () => {
    for (const word of wordPool) {
      expect(word.roman.length).toBeGreaterThan(0);
      expect(word.zh.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(word.category);
    }
  });
});
