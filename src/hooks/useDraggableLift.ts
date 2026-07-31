import { useCallback, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

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
    onClick: (e: ReactMouseEvent<HTMLDivElement>) => void;
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
  // 拖曳超過門檻放開的那個 pointerup，瀏覽器隨後會再合成一個 click 事件。
  // 那次拖曳本身已經呼叫過一次 onLift()，若不擋掉這個合成 click，會變成
  // 同一個手勢觸發兩次 onLift()（在 VinylRecord 裡等於重播/取消重播兩次
  // speak()）。這個 ref 只在「這次 pointerup 剛好完成一次拿起」時設成
  // true，讓緊接著的那次合成 click 被吞掉一次，之後恢復正常。
  const suppressClickRef = useRef(false);

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
      suppressClickRef.current = true;
      setPhase("lifted");
      setOffset(liftOffset);
      onLift();
    } else {
      setPhase("idle");
      setOffset(ZERO);
    }
    startRef.current = null;
  }, [phase, liftThreshold, liftOffset, onLift]);

  const onClick = useCallback(() => {
    if (suppressClickRef.current) {
      // 吞掉剛剛那次拖曳拿起手勢所合成的 click，避免 onLift() 被多呼叫一次。
      suppressClickRef.current = false;
      return;
    }
    if (phase === "lifted") {
      // 已經拿起的唱片，單純點擊（沒有拖曳）＝重播發音。
      onLift();
    }
    // phase !== "lifted"（例如 "idle"）時，點擊不做任何事——
    // 唱片只能靠拖曳或鍵盤 Enter/Space 拿起，不能靠點擊拿起。
  }, [phase, onLift]);

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
      onClick,
    },
    liftNow,
  };
}
