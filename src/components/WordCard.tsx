import type { PoolWord } from "../lib/wordPool";
import SpeakButton from "./SpeakButton";

interface Props {
  word: PoolWord;
  x: number;
  y: number;
  onClose: () => void;
}

// 純展示元件：位置由呼叫端（Boat）算好的 x/y（相對於河道容器左上角的
// 像素座標）決定，本身不知道自己在哪艘船旁邊、也不知道船還在不在動。
export default function WordCard({ word, x, y, onClose }: Props) {
  return (
    <div className="word-card" style={{ left: x, top: y }} role="status">
      <button type="button" className="word-card-close" aria-label="關閉" onClick={onClose}>
        ×
      </button>
      <div className="word-card-row">
        <strong lang="th">{word.thai}</strong>
        <SpeakButton text={word.thai} size="sm" rate={0.82} />
      </div>
      <em>{word.roman}</em>
      <span>{word.zh}</span>
    </div>
  );
}
