import type { Category } from "../data/notes";
import type { PoolWord } from "../lib/wordPool";
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

interface Props {
  word: PoolWord;
  lane: number;
  duration: number;
  delay: number;
  isActive: boolean;
  onToggle: () => void;
  onExpire: () => void;
}

// 一隻大象只管兩件事：沿著運河漂移的 CSS 動畫（純樣式，交給 .elephant 的
// animation-name/-duration/-delay 處理），跟自己被點擊時通知上層「換我
// 的卡牌上場」。實際卡牌顯示／發音／自動關閉都交給 AyutthayaCanal 統一
// 管理(固定顯示在運河上方天空，一次一張)，這裡只做 isActive 的視覺提示。
// 大象走到底（onAnimationEnd）會直接把整個 Elephant 卸載重建（由
// AyutthayaCanal 換掉 key），所以這裡不需要自己清動畫狀態。
export default function Elephant({ word, lane, duration, delay, isActive, onToggle, onExpire }: Props) {
  const style = {
    top: `calc(44% + ${lane} * 1%)`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    // reduced-motion 停用動畫時的靜態備援位置，見 style.css 對應規則。
    "--static-left": `${8 + lane * 22}%`,
  };

  return (
    <div
      className={`elephant ${isActive ? "elephant-active" : ""}`}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={`聽聽 ${word.thai} 怎麼唸`}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
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
  );
}
