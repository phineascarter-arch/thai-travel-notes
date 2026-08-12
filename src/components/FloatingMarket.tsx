import { useCallback, useRef, useState } from "react";
import { wordPool, type PoolWord } from "../lib/wordPool";
import { pickRandom } from "../lib/random";
import Boat from "./Boat";

const SLOT_COUNT = 6;
const MIN_DURATION = 16;
const MAX_DURATION = 26;

interface BoatState {
  id: number;
  slot: number;
  word: PoolWord;
  duration: number;
  delay: number;
}

function randomDuration(): number {
  return MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
}

// startMidway 只給「頁面剛載入」的初始 6 艘船用：負的 animation-delay
// 讓船一開場就已經散落在河道不同位置，不會全部從最左邊同時出發。
// 中途補新的船（到站後換上來的）用 startMidway:false，從頭開始正常
// 從左邊入場。
function makeBoat(id: number, slot: number, word: PoolWord, startMidway: boolean): BoatState {
  const duration = randomDuration();
  const delay = startMidway ? -Math.random() * duration : 0;
  return { id, slot, word, duration, delay };
}

export default function FloatingMarket() {
  const riverRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const [boats, setBoats] = useState<BoatState[]>(() => {
    const slotCount = Math.min(SLOT_COUNT, wordPool.length);
    const initialWords = pickRandom(wordPool, slotCount);
    return initialWords.map((word, slot) => {
      const boat = makeBoat(nextId.current, slot, word, true);
      nextId.current += 1;
      return boat;
    });
  });

  const handleExpire = useCallback((id: number, slot: number) => {
    setBoats((prev) => {
      const [word] = pickRandom(wordPool, 1);
      if (!word) return prev.filter((b) => b.id !== id);
      const replacement = makeBoat(nextId.current, slot, word, false);
      nextId.current += 1;
      return prev.map((b) => (b.id === id ? replacement : b));
    });
  }, []);

  if (boats.length === 0) return null;

  return (
    <section className="floating-market" id="floating-market" aria-label="水上市場">
      <h2 className="floating-market-title">水上市場</h2>
      <p className="floating-market-hint">划過來的船上都有一個泰文詞，點下去聽聽看、看看意思 🚤</p>
      <div className="market-river" ref={riverRef}>
        {boats.map((boat) => (
          <Boat
            key={boat.id}
            word={boat.word}
            lane={boat.slot}
            duration={boat.duration}
            delay={boat.delay}
            riverRef={riverRef}
            onExpire={() => handleExpire(boat.id, boat.slot)}
          />
        ))}
      </div>
    </section>
  );
}
