/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { notes } from "../data/notes";
import manifest from "../data/speech-manifest.json";

describe("recorded pronunciation coverage", () => {
  it("provides a shipped MP3 for every headline, example and token", () => {
    const texts = new Set(notes.flatMap((note) => [
      note.thai,
      ...note.examples.flatMap((example) => [example.thai, ...example.tokens.map((token) => token.thai)]),
    ]));
    const clips: Record<string, string> = manifest.clips;
    const missing = [...texts].filter((text) =>
      !clips[text] || !existsSync(resolve("public", clips[text])) || statSync(resolve("public", clips[text])).size === 0,
    );
    expect(missing).toEqual([]);
    expect(Object.keys(clips)).toHaveLength(texts.size);
  });
});
