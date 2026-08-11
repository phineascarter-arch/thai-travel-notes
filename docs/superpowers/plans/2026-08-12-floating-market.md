# 水上市場互動小遊戲 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在複習測驗跟時間軸之間新增一個獨立的「水上市場」區塊:一條河道上固定 6 艘船持續漂過、划出畫面就補新的一艘,每艘船掛著一個逐詞拆解出來的泰文單字,點擊船隻會彈出小卡牌顯示中文/拼音並播放發音,全程沒有計時、沒有對錯、沒有分數。

**Architecture:** 資料層新增一個從全部例句 tokens 去重出來的單字池(`wordPool`),抽出一個共用的 `dedupeByThai` 純函式(順便讓 `ReviewQuiz.tsx` 既有的重複實作改用同一份)。畫面層拆成三個元件:`FloatingMarket`(容器,管理 6 個船位的狀態、到站補新邏輯)、`Boat`(單艘船,自己的 CSS 漂流動畫 + 點擊開卡牌 + 播音)、`WordCard`(卡牌顯示,純展示元件)。卡牌位置用 `getBoundingClientRect()` 在點擊當下即時量測(相對於河道容器),不是動畫推算值——跟先前撥放器對接動畫的 `computeDockOffset` 是同一套做法的延伸。

**Tech Stack:** React 19 + TypeScript,CSS `animation`/`@keyframes` 做漂流動畫(不用新的動畫函式庫),Vitest 只用於 `dedupeByThai`/`wordPool` 這種不涉及 DOM 的純函式/衍生資料。

## Global Constraints

- Spec 見 [docs/superpowers/specs/2026-08-12-floating-market-design.md](../specs/2026-08-12-floating-market-design.md)。這個資料夾是 git repository,main 分支有完整歷史;每個任務做完直接 commit。
- 不新增任何**執行期**依賴(這次不需要新增任何套件,也不需要新的 devDependency)。
- 船隻漂流動畫、卡牌開關時機這類 UI/動畫邏輯**只做手動瀏覽器驗證**,不寫自動化測試;只有 `dedupeByThai`(純函式)、`wordPool`(不涉及 DOM 的衍生資料)才寫 Vitest 單元測試——跟 `src/lib/random.ts`/`src/lib/dockOffset.ts` 當時的做法一致。
- CSS 一律加進既有的單一 `src/style.css` 檔案最後面,不拆新的樣式檔。
- 新元件的 `role="button" tabIndex={0}` + Enter/Space 鍵盤觸發,沿用 `VinylRecord.tsx` 的既有寫法——每個元件自己寫一段 inline `onKeyDown`,不要從 `App.tsx` 匯入 `openOnEnterOrSpace`(那是 `App.tsx` 內部的私有函式,子元件不應該依賴父層的實作細節)。
- 固定同時顯示 6 艘船(spec 定案的常數,見 spec 的「範圍」一節);卡牌顯示 5 秒後自動關閉,也可以再次點擊同一艘船或點卡牌上的關閉鈕提前關閉。這兩個數字沒有另外做成可調參數,直接寫死在程式碼裡(YAGNI——目前沒有任何需求要動態調整它們)。
- 船隻漂流一趟的時間隨機落在 16~26 秒之間;這個範圍 spec 沒有明確數字,是這份計畫做的實作決定,寫在 `FloatingMarket.tsx` 的常數裡,不算違反 spec(spec 只要求「持續漂移、少量常駐、持續補新」,沒有規定精確秒數)。
- 已知邊界情況、刻意不特別處理:如果使用者點開某艘船的卡牌後,剛好那艘船的漂流動畫也在同一時間結束並被替換掉,卡牌會跟著那艘船一起消失(不會被特別保留在畫面上)。這跟 `record-player-redesign` 那次撥放器的唱臂/唱片重疊處理是同一種「這個規模的個人專案不需要為了極端情況加額外複雜度」的取捨。
- 不加入任何 localStorage 進度/收集紀錄,也不套用 `weightOf()` 加權抽選(維持單純隨機),也不讓卡牌連結回 `NoteModal`——這些都是 spec「不在此次範圍」明確排除的項目。

---

### Task 1: 共用去重函式抽取 + 單字池資料

**Files:**
- Create: `src/lib/tokens.ts`
- Test: `src/lib/tokens.test.ts`
- Create: `src/lib/wordPool.ts`
- Test: `src/lib/wordPool.test.ts`
- Modify: `src/components/ReviewQuiz.tsx:1-4,36-38`(移除私有的 `dedupeByThai`,改用共用版本)

**Interfaces:**
- Produces: `dedupeByThai<T extends { thai: string }>(items: T[]): T[]`(泛型,讓 `Token[]` 跟之後的 `PoolWord[]` 都能重複使用)——Task 2/3 的 `wordPool.ts` 會用到。`PoolWord` type(`Token` 加一個 `category: Category` 欄位)、`wordPool: PoolWord[]` 常數——Task 2 的 `Boat.tsx` 跟 Task 3 的 `FloatingMarket.tsx` 都會用到。

- [ ] **Step 1: 寫會失敗的 `dedupeByThai` 測試**

建立 `src/lib/tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { dedupeByThai } from "./tokens";

describe("dedupeByThai", () => {
  it("keeps only the first occurrence when thai text repeats", () => {
    const items = [
      { thai: "ค่ะ", roman: "khâ", zh: "禮貌詞尾" },
      { thai: "กิน", roman: "gin", zh: "吃" },
      { thai: "ค่ะ", roman: "khâ", zh: "重複，應該被丟掉" },
    ];
    const result = dedupeByThai(items);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.thai)).toEqual(["ค่ะ", "กิน"]);
    expect(result[0].zh).toBe("禮貌詞尾");
  });

  it("preserves items unchanged when there are no duplicates", () => {
    const items = [
      { thai: "a", roman: "a", zh: "a" },
      { thai: "b", roman: "b", zh: "b" },
    ];
    expect(dedupeByThai(items)).toEqual(items);
  });

  it("returns an empty array when given an empty array", () => {
    expect(dedupeByThai([])).toEqual([]);
  });
});
```

- [ ] **Step 2: 執行測試,確認失敗**

Run: `npx vitest run src/lib/tokens.test.ts`
Expected: FAIL(找不到模組 `./tokens`,因為 `src/lib/tokens.ts` 還沒建立)

- [ ] **Step 3: 寫最小實作**

建立 `src/lib/tokens.ts`:

```ts
export function dedupeByThai<T extends { thai: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.thai, item])).values());
}
```

- [ ] **Step 4: 執行測試,確認通過**

Run: `npx vitest run src/lib/tokens.test.ts`
Expected: PASS(3 個測試全過)

- [ ] **Step 5: 寫會失敗的 `wordPool` 測試**

建立 `src/lib/wordPool.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { wordPool } from "./wordPool";
import { CATEGORIES } from "../data/notes";

describe("wordPool", () => {
  it("is not empty", () => {
    expect(wordPool.length).toBeGreaterThan(0);
  });

  it("has no duplicate thai entries", () => {
    const thaiTexts = wordPool.map((w) => w.thai);
    expect(new Set(thaiTexts).size).toBe(thaiTexts.length);
  });

  it("gives every word a non-empty roman/zh and a valid category", () => {
    for (const word of wordPool) {
      expect(word.roman.length).toBeGreaterThan(0);
      expect(word.zh.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(word.category);
    }
  });
});
```

- [ ] **Step 6: 執行測試,確認失敗**

Run: `npx vitest run src/lib/wordPool.test.ts`
Expected: FAIL(找不到模組 `./wordPool`,因為 `src/lib/wordPool.ts` 還沒建立)

- [ ] **Step 7: 寫最小實作**

建立 `src/lib/wordPool.ts`:

```ts
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
```

- [ ] **Step 8: 執行測試,確認通過**

Run: `npx vitest run src/lib/wordPool.test.ts`
Expected: PASS(3 個測試全過)

- [ ] **Step 9: 讓 `ReviewQuiz.tsx` 改用共用的 `dedupeByThai`**

修改 [src/components/ReviewQuiz.tsx](../../../src/components/ReviewQuiz.tsx)。找到檔案最上面的 import:

```ts
import { useState } from "react";
import type { QuizExample, Token } from "../data/notes";
import SpeakButton from "./SpeakButton";
import { recordAnswer, weightOf } from "../lib/progress";
```

改成:

```ts
import { useState } from "react";
import type { QuizExample, Token } from "../data/notes";
import SpeakButton from "./SpeakButton";
import { recordAnswer, weightOf } from "../lib/progress";
import { dedupeByThai } from "../lib/tokens";
```

找到:

```ts
function dedupeByThai(tokens: Token[]): Token[] {
  return Array.from(new Map(tokens.map((t) => [t.thai, t])).values());
}

```

整段刪掉(連同後面那一行空行一起刪除,讓 `shuffle` 跟 `weightedSample` 之間只剩一個空行)。

- [ ] **Step 10: 型別檢查 + 完整測試**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤(`ReviewQuiz.tsx` 裡呼叫 `dedupeByThai(...)` 的地方型別不變,因為新的泛型版本套用在 `Token[]` 上跟原本的具名版本行為完全一致)

Run: `npm test`
Expected: 全部通過(`random.test.ts` 5 個 + `dockOffset.test.ts` 3 個 + 這次新增的 `tokens.test.ts` 3 個 + `wordPool.test.ts` 3 個,共 14 個測試)

- [ ] **Step 11: Commit**

```bash
git add src/lib/tokens.ts src/lib/tokens.test.ts src/lib/wordPool.ts src/lib/wordPool.test.ts src/components/ReviewQuiz.tsx
git commit -m "Extract shared dedupeByThai helper and derive a token-level wordPool"
```

---

### Task 2: `Boat` + `WordCard` 元件與河道視覺樣式

**Files:**
- Create: `src/components/Boat.tsx`
- Create: `src/components/WordCard.tsx`
- Modify: `src/style.css`

**Interfaces:**
- Consumes: `PoolWord` type from [src/lib/wordPool.ts](../../../src/lib/wordPool.ts)(Task 1,欄位:`thai, roman, zh, category`);`Category` type from [src/data/notes.ts](../../../src/data/notes.ts);`useSpeech()` from [src/hooks/useSpeech.ts](../../../src/hooks/useSpeech.ts)(回傳 `{ speak, supported, hasThaiVoice, voiceName }`,`speak(text: string, rate?: number, onEnd?: () => void)`);`SpeakButton` from [src/components/SpeakButton.tsx](../../../src/components/SpeakButton.tsx)(props `{ text: string; size?: "md"|"sm"; withLabel?: boolean; rate?: number }`)。
- Produces: `Boat` 元件,props `{ word: PoolWord; lane: number; duration: number; delay: number; riverRef: RefObject<HTMLDivElement | null>; onExpire: () => void }`;`WordCard` 元件,props `{ word: PoolWord; x: number; y: number; onClose: () => void }`——Task 3 的 `FloatingMarket` 會用到 `Boat` 的 props 形狀。

- [ ] **Step 1: 寫卡牌顯示元件**

建立 `src/components/WordCard.tsx`:

```tsx
import type { PoolWord } from "../lib/wordPool";
import SpeakButton from "./SpeakButton";

interface Props {
  word: PoolWord;
  x: number;
  y: number;
  onClose: () => void;
}

// 純展示元件：位置由呼叫端（Boat）算好的 x/y（相對於河道容器左上角的
// 像素座標）決定，本身不知道自己在哪艘船旁邊、也不知道船還在不在動。
export default function WordCard({ word, x, y, onClose }: Props) {
  return (
    <div className="word-card" style={{ left: x, top: y }} role="status">
      <button type="button" className="word-card-close" aria-label="關閉" onClick={onClose}>
        ×
      </button>
      <div className="word-card-row">
        <strong lang="th">{word.thai}</strong>
        <SpeakButton text={word.thai} size="sm" rate={0.82} />
      </div>
      <em>{word.roman}</em>
      <span>{word.zh}</span>
    </div>
  );
}
```

- [ ] **Step 2: 寫單艘船元件**

建立 `src/components/Boat.tsx`:

```tsx
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
// 卡牌開著、船剛好在這個時間點到站，卡牌會跟著一起消失（見計畫的
// Global Constraints，這是刻意接受的邊界情況)。
export default function Boat({ word, lane, duration, delay, riverRef, onExpire }: Props) {
  const boatRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<{ x: number; y: number } | null>(null);
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
    setCard({
      x: boatRect.left - riverRect.left + boatRect.width / 2,
      y: boatRect.top - riverRect.top,
    });
    speak(word.thai);
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
        <span className="boat-cargo" aria-hidden="true">
          {CARGO_ICON[word.category]}
        </span>
        <span className="boat-hull" lang="th">
          {word.thai}
        </span>
      </div>
      {card && <WordCard word={word} x={card.x} y={card.y} onClose={() => setCard(null)} />}
    </>
  );
}
```

- [ ] **Step 3: 加河道場景樣式**

先在 [src/style.css](../../../src/style.css) 最上面的 `:root` 區塊加兩個新的 CSS 變數。找到:

```css
  --red: #b94e3f;
  --red-bg: #fff0ed;
}
```

改成:

```css
  --red: #b94e3f;
  --red-bg: #fff0ed;
  --river: #1f7a72;
  --river-deep: #0f4a45;
}
```

再到 `src/style.css` 檔案最後面(在既有內容全部結束之後)加上:

```css
/* ---------- Floating market ---------- */
.floating-market {
  padding: 56px 24px 64px;
  text-align: center;
  background: var(--paper);
}

.floating-market-hint {
  color: var(--muted);
  font-size: 14px;
  letter-spacing: 0.04em;
  margin: 0 0 20px;
}

.market-river {
  position: relative;
  overflow: hidden;
  max-width: 900px;
  height: 360px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(
    180deg,
    var(--gold) 0%,
    var(--orange) 34%,
    var(--river) 40%,
    var(--river-deep) 100%
  );
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.25);
}

.boat {
  position: absolute;
  left: -160px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 999px 999px 6px 6px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  animation-name: boat-drift;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.boat-cargo {
  font-size: 18px;
}

.boat-hull {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
}

@keyframes boat-drift {
  from {
    left: -160px;
  }
  to {
    left: 100%;
  }
}

.word-card {
  position: absolute;
  transform: translate(-50%, calc(-100% - 10px));
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 16px 12px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
  min-width: 130px;
  text-align: center;
  z-index: 3;
}

.word-card-close {
  position: absolute;
  top: 2px;
  right: 6px;
  border: none;
  background: none;
  color: var(--muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
}

.word-card-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.word-card strong {
  display: block;
  font-size: 20px;
  color: var(--ink);
}

.word-card em {
  display: block;
  font-style: normal;
  color: var(--rust);
  font-size: 13px;
  margin-top: 2px;
}

.word-card span {
  display: block;
  color: var(--muted);
  font-size: 13px;
  margin-top: 2px;
}

@media (width <= 560px) {
  .market-river {
    height: 260px;
  }
  .boat {
    padding: 6px 10px;
    gap: 6px;
  }
  .boat-hull {
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .market-river {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 12px;
    padding: 16px;
    height: auto;
    min-height: 200px;
  }
  .boat {
    position: static;
    left: auto;
    top: auto;
    animation: none;
  }
}
```

- [ ] **Step 4: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤(`Boat`/`WordCard` 目前還沒被任何地方引用,純粹確認語法/型別正確)

- [ ] **Step 5: 手動驗證(暫時掛到 App 上)**

在 [src/App.tsx](../../../src/App.tsx) 最上面暫時加:

```tsx
import { useRef } from "react";
import Boat from "./components/Boat";
import { wordPool } from "./lib/wordPool";
```

(`useRef` 如果檔案已經有從 `"react"` 引入其他東西,併到同一行 import 就好。)

在 `<section className="hero">` 結束的 `</section>` 後面暫時加一行:

```tsx
<TempBoatHarness />
```

在檔案最後面(`export default App;` 之後,或另外找個地方,只要在同一個檔案、`App` 函式外面)暫時加一個測試用元件:

```tsx
function TempBoatHarness() {
  const riverRef = useRef<HTMLDivElement>(null);
  const words = wordPool.slice(0, 3);

  return (
    <div className="market-river" ref={riverRef} style={{ height: 200 }}>
      {words.map((word, i) => (
        <Boat
          key={word.thai}
          word={word}
          lane={i}
          duration={10}
          delay={-i * 3}
          riverRef={riverRef}
          onExpire={() => {}}
        />
      ))}
    </div>
  );
}
```

Run: `npm run dev`,打開瀏覽器到終端機顯示的網址。

檢查:
- 出現一個有天空/河水漸層背景的圓角區塊,3 艘船(各自帶著貨物 emoji + 泰文字)沿著不同高度緩緩往右漂,約 10 秒漂完一輪(因為這裡把 `duration` 暫時設成 10 秒方便測試,不用等 16~26 秒)。
- 點擊任一艘船:船旁邊(船的正上方)彈出一張卡牌,顯示中文意思、羅馬拼音,並聽到泰文發音(若瀏覽器支援 Web Speech API 且系統裝了泰文語音包)。
- 再點一次同一艘船(或點卡牌右上角的 ×):卡牌立刻關閉。
- 開一張卡牌後不去動它,等 5 秒:卡牌自動消失。
- 用 Tab 鍵移到某艘船上,按 Enter:效果跟點擊一樣,會開卡牌並播音。
- 船漂到最右邊消失時,若剛好卡牌是開著的,卡牌會跟著一起消失(預期行為,不是 bug)。

Run 手機模擬(瀏覽器開發者工具切換成行動裝置檢視,寬度調到 500px 左右),重新整理頁面,檢查:船的 padding/字級變小,河道高度縮成 260px,不會爆版。

打開 Rendering 面板把 `prefers-reduced-motion` 模擬成 `reduce`,重新整理頁面,檢查:船隻改成一般的自然排列(不再是絕對定位漂流),不會動,但一樣可以點擊開卡牌、播音。

確認以上都符合預期後,把這段暫時加的 `import`、`<TempBoatHarness />`、`TempBoatHarness` 函式整個從 `App.tsx` 刪掉(Task 3 會用正式的 `FloatingMarket` 取代)。

- [ ] **Step 6: Commit**

```bash
git add src/components/Boat.tsx src/components/WordCard.tsx src/style.css
git commit -m "Add Boat and WordCard components with the floating-market river scene styles"
```

---

### Task 3: `FloatingMarket` 容器(補新機制)+ 掛進首頁

**Files:**
- Create: `src/components/FloatingMarket.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `wordPool`, `PoolWord` from [src/lib/wordPool.ts](../../../src/lib/wordPool.ts)(Task 1);`pickRandom` from [src/lib/random.ts](../../../src/lib/random.ts)(既有);`Boat` from [src/components/Boat.tsx](../../../src/components/Boat.tsx)(Task 2,props `{ word, lane, duration, delay, riverRef, onExpire }`)。
- Produces: `<FloatingMarket />`(無 props)——掛進 `App.tsx`,`ReviewQuiz` 之後、時間軸 `content-grid` 之前。

- [ ] **Step 1: 寫容器元件**

建立 `src/components/FloatingMarket.tsx`:

```tsx
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
```

- [ ] **Step 2: 掛進首頁**

修改 [src/App.tsx](../../../src/App.tsx)。

在檔案最上面的 import 區塊加入(放在其他 `./components/*` import 附近):

```tsx
import FloatingMarket from "./components/FloatingMarket";
```

找到 `<nav>` 區塊:

```tsx
        <nav aria-label="主要導覽">
          <a href="#timeline">時間軸</a>
          <a href="#topics">主題</a>
          <a href="#review-quiz">複習測驗</a>
        </nav>
```

改成:

```tsx
        <nav aria-label="主要導覽">
          <a href="#timeline">時間軸</a>
          <a href="#topics">主題</a>
          <a href="#review-quiz">複習測驗</a>
          <a href="#floating-market">水上市場</a>
        </nav>
```

找到:

```tsx
      <ReviewQuiz pool={quizPool} maxDay={maxDay} />

      <section className="content-grid" id="timeline">
```

改成:

```tsx
      <ReviewQuiz pool={quizPool} maxDay={maxDay} />

      <FloatingMarket />

      <section className="content-grid" id="timeline">
```

- [ ] **Step 3: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤

- [ ] **Step 4: 手動驗證(完整流程)**

Run: `npm run dev`,打開首頁。

檢查:
- 複習測驗區塊下方、時間軸上方出現「水上市場」區塊,上方有引導文案,河道上固定看到 6 艘船漂流(頁面剛載入時船隻已經散落在河道不同位置,不是全部擠在最左邊)。
- 導覽列(頂部 nav)出現「水上市場」連結,點下去頁面會捲動到這個區塊。
- 點擊船隻:彈出卡牌、播音,行為跟 Task 2 驗證過的一致。
- 放著頁面不動,觀察 30 秒以上:陸續有船划出最右邊消失,同一個船位很快補上一艘新船(內容是隨機抽到的另一個單字),河道上全程維持 6 艘,不會越漂越少或疊加變多。
- 重新整理頁面幾次:每次初始 6 艘船的單字內容都不完全一樣(隨機抽選)。
- 手機版(瀏覽器開發者工具切換成行動裝置檢視):區塊排版正常、觸控點擊船隻一樣能開卡牌。

- [ ] **Step 5: Commit**

```bash
git add src/components/FloatingMarket.tsx src/App.tsx
git commit -m "Wire FloatingMarket into the homepage with a slot-based boat replenish loop"
```

---

### Task 4: 最終檢查(reduced motion、鍵盤操作、不支援語音的降級、lint、build)

**Files:**
- 不新增/修改檔案,純驗證

- [ ] **Step 1: 確認 reduced motion 完整生效**

在瀏覽器開發者工具打開 Rendering 面板,把 `prefers-reduced-motion` 模擬成 `reduce`,重新整理頁面,捲到「水上市場」區塊。

檢查:船隻改成自然排列(flex-wrap,不再絕對定位漂流),完全不會動,但每艘船依然可以點擊/Enter 開卡牌、播音、5 秒後自動關閉或手動關閉。

- [ ] **Step 2: 確認全鍵盤操作**

不用滑鼠,只用 Tab/Shift+Tab/Enter 在「水上市場」區塊上移動。

檢查:每艘船都能被 Tab 到(有清楚的焦點 outline)、按 Enter 開卡牌;卡牌上的關閉按鈕跟重播按鈕(`SpeakButton`)也都能用 Tab 到、按 Enter/Space 觸發。

- [ ] **Step 3: 確認不支援語音時的降級**

在瀏覽器開發者工具的 Console 執行 `Object.defineProperty(window, 'speechSynthesis', { value: undefined })`,然後重新整理頁面。

檢查:點擊船隻一樣正常開卡牌、顯示中文/拼音,只是沒有聲音;卡牌裡的重播按鈕(`SpeakButton`)因為 `useSpeech` 判斷 `supported === false` 會直接不顯示,不會噴錯。

- [ ] **Step 4: Lint 檢查**

Run: `npm run lint`
Expected: 沒有新增的 lint 錯誤(既有的 warning 不在此次修改範圍內可忽略)

- [ ] **Step 5: 正式建置確認**

Run: `npm run build`
Expected: 建置成功產出 `dist/`,沒有 TypeScript 或 build 錯誤

- [ ] **Step 6: 自動化測試確認**

Run: `npm test`
Expected: 全部通過(`random.test.ts` 5 個 + `dockOffset.test.ts` 3 個 + `tokens.test.ts` 3 個 + `wordPool.test.ts` 3 個,共 14 個測試)

---

## Self-Review Notes

- **Spec 覆蓋**:區塊定位跟導覽連結(Task 3 Step 2)、單字池資料模型與去重共用(Task 1)、船隻補新邏輯(Task 3 的 `handleExpire`)、點擊卡牌互動與播音(Task 2 的 `Boat`/`WordCard`)、視覺風格(Task 2 Step 3 的 CSS,含新的 `--river`/`--river-deep` 變數跟依分類決定貨物圖示)、無障礙與邊界情況(Task 2/4 的鍵盤路徑、reduced motion、語音降級)都各自有任務涵蓋。spec 中「不在此次範圍」的項目(進度計數器、`weightOf()` 加權、連結回 `NoteModal`、精緻 SVG 插畫)沒有出現在任何任務裡。
- **型別一致性**:`Boat` 的 props(`word, lane, duration, delay, riverRef, onExpire`)在 Task 2 定義、Task 3 的 `FloatingMarket` 呼叫端完全對應;`PoolWord` 型別從 Task 1 的 `wordPool.ts` 匯出,Task 2 的 `Boat.tsx`/`WordCard.tsx`、Task 3 的 `FloatingMarket.tsx` 都改用 `import type { PoolWord } from "../lib/wordPool"` 引用同一份定義,沒有各自重複宣告;`dedupeByThai<T extends { thai: string }>` 的泛型簽名在 `tokens.ts` 定義、`wordPool.ts`(套用在 `PoolWord[]`)、`ReviewQuiz.tsx`(套用在 `Token[]`)三處呼叫都符合約束。
- **無佔位符**:所有步驟都附完整可執行的程式碼或具體的手動檢查清單,沒有「之後補」「加適當的錯誤處理」這類空話。
