import type { RefObject } from "react";
import type { Note } from "../data/notes";

interface Props {
  isPlaying: boolean;
  activeNote: Note | null;
  platterRef: RefObject<HTMLDivElement | null>;
}

// 撥放器本身是完全無狀態的顯示元件：唱臂角度、轉盤/唱片旋轉動畫（旋轉
// 動畫實際上套用在 VinylRecord 自己的 .vinyl-disc 上，不是這裡）、下方
// 標籤區的內容，全部只看 isPlaying / activeNote 這兩個 prop，不知道
// 拖拽或語音播放的細節。platterRef 是轉盤的 DOM 節點，讓 VinylRecord
// 量測位置算出對接時要飛過去的位移量。
export default function RecordPlayer({ isPlaying, activeNote, platterRef }: Props) {
  return (
    <div className="record-player">
      <div className="record-player-body">
        <div className="record-player-platter" ref={platterRef} />
        <div className={`record-player-arm ${isPlaying ? "record-player-arm-down" : ""}`} />
        <div className="record-player-knob" />
      </div>
      <div className={`record-player-caption ${activeNote ? "record-player-caption-visible" : ""}`}>
        {activeNote ? (
          <>
            <strong lang="th">{activeNote.thai}</strong>
            <em>{activeNote.roman}</em>
            <b>{activeNote.zh}</b>
          </>
        ) : (
          <span>把唱片拖上來聽聽看</span>
        )}
      </div>
    </div>
  );
}
