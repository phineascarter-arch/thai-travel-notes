import { useState } from "react";
import { sortedNotes } from "../data/notes";
import { pickRandom } from "../lib/random";
import VinylRecord from "./VinylRecord";

const ACCENTS = ["rust", "orange", "gold"] as const;

export default function RecordWall() {
  const [picks] = useState(() => pickRandom(sortedNotes, 3));

  if (picks.length === 0) return null;

  return (
    <section className="record-wall" aria-label="隨機複習唱片">
      <p className="record-wall-hint">拖拖看，聽聽今天抽到哪一句 🎵</p>
      <div className="record-row">
        {picks.map((note, i) => (
          <VinylRecord
            key={note.day}
            note={note}
            accent={ACCENTS[i % ACCENTS.length]}
            tilt={((i % 3) + 1) as 1 | 2 | 3}
          />
        ))}
      </div>
    </section>
  );
}
