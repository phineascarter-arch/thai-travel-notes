import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { notes } from "../src/data/notes.ts";

const texts = new Set(notes.flatMap((note) => [
  note.thai,
  ...note.examples.flatMap((example) => [example.thai, ...example.tokens.map((token) => token.thai)]),
]));
const voice = "th-TH-PremwadeeNeural";
const clips = Object.fromEntries([...texts].sort().map((text) => [
  text,
  `audio/premwadee/${createHash("sha256").update(`${voice}\n${text}`).digest("hex").slice(0, 24)}.mp3`,
]));
writeFileSync(new URL("../src/data/speech-manifest.json", import.meta.url), `${JSON.stringify({ voice, clips }, null, 2)}\n`);
console.log(`${notes.length} notes, ${texts.size} unique pronunciation clips`);
