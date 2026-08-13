import { useCallback, useEffect, useRef, useState } from "react";
import { wordPool, type PoolWord } from "../lib/wordPool";
import { pickRandom } from "../lib/random";
import { useSpeech } from "../hooks/useSpeech";
import Elephant from "./Elephant";
import WordCard from "./WordCard";
import templeImg from "../assets/ayutthaya-canal.png";

const SLOT_COUNT = 4;
const MIN_DURATION = 28;
const MAX_DURATION = 44;
const CARD_DISMISS_MS = 5000;

interface ElephantState {
  id: number;
  slot: number;
  word: PoolWord;
  duration: number;
  delay: number;
}

interface ActiveCard {
  id: number;
  word: PoolWord;
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
  const nextId = useRef(0);
  const { speak } = useSpeech();

  const [elephants, setElephants] = useState<ElephantState[]>(() => {
    const slotCount = Math.min(SLOT_COUNT, wordPool.length);
    const initialWords = pickRandom(wordPool, slotCount);
    return initialWords.map((word, slot) => {
      const elephant = makeElephant(nextId.current, slot, word, true);
      nextId.current += 1;
      return elephant;
    });
  });

  // 卡牌現在固定顯示在運河上方天空(見 style.css 的 .word-card-stage)，
  // 一次只顯示一張——換點別隻大象會直接換掉，跟原本黑膠撥放器「新的
  // 唱片對接就打斷上一張」是同一種互動邏輯，不是每隻大象各自彈自己
  // 的卡牌。
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);

  const handleElephantClick = useCallback((id: number, word: PoolWord) => {
    setActiveCard((prev) => (prev?.id === id ? null : { id, word }));
  }, []);

  useEffect(() => {
    if (!activeCard) return;
    speak(activeCard.word.thai, 0.82);
    const timer = setTimeout(() => setActiveCard(null), CARD_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [activeCard, speak]);

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
    <section className="ayutthaya-canal" id="ayutthaya-canal" aria-label="Ayutthaya อยุธยา">
      <p className="ayutthaya-canal-eyebrow">AYUTTHAYA</p>
      <h2 className="ayutthaya-canal-title" lang="th">
        อยุธยา
      </h2>
      <div className="canal">
        <img className="canal-temple-bg" src={templeImg} alt="" aria-hidden="true" />
        {elephants.map((elephant) => (
          <Elephant
            key={elephant.id}
            word={elephant.word}
            lane={elephant.slot}
            duration={elephant.duration}
            delay={elephant.delay}
            isActive={activeCard?.id === elephant.id}
            onToggle={() => handleElephantClick(elephant.id, elephant.word)}
            onExpire={() => handleExpire(elephant.id, elephant.slot)}
          />
        ))}
        {activeCard && <WordCard word={activeCard.word} onClose={() => setActiveCard(null)} />}
      </div>
    </section>
  );
}
