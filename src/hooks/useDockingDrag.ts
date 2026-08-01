import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { DockOffset } from "../lib/dockOffset";

export type DockPhase = "idle" | "dragging" | "docked";

interface UseDockingDragOptions {
  // 拖拽超過門檻放開、或呼叫 dockNow() 的當下才會呼叫，量測「唱片現在
  // 的位置」跟「撥放器轉盤的位置」算出對接用的位移／縮放比例。放在
  // callback 裡而不是預先算好，是因為唱片在架上的座標只有觸發當下才
  // 準確（重新整理頁面抽到不同筆記、視窗尺寸改變都會影響座標）。
  getDockTarget: () => DockOffset;
  onDock: () => void;
  dragThreshold?: number;
}

interface UseDockingDragResult {
  phase: DockPhase;
  offset: DockOffset;
  handlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
  };
  dockNow: () => void;
  undock: () => void;
}

const IDLE_OFFSET: DockOffset = { x: 0, y: 0, scale: 1 };

// 唱片「拖到撥放器上」的手勢狀態機：idle（在架上）→ dragging（跟著
// 指標移動，位移用 scale:1 讓唱片維持原本大小、只是鬆鬆跟著手指）→
// docked（超過門檻放開，或鍵盤觸發 dockNow()，套用 getDockTarget()
// 算出的精確位移／縮放，疊到轉盤上）。docked 不是終點狀態：呼叫端
// （VinylRecord）會在播放結束或被別的唱片打斷時呼叫 undock()，讓唱片
// 飛回架上原位。
export function useDockingDrag({
  getDockTarget,
  onDock,
  dragThreshold = 70,
}: UseDockingDragOptions): UseDockingDragResult {
  const [phase, setPhase] = useState<DockPhase>("idle");
  const [offset, setOffset] = useState<DockOffset>(IDLE_OFFSET);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase === "docked") return;
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
      dragOffsetRef.current = next;
      setOffset({ ...next, scale: 1 });
    },
    [phase]
  );

  const release = useCallback(() => {
    if (phase !== "dragging" || !startRef.current) return;
    const dist = Math.hypot(dragOffsetRef.current.x, dragOffsetRef.current.y);
    if (dist >= dragThreshold) {
      setPhase("docked");
      setOffset(getDockTarget());
      onDock();
    } else {
      setPhase("idle");
      setOffset(IDLE_OFFSET);
    }
    startRef.current = null;
  }, [phase, dragThreshold, getDockTarget, onDock]);

  const dockNow = useCallback(() => {
    if (phase === "docked") return;
    setPhase("docked");
    setOffset(getDockTarget());
    onDock();
  }, [phase, getDockTarget, onDock]);

  const undock = useCallback(() => {
    setPhase("idle");
    setOffset(IDLE_OFFSET);
  }, []);

  return {
    phase,
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
    },
    dockNow,
    undock,
  };
}
