import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import type { Category } from "../data/notes";
import type { PoolWord } from "../lib/wordPool";
import { useSpeech } from "../hooks/useSpeech";
import WordCard from "./WordCard";
import elephantImg from "../assets/elephant.png";

// 戰象背上插的小旗子顏色，取代原本水上市場版本的分類 emoji——
// 大城王朝的戰象確實會插旗，剛好保留「用顏色辨識分類」的功能。
const FLAG_COLOR: Record<Category, string> = {
  "閒聊": "#e07a3a",
  "機場／交通": "#3f66a3",
  "住宿": "#7fb542",
  "餐廳點餐": "#e0473a",
  "購物殺價": "#f2b23a",
};

const CARD_DISMISS_MS = 5000;
const CARD_WIDTH = 130; // matches src/style.css .word-card min-width
const CARD_HEIGHT_WITH_GAP = 105; // approx card height (~95px) + 10px gap
const CARD_EDGE_MARGIN = 8;

interface Props {
  word: PoolWord;
  lane: number;
  duration: number;
  delay: number;
  canalRef: RefObject<HTMLDivElement | null>;
  onExpire: () => void;
}

// 一隻大象只管兩件事：沿著運河漂移的 CSS 動畫（純樣式，交給 .elephant 的
// animation-name/-duration/-delay 處理），跟自己被點擊時要不要開一張
// WordCard。大象走到底（onAnimationEnd）會直接把整個 Elephant 卸載重建
// （由 AyutthayaCanal 換掉 key），所以這裡不需要自己清動畫狀態；如果
// 卡牌開著、大象剛好在這個時間點到站，卡牌會跟著一起消失——跟原本水上
// 市場版本的船是同一個刻意接受的邊界情況。
export default function Elephant({ word, lane, duration, delay, canalRef, onExpire }: Props) {
  const elephantRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<{ x: number; y: number; below: boolean } | null>(null);
  const { speak } = useSpeech();

  useEffect(() => {
    if (!card) return;
    const timer = setTimeout(() => setCard(null), CARD_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [card]);

  const handleClick = () => {
    if (card) {
      setCard(null);
      return;
    }
    const elephantEl = elephantRef.current;
    const canalEl = canalRef.current;
    if (!elephantEl || !canalEl) return;
    const elephantRect = elephantEl.getBoundingClientRect();
    const canalRect = canalEl.getBoundingClientRect();
    const topRel = elephantRect.top - canalRect.top;
    const below = topRel < CARD_HEIGHT_WITH_GAP;
    const halfCard = CARD_WIDTH / 2;
    const rawX = elephantRect.left - canalRect.left + elephantRect.width / 2;
    const minX = halfCard + CARD_EDGE_MARGIN;
    const maxX = canalRect.width - halfCard - CARD_EDGE_MARGIN;
    const x = Math.min(Math.max(rawX, minX), maxX);
    setCard({
      x,
      y: below ? elephantRect.bottom - canalRect.top : topRel,
      below,
    });
    speak(word.thai, 0.82);
  };

  const style = {
    top: `calc(37% + ${lane} * 1%)`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    // reduced-motion 停用動畫時的靜態備援位置，見 style.css 對應規則。
    "--static-left": `${8 + lane * 22}%`,
  } as CSSProperties;

  return (
    <>
      <div
        ref={elephantRef}
        className="elephant"
        style={style}
        role="button"
        tabIndex={0}
        aria-label={`聽聽 ${word.thai} 怎麼唸`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onAnimationEnd={onExpire}
      >
        <span className="elephant-flag" aria-hidden="true" style={{ background: FLAG_COLOR[word.category] }} />
        <img className="elephant-figure" src={elephantImg} alt="" aria-hidden="true" />
        <span className="elephant-label" lang="th">
          {word.thai}
        </span>
      </div>
      {card && (
        <WordCard word={word} x={card.x} y={card.y} below={card.below} onClose={() => setCard(null)} />
      )}
    </>
  );
}
