import { sortedNotes, type Token, type Category } from "../data/notes";
import { dedupeByThai } from "./tokens";

export interface PoolWord extends Token {
  category: Category;
}

const allWords: PoolWord[] = sortedNotes.flatMap((note) =>
  note.examples.flatMap((example) =>
    example.tokens.map((token) => ({ ...token, category: note.category }))
  )
);

export const wordPool: PoolWord[] = dedupeByThai(allWords);
