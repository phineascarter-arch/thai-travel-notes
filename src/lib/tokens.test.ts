import { describe, it, expect } from "vitest";
import { dedupeByThai } from "./tokens";

describe("dedupeByThai", () => {
  it("keeps only the first occurrence when thai text repeats", () => {
    const items = [
      { thai: "ค่ะ", roman: "khâ", zh: "禮貌詞尾" },
      { thai: "กิน", roman: "gin", zh: "吃" },
      { thai: "ค่ะ", roman: "khâ", zh: "重複，應該被丟掉" },
    ];
    const result = dedupeByThai(items);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.thai)).toEqual(["ค่ะ", "กิน"]);
    expect(result[0].zh).toBe("禮貌詞尾");
  });

  it("preserves items unchanged when there are no duplicates", () => {
    const items = [
      { thai: "a", roman: "a", zh: "a" },
      { thai: "b", roman: "b", zh: "b" },
    ];
    expect(dedupeByThai(items)).toEqual(items);
  });

  it("returns an empty array when given an empty array", () => {
    expect(dedupeByThai([])).toEqual([]);
  });
});
