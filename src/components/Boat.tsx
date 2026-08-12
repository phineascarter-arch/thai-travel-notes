import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import type { Category } from "../data/notes";
import type { PoolWord } from "../lib/wordPool";
import { useSpeech } from "../hooks/useSpeech";
import WordCard from "./WordCard";

const CARGO_ICON: Record<Category, string> = {
  "閒聊": "🏮",
  "機場／交通": "🗺️",
  "住宿": "🧳",
  "餐廳點餐": "🍲",
  "購物殺價": "🍍",
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
  riverRef: RefObject<HTMLDivElement | null>;
  onExpire: () => void;
}

// 一艘船只管兩件事：沿著河道漂流的 CSS 動畫（純樣式，交給 .boat 的
// animation-name/-duration/-delay 處理），跟自己被點擊時要不要開一張
// WordCard。船漂流到底（onAnimationEnd）會直接把整個 Boat 卸載重建
// （由 FloatingMarket 換掉 key），所以這裡不需要自己清動畫狀態；如果
// 卡牌開著、船剛好在這個時間點到站，卡牌會跟著一起消失(見計畫的
// Global Constraints，這是刻意接受的邊界情況)。
export default function Boat({ word, lane, duration, delay, riverRef, onExpire }: Props) {
  const boatRef = useRef<HTMLDivElement>(null);
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
    const boatEl = boatRef.current;
    const riverEl = riverRef.current;
    if (!boatEl || !riverEl) return;
    const boatRect = boatEl.getBoundingClientRect();
    const riverRect = riverEl.getBoundingClientRect();
    const topRel = boatRect.top - riverRect.top;
    const below = topRel < CARD_HEIGHT_WITH_GAP;
    const halfCard = CARD_WIDTH / 2;
    const rawX = boatRect.left - riverRect.left + boatRect.width / 2;
    const minX = halfCard + CARD_EDGE_MARGIN;
    const maxX = riverRect.width - halfCard - CARD_EDGE_MARGIN;
    const x = Math.min(Math.max(rawX, minX), maxX);
    setCard({
      x,
      y: below ? boatRect.bottom - riverRect.top : topRel,
      below,
    });
    speak(word.thai, 0.82);
  };

  const style: CSSProperties = {
    top: `calc(8% + ${lane} * 14%)`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };

  return (
    <>
      <div
        ref={boatRef}
        className="boat"
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
        <span className="boat-hull" aria-hidden="true" />
        <span className="boat-cargo" aria-hidden="true">
          {CARGO_ICON[word.category]}
        </span>
        <span className="boat-label" lang="th">
          {word.thai}
        </span>
      </div>
      {card && (
        <WordCard word={word} x={card.x} y={card.y} below={card.below} onClose={() => setCard(null)} />
      )}
    </>
  );
}
