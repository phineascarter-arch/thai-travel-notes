import { useCallback, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { DockOffset } from "../lib/dockOffset";

export type DockPhase = "idle" | "dragging" | "docked";

interface UseDockingDragOptions {
  // 拖拽超過門檻放開、或呼叫 dockNow() 的當下才會呼叫，量測「唱片現在
  // 的位置」跟「撥放器轉盤的位置」算出對接用的位移／縮放比例。放在
  // callback 裡而不是預先算好，是因為唱片在架上的座標只有觸發當下才
  // 準確（重新整理頁面抽到不同筆記、視窗尺寸改變都會影響座標）。
  // currentOffset 是呼叫當下唱片身上「已經套用」的拖拽位移（放開時是
  // dragOffsetRef.current，dockNow() 沒有拖拽過程所以是 {x:0,y:0}）：
  // getBoundingClientRect() 量到的矩形已經反映這個位移，呼叫端要拿它
  // 扣掉才能還原「架上原本、還沒被拖拽影響」的座標，否則算出來的對接
  // 位移會少掉這一段，唱片飛過去時會偏移「拖拽距離」那麼多。
  getDockTarget: (currentOffset: { x: number; y: number }) => DockOffset;
  onDock: () => void;
  // 使用者主動點擊／按 Enter 或 Space 把已對接的唱片拿下來時呼叫。
  onRemove: () => void;
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
    onClick: (e: ReactMouseEvent<HTMLDivElement>) => void;
  };
  dockNow: () => void;
  removeNow: () => void;
  undock: () => void;
}

const IDLE_OFFSET: DockOffset = { x: 0, y: 0, scale: 1 };

// 唱片「拖到撥放器上」的手勢狀態機：idle（在架上）→ dragging（跟著
// 指標移動，位移用 scale:1 讓唱片維持原本大小、只是鬆鬆跟著手指）→
// docked（超過門檻放開，或鍵盤觸發 dockNow()，套用 getDockTarget()
// 算出的精確位移／縮放，疊到轉盤上）。docked 會一直留著、唱片持續
// 旋轉，不會自動離開——只有使用者點擊／按 Enter 或 Space（onClick/
// removeNow，觸發 onRemove）或是被別的唱片打斷（呼叫端直接呼叫
// undock()）才會回到 idle。
export function useDockingDrag({
  getDockTarget,
  onDock,
  onRemove,
  dragThreshold = 70,
}: UseDockingDragOptions): UseDockingDragResult {
  const [phase, setPhase] = useState<DockPhase>("idle");
  const [offset, setOffset] = useState<DockOffset>(IDLE_OFFSET);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // 拖拽超過門檻放開的那個 pointerup，瀏覽器隨後會再合成一個 click
  // 事件。那次拖拽本身已經完成一次對接，若不擋掉這個合成 click，會被
  // onClick 誤判成「使用者點擊已對接的唱片、要拿下來」，唱片前腳剛
  // 對接、後腳馬上被拿下來。這個 ref 只在「這次 pointerup 剛好完成
  // 一次對接」時設成 true，讓緊接著的那次合成 click 被吞掉一次，之後
  // 恢復正常。
  const suppressClickRef = useRef(false);

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
      suppressClickRef.current = true;
      setPhase("docked");
      setOffset(getDockTarget(dragOffsetRef.current));
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
    setOffset(getDockTarget({ x: 0, y: 0 }));
    onDock();
  }, [phase, getDockTarget, onDock]);

  const undock = useCallback(() => {
    setPhase("idle");
    setOffset(IDLE_OFFSET);
  }, []);

  const removeNow = useCallback(() => {
    if (phase !== "docked") return;
    undock();
    onRemove();
  }, [phase, undock, onRemove]);

  const onClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (phase === "docked") {
      undock();
      onRemove();
    }
  }, [phase, undock, onRemove]);

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
    dockNow,
    removeNow,
    undock,
  };
}
