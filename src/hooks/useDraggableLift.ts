import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type LiftPhase = "idle" | "dragging" | "lifted";

interface Offset {
  x: number;
  y: number;
}

interface UseDraggableLiftOptions {
  onLift: () => void;
  liftThreshold?: number;
  liftOffset?: Offset;
}

interface UseDraggableLiftResult {
  phase: LiftPhase;
  offset: Offset;
  handlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
  };
  liftNow: () => void;
}

const ZERO: Offset = { x: 0, y: 0 };

// 把黑膠唱片「拖出封套」的手勢狀態機獨立成 hook：idle（蓋在封套下）→
// dragging（跟著指標移動）→ lifted（超過門檻，鎖定拿起、之後不再變回去）。
// 用 setPointerCapture 讓拖曳中途滑出元素範圍也不會斷線。
export function useDraggableLift({
  onLift,
  liftThreshold = 70,
  liftOffset = { x: 0, y: -96 },
}: UseDraggableLiftOptions): UseDraggableLiftResult {
  const [phase, setPhase] = useState<LiftPhase>("idle");
  const [offset, setOffset] = useState<Offset>(ZERO);
  const startRef = useRef<Offset | null>(null);
  const offsetRef = useRef<Offset>(ZERO);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase === "lifted") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY };
      setPhase("dragging");
    },
    [phase]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase !== "dragging" || !startRef.current) return;
      const next = {
        x: e.clientX - startRef.current.x,
        y: e.clientY - startRef.current.y,
      };
      offsetRef.current = next;
      setOffset(next);
    },
    [phase]
  );

  const release = useCallback(() => {
    if (phase !== "dragging" || !startRef.current) return;
    const dist = Math.hypot(offsetRef.current.x, offsetRef.current.y);
    if (dist >= liftThreshold) {
      setPhase("lifted");
      setOffset(liftOffset);
      onLift();
    } else {
      setPhase("idle");
      setOffset(ZERO);
    }
    startRef.current = null;
  }, [phase, liftThreshold, liftOffset, onLift]);

  const liftNow = useCallback(() => {
    if (phase === "lifted") {
      onLift();
      return;
    }
    setPhase("lifted");
    setOffset(liftOffset);
    onLift();
  }, [phase, liftOffset, onLift]);

  return {
    phase,
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
    },
    liftNow,
  };
}
