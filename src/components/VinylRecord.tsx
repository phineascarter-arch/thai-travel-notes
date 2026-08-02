import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Note } from "../data/notes";
import { computeDockOffset } from "../lib/dockOffset";
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

  const getDockTarget = useCallback((currentOffset: { x: number; y: number }) => {
    const vinyl = vinylRef.current;
    const platter = platterRef.current;
    if (!vinyl || !platter) return { x: 0, y: 0, scale: 1 };
    const vinylRect = vinyl.getBoundingClientRect();
    // vinylRect 反映的是「目前套用的 transform 之後」的位置；拖拽放開的
    // 當下，.vinyl 身上還留著這次拖拽的 translate(currentOffset)，量出來
    // 的矩形要先扣掉這個已經套用的位移，才會是「原本在架上、還沒被拖拽
    // 影響」的真實座標。不扣掉的話，算出來的對接位移會少了 currentOffset
    // 這一段，唱片會偏移「拖拽距離」那麼多，飛不到轉盤正中央。
    const restingRect = {
      left: vinylRect.left - currentOffset.x,
      top: vinylRect.top - currentOffset.y,
      width: vinylRect.width,
      height: vinylRect.height,
    };
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
      onPointerDown={handlers.onPointerDown}
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
