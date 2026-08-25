import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Note } from "../data/notes";
import { computeDockOffset, type Rect } from "../lib/dockOffset";
import { useDockingDrag } from "../hooks/useDockingDrag";
import { useSpeech } from "../hooks/useSpeech";

interface Props {
  note: Note;
  accent: "rust" | "orange" | "gold";
  platterRef: RefObject<HTMLDivElement | null>;
  isActive: boolean;
  onDock: (day: number) => void;
  onUndock: (day: number) => void;
}

export default function VinylRecord({ note, accent, platterRef, isActive, onDock, onUndock }: Props) {
  const { speak, stop } = useSpeech();
  const vinylRef = useRef<HTMLDivElement>(null);
  // 手指按下、拖拽都還沒開始套用位移的那一刻先量好「架上原本」的矩形，
  // 放開時直接拿來用。原本是放開當下重新量 vinylRect 再扣掉 currentOffset
  // 反推回去，但 currentOffset（ref，同步更新）跟畫面上實際套用的
  // transform（React state 驅動，非同步 commit）在真實觸控快速滑動放開
  // 時可能對不上——上一次 pointermove 的 setOffset 還沒 commit，
  // pointerup 就已經觸發，量到的矩形停在更舊的一幀，扣出來的「原本
  // 座標」整個算錯，唱片對接會飛到完全不相干的位置（用手機測試才會
  // 重現，這裡的合成事件測試因為是同步觸發，不會踩到這個時間差）。
  const restingRectRef = useRef<Rect | null>(null);

  const captureRestingRect = useCallback(() => {
    const vinyl = vinylRef.current;
    if (!vinyl) return;
    restingRectRef.current = vinyl.getBoundingClientRect();
  }, []);

  const getDockTarget = useCallback((currentOffset: { x: number; y: number }) => {
    const vinyl = vinylRef.current;
    const platter = platterRef.current;
    if (!vinyl || !platter) return { x: 0, y: 0, scale: 1 };
    // currentOffset 只有在鍵盤觸發的 dockNow()（沒有拖拽過程）才會是
    // {0,0}——拖拽放開要呼叫到這裡，dist 必須 >= dragThreshold(70)，
    // 兩者不可能同時是 0。是 {0,0} 時唱片還在原位、沒套用任何 transform，
    // 直接量當下矩形就準確，不需要也不能用（可能是上一次拖拽留下的）
    // restingRectRef。
    const restingRect =
      currentOffset.x === 0 && currentOffset.y === 0
        ? vinyl.getBoundingClientRect()
        : (restingRectRef.current ?? vinyl.getBoundingClientRect());
    return computeDockOffset(restingRect, platter.getBoundingClientRect());
  }, [platterRef]);

  const handleDockRequest = useCallback(() => onDock(note.day), [onDock, note.day]);
  const handleRemoveRequest = useCallback(() => {
    stop();
    onUndock(note.day);
  }, [stop, onUndock, note.day]);

  const { phase, offset, handlers, dockNow, removeNow, undock } = useDockingDrag({
    getDockTarget,
    onDock: handleDockRequest,
    onRemove: handleRemoveRequest,
  });

  const isDocked = phase === "docked";
  const isDragging = phase === "dragging";

  // 對接成功後播放一次語音。不會自動下架——唱片會持續留在轉盤上旋轉，
  // 直到使用者點擊／按 Enter 或 Space 主動拿下來（onClick/removeNow，
  // 見 useDockingDrag），或是被別的唱片打斷（下面第二個 effect）。故意
  // 只依賴 [isDocked]：note 在同一次對接期間不會變，列進依賴只會讓
  // effect 在無關的重新渲染時誤重跑、打斷正在播放的語音。
  // oxlint-disable react/exhaustive-deps
  useEffect(() => {
    if (!isDocked) return;
    speak(note.thai);
  }, [isDocked]);
  // oxlint-enable react/exhaustive-deps

  // 被別的唱片搶走撥放器：isActive 從 true 變 false 時立刻中斷、飛回原位。
  useEffect(() => {
    if (!isActive && isDocked) {
      undock();
    }
  }, [isActive, isDocked, undock]);

  const ariaLabel = isDocked
    ? `Day ${note.day}：${note.thai}，${note.zh}，播放中，點擊或按 Enter 拿下唱片`
    : "拖曳或按 Enter 把唱片放上撥放器";

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.scale})`,
  };

  return (
    <div
      ref={vinylRef}
      className={`vinyl accent-${accent} ${isDragging ? "vinyl-dragging" : ""} ${isDocked ? "vinyl-docked" : ""}`}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onPointerDown={(e) => {
        captureRestingRect();
        handlers.onPointerDown(e);
      }}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onClick={handlers.onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isDocked) {
            removeNow();
          } else {
            dockNow();
          }
        }
      }}
    >
      <div className="vinyl-disc">
        <span className="vinyl-label">
          <span className="vinyl-mystery">?</span>
        </span>
      </div>
    </div>
  );
}
