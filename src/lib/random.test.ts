import { describe, it, expect } from "vitest";
import { pickRandom } from "./random";

describe("pickRandom", () => {
  it("returns exactly n items when n is less than the array length", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr, 3);
    expect(result).toHaveLength(3);
  });

  it("returns items that all exist in the original array with no duplicates", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const result = pickRandom(arr, 3);
    expect(new Set(result).size).toBe(3);
    for (const item of result) {
      expect(arr).toContain(item);
    }
  });

  it("clamps to the array length when n exceeds it, without crashing or duplicating", () => {
    const arr = [1, 2];
    const result = pickRandom(arr, 5);
    expect(result).toHaveLength(2);
    expect(new Set(result).size).toBe(2);
  });

  it("returns an empty array when given an empty array", () => {
    expect(pickRandom([], 3)).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    pickRandom(arr, 3);
    expect(arr).toEqual(copy);
  });
});
