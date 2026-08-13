import type { PoolWord } from "../lib/wordPool";
import SpeakButton from "./SpeakButton";

interface Props {
  word: PoolWord;
  onClose: () => void;
}

// 純展示元件：固定顯示在運河上方天空的位置(見 style.css 的
// .word-card)，不用再算自己該疊在哪隻大象旁邊——AyutthayaCanal
// 一次只會顯示一張。
export default function WordCard({ word, onClose }: Props) {
  return (
    <div className="word-card">
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
