import { describe, it, expect } from "vitest";
import { computeDockOffset } from "./dockOffset";

describe("computeDockOffset", () => {
  it("computes the delta between the two rects' centers", () => {
    const source = { left: 100, top: 200, width: 92, height: 92 };
    const target = { left: 300, top: 50, width: 92, height: 92 };
    const result = computeDockOffset(source, target);
    expect(result.x).toBe(200);
    expect(result.y).toBe(-150);
    expect(result.scale).toBe(1);
  });

  it("computes a scale factor based on the target's size relative to the source", () => {
    const source = { left: 0, top: 0, width: 80, height: 80 };
    const target = { left: 0, top: 0, width: 120, height: 120 };
    const result = computeDockOffset(source, target);
    expect(result.scale).toBe(1.5);
  });

  it("returns zero offset and scale 1 when source and target are the same rect", () => {
    const rect = { left: 50, top: 50, width: 100, height: 100 };
    const result = computeDockOffset(rect, rect);
    expect(result).toEqual({ x: 0, y: 0, scale: 1 });
  });
});
