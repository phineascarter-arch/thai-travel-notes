import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Note } from "../data/notes";
import { computeDockOffset } from "../lib/dockOffset";
import { useDockingDrag } from "../hooks/useDockingDrag";
import { useSpeech } from "../hooks/useSpeech";

const UNSUPPORTED_SPEECH_FALLBACK_MS = 3000;

interface Props {
  note: Note;
  accent: "rust" | "orange" | "gold";
  platterRef: RefObject<HTMLDivElement | null>;
  isActive: boolean;
  onDock: (day: number) => void;
  onUndock: (day: number) => void;
}

export default function VinylRecord({ note, accent, platterRef, isActive, onDock, onUndock }: Props) {
  const { speak, supported } = useSpeech();
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

  const { phase, offset, handlers, dockNow, undock } = useDockingDrag({
    getDockTarget,
    onDock: handleDockRequest,
  });

  const isDocked = phase === "docked";
  const isDragging = phase === "dragging";

  // 對接成功後才開始播放：播完（語音 onEnd）或不支援語音時的降級計時器
  // 一到，就飛回原位並通知 RecordWall 這張不再是作用中的那張。cleanup
  // 同時處理「正常播完」跟「被別的唱片打斷」（isDocked 從 true 變 false）
  // 兩種情況，靠 cancelled 旗標避免計時器/onEnd 在打斷之後才觸發而重複
  // 收尾。故意只依賴 [isDocked]：speak/supported/note 在同一次對接期間
  // 不會變，列進依賴只會讓 effect 在無關的重新渲染時誤重跑、打斷正在
  // 播放的語音。
  // oxlint-disable react/exhaustive-deps
  useEffect(() => {
    if (!isDocked) return;
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      undock();
      onUndock(note.day);
    };

    if (supported) {
      speak(note.thai, undefined, finish);
    } else {
      fallbackTimer = setTimeout(finish, UNSUPPORTED_SPEECH_FALLBACK_MS);
    }

    return () => {
      cancelled = true;
      if (fallbackTimer != null) clearTimeout(fallbackTimer);
    };
  }, [isDocked]);
  // oxlint-enable react/exhaustive-deps

  // 被別的唱片搶走撥放器：isActive 從 true 變 false 時立刻中斷、飛回原位。
  useEffect(() => {
    if (!isActive && isDocked) {
      undock();
    }
  }, [isActive, isDocked, undock]);

  const ariaLabel = isDocked
    ? `Day ${note.day}：${note.thai}，${note.zh}，播放中`
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dockNow();
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
