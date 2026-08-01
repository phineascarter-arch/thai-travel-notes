import { useCallback, useRef, useState } from "react";
import { sortedNotes } from "../data/notes";
import { pickRandom } from "../lib/random";
import RecordPlayer from "./RecordPlayer";
import VinylRecord from "./VinylRecord";

const ACCENTS = ["rust", "orange", "gold"] as const;

export default function RecordWall() {
  const [picks] = useState(() => pickRandom(sortedNotes, 3));
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const platterRef = useRef<HTMLDivElement>(null);

  const handleDock = useCallback((day: number) => setActiveDay(day), []);
  // 用函式型的 setState 而不是直接比對外層的 activeDay：如果這個
  // callback 是「已經被打斷、飛回原位」那張唱片延遲觸發的（見
  // VinylRecord 的 useEffect cleanup），此時 activeDay 可能已經是
  // 別張唱片的 day 了，一定要用當下最新的 prev 值比對，不能清掉
  // 別人的 activeDay。
  const handleUndock = useCallback((day: number) => {
    setActiveDay((prev) => (prev === day ? null : prev));
  }, []);

  if (picks.length === 0) return null;

  const activeNote = picks.find((n) => n.day === activeDay) ?? null;

  return (
    <section className="record-wall" aria-label="隨機複習唱片">
      <p className="record-wall-hint">把唱片拖到撥放器上，聽聽今天抽到哪一句 🎵</p>
      <RecordPlayer isPlaying={activeDay != null} activeNote={activeNote} platterRef={platterRef} />
      <div className="record-row">
        {picks.map((note, i) => (
          <VinylRecord
            key={note.day}
            note={note}
            accent={ACCENTS[i % ACCENTS.length]}
            platterRef={platterRef}
            isActive={activeDay === note.day}
            onDock={handleDock}
            onUndock={handleUndock}
          />
        ))}
      </div>
    </section>
  );
}
