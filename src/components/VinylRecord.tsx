import { useMemo } from "react";
import type { Note } from "../data/notes";
import { useDraggableLift } from "../hooks/useDraggableLift";
import { useSpeech } from "../hooks/useSpeech";
import SpeakButton from "./SpeakButton";

interface Props {
  note: Note;
  accent: "rust" | "orange" | "gold";
  tilt: 1 | 2 | 3;
}

export default function VinylRecord({ note, accent, tilt }: Props) {
  const { speak } = useSpeech();
  const { phase, offset, handlers, liftNow } = useDraggableLift({
    onLift: () => speak(note.thai),
  });

  const isLifted = phase === "lifted";
  const isDragging = phase === "dragging";

  const ariaLabel = isLifted
    ? `Day ${note.day}：${note.thai}，${note.zh}，播放發音`
    : "拖曳或按 Enter 拿起唱片，聽聽今天抽到哪一句";

  const style = useMemo(
    () => ({ transform: `translate(${offset.x}px, ${offset.y}px)` }),
    [offset.x, offset.y]
  );

  return (
    <div className={`record-sleeve record-tilt-${tilt} accent-${accent}`}>
      <div
        className={`vinyl ${isDragging ? "vinyl-dragging" : ""} ${isLifted ? "vinyl-lifted" : ""}`}
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
            liftNow();
          }
        }}
      >
        <span className="vinyl-label">
          {isLifted ? (
            <>
              <strong lang="th">{note.thai}</strong>
              <em>{note.roman}</em>
              <b>{note.zh}</b>
            </>
          ) : (
            <span className="vinyl-mystery">?</span>
          )}
        </span>
      </div>
      {isLifted && (
        <div className="vinyl-replay">
          <SpeakButton text={note.thai} size="sm" />
        </div>
      )}
    </div>
  );
}
