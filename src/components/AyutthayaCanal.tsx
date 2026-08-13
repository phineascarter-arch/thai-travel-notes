import { useCallback, useRef, useState } from "react";
import { wordPool, type PoolWord } from "../lib/wordPool";
import { pickRandom } from "../lib/random";
import Elephant from "./Elephant";
import templeImg from "../assets/ayutthaya-canal.png";

const SLOT_COUNT = 4;
const MIN_DURATION = 28;
const MAX_DURATION = 44;

interface ElephantState {
  id: number;
  slot: number;
  word: PoolWord;
  duration: number;
  delay: number;
}

function randomDuration(): number {
  return MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
}

// startMidway 只給「頁面剛載入」的初始幾隻大象用：負的 animation-delay
// 讓大象一開場就已經散落在運河不同位置，不會全部從最左邊同時出發。
// 中途補新的（到站後換上來的）用 startMidway:false，從頭開始正常
// 從左邊入場。
function makeElephant(id: number, slot: number, word: PoolWord, startMidway: boolean): ElephantState {
  const duration = randomDuration();
  const delay = startMidway ? -Math.random() * duration : 0;
  return { id, slot, word, duration, delay };
}

export default function AyutthayaCanal() {
  const canalRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const [elephants, setElephants] = useState<ElephantState[]>(() => {
    const slotCount = Math.min(SLOT_COUNT, wordPool.length);
    const initialWords = pickRandom(wordPool, slotCount);
    return initialWords.map((word, slot) => {
      const elephant = makeElephant(nextId.current, slot, word, true);
      nextId.current += 1;
      return elephant;
    });
  });

  const handleExpire = useCallback((id: number, slot: number) => {
    setElephants((prev) => {
      const [word] = pickRandom(wordPool, 1);
      if (!word) return prev.filter((e) => e.id !== id);
      const replacement = makeElephant(nextId.current, slot, word, false);
      nextId.current += 1;
      return prev.map((e) => (e.id === id ? replacement : e));
    });
  }, []);

  if (elephants.length === 0) return null;

  return (
    <section className="ayutthaya-canal" id="ayutthaya-canal" aria-label="大城運河">
      <h2 className="ayutthaya-canal-title">大城運河</h2>
      <p className="ayutthaya-canal-hint">戰象沿著古運河走過，點下去聽聽牠帶著哪句話 🐘</p>
      <div className="canal" ref={canalRef}>
        <img className="canal-temple-bg" src={templeImg} alt="" aria-hidden="true" />
        {elephants.map((elephant) => (
          <Elephant
            key={elephant.id}
            word={elephant.word}
            lane={elephant.slot}
            duration={elephant.duration}
            delay={elephant.delay}
            canalRef={canalRef}
            onExpire={() => handleExpire(elephant.id, elephant.slot)}
          />
        ))}
      </div>
    </section>
  );
}
