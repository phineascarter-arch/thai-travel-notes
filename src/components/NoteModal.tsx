import { useEffect } from "react";
import type { Note } from "../data/notes";
import SpeakButton from "./SpeakButton";
import BookmarkButton from "./BookmarkButton";

interface Props {
  note: Note;
  hasPrev: boolean;
  hasNext: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function NoteModal({
  note,
  hasPrev,
  hasNext,
  isBookmarked,
  onToggleBookmark,
  onClose,
  onPrev,
  onNext,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="note-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="關閉">
          ×
        </button>
        <div className="modal-label-row">
          <p className="modal-label">
            DAY {note.day} · {note.date}
          </p>
          <BookmarkButton active={isBookmarked} onToggle={onToggleBookmark} />
        </div>

        <div className="word-heading">
          <div className="word-heading-row">
            <div>
              <h2 lang="th">{note.thai}</h2>
              <p>{note.roman}</p>
            </div>
            <SpeakButton text={note.thai} />
          </div>
        </div>

        <div className="meaning">
          <span>意思</span>
          <strong>{note.zh}</strong>
          <i>{note.category}</i>
        </div>

        {note.pattern && (
          <div className="pattern">
            <span>句型</span>
            <code>{note.pattern}</code>
          </div>
        )}

        {note.examples.map((ex, i) => (
          <div className="example" key={i}>
            <span>例句 {i + 1}</span>
            <h3>{ex.zh}</h3>
            <div className="example-thai-row">
              <p lang="th">{ex.thai}</p>
              <SpeakButton text={ex.thai} size="sm" />
            </div>
            <em>{ex.roman}</em>
            <div className="token-grid">
              {ex.tokens.map((t, j) => (
                <div className="token-card" key={j}>
                  <div className="token-top">
                    <b lang="th">{t.thai}</b>
                    <SpeakButton text={t.thai} size="sm" rate={0.82} />
                  </div>
                  <em>{t.roman}</em>
                  <span>{t.zh}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {note.note && <p className="supplement">{note.note}</p>}

        <div className="modal-nav">
          <button onClick={onPrev} disabled={!hasPrev}>
            ← 上一篇
          </button>
          <button onClick={onNext} disabled={!hasNext}>
            下一篇 →
          </button>
        </div>
      </div>
    </div>
  );
}
