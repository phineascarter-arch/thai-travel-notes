# 唱片牆互動動畫 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首頁 hero 區塊下方新增一組「唱片牆」互動:3 張隨機抽選的泰文短句以黑膠唱片造型呈現,使用者拖拽把唱片從封套裡拿起來,揭曉內容並用既有的語音合成唸出來。

**Architecture:** 一個純函式(`pickRandom`)負責隨機抽選,一個自訂 hook(`useDraggableLift`)封裝 pointer 拖拽的狀態機(idle → dragging → lifted,含距離門檻判斷、CSS transform 位移、鍵盤後備),`VinylRecord` 元件把 hook 接到畫面與既有的 `useSpeech`/`SpeakButton`,`RecordWall` 負責抽資料跟排版 3 張唱片,最後掛進 `App.tsx` 的 hero 之後。

**Tech Stack:** React 19 + TypeScript,原生 Pointer Events(不用新的動畫/手勢函式庫),CSS(沿用專案既有的單一 `src/style.css`),Vitest 只用於純函式的單元測試。

## Global Constraints

- 這個資料夾**不是 git repository**(`git -C . rev-parse` 會失敗),所以本計畫不含 `git commit` 步驟;每個任務做完直接進下一步即可。
- 不新增任何**執行期**依賴(不裝 framer-motion 等手勢/動畫函式庫);唯一允許新增的套件是開發期用的 `vitest`。
- 拖拽互動、視覺呈現、播音時機等 UI/手勢邏輯**只做手動瀏覽器驗證**,不寫自動化測試;只有 `src/lib/random.ts` 這種不涉及 UI/DOM 的純函式要寫 Vitest 單元測試(使用者在規劃階段的明確決定)。
- 所有新增的使用者可見文案(hint 文字、aria-label)用繁體中文,語氣跟現有站內文案(「拖拖看」「精選筆記」等手帳風格)一致。
- CSS 一律加進既有的 `src/style.css`,不要另外拆新的樣式檔(跟目前專案「單一樣式檔」的既有慣例一致)。
- 新元件的 `aria-label`/鍵盤操作要跟 [App.tsx](../../../src/App.tsx) 現有的 `openOnEnterOrSpace` + `role="button" tabIndex={0}` 模式一致。

---

### Task 1: 測試環境 + 隨機抽選純函式 `pickRandom`

**Files:**
- Modify: `package.json`(新增 `vitest` devDependency 與 `test` script)
- Modify: `vite.config.ts`(改用 `vitest/config` 的 `defineConfig`,加上 `test.environment`)
- Create: `src/lib/random.ts`
- Test: `src/lib/random.test.ts`

**Interfaces:**
- Produces: `pickRandom<T>(arr: T[], n: number): T[]` — 之後 Task 3 的 `RecordWall` 會呼叫 `pickRandom(sortedNotes, 3)`。

- [ ] **Step 1: 安裝 vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: 讓 vitest 讀到 vite 設定**

修改 [vite.config.ts](../../../vite.config.ts):

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: 加上 test script**

在 `package.json` 的 `"scripts"` 裡加一行(跟現有的 `dev`/`build`/`lint`/`preview` 同一層):

```json
"test": "vitest run"
```

- [ ] **Step 4: 先寫會失敗的測試**

建立 `src/lib/random.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { pickRandom } from "./random";

describe("pickRandom", () => {
  it("returns exactly n items when n is less than the array length", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr, 3);
    expect(result).toHaveLength(3);
  });

  it("returns items that all exist in the original array with no duplicates", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const result = pickRandom(arr, 3);
    expect(new Set(result).size).toBe(3);
    for (const item of result) {
      expect(arr).toContain(item);
    }
  });

  it("clamps to the array length when n exceeds it, without crashing or duplicating", () => {
    const arr = [1, 2];
    const result = pickRandom(arr, 5);
    expect(result).toHaveLength(2);
    expect(new Set(result).size).toBe(2);
  });

  it("returns an empty array when given an empty array", () => {
    expect(pickRandom([], 3)).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    pickRandom(arr, 3);
    expect(arr).toEqual(copy);
  });
});
```

- [ ] **Step 5: 執行測試,確認失敗**

Run: `npx vitest run src/lib/random.test.ts`
Expected: FAIL(找不到模組 `./random`,因為 `src/lib/random.ts` 還沒建立)

- [ ] **Step 6: 寫最小實作**

建立 `src/lib/random.ts`:

```ts
export function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(n, shuffled.length));
}
```

- [ ] **Step 7: 執行測試,確認通過**

Run: `npx vitest run src/lib/random.test.ts`
Expected: PASS(5 個測試全過)

---

### Task 2: 拖拽狀態機 hook + 單張唱片元件

**Files:**
- Create: `src/hooks/useDraggableLift.ts`
- Create: `src/components/VinylRecord.tsx`
- Modify: `src/style.css`(新增唱片牆相關樣式)

**Interfaces:**
- Consumes: `Note` type from [src/data/notes.ts](../../../src/data/notes.ts)(欄位:`day, date, thai, roman, zh, category, ...`);`useSpeech()` from [src/hooks/useSpeech.ts](../../../src/hooks/useSpeech.ts)(回傳 `{ speak, supported, hasThaiVoice, voiceName }`,`speak(text: string, rate？: number)`);`SpeakButton` from [src/components/SpeakButton.tsx](../../../src/components/SpeakButton.tsx)(props `{ text: string; size？: "md"|"sm"; withLabel？: boolean; rate？: number }`)。
- Produces: `useDraggableLift({ onLift, liftThreshold？, liftOffset？ }): { phase: "idle"|"dragging"|"lifted"; offset: { x: number; y: number }; handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }; liftNow: () => void }`;`VinylRecord` 元件 props `{ note: Note; accent: "rust"|"orange"|"gold"; tilt: 1|2|3 }` — Task 3 的 `RecordWall` 會用到這個 props 形狀。

- [ ] **Step 1: 寫拖拽狀態機 hook**

建立 `src/hooks/useDraggableLift.ts`:

```ts
import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type LiftPhase = "idle" | "dragging" | "lifted";

interface Offset {
  x: number;
  y: number;
}

interface UseDraggableLiftOptions {
  onLift: () => void;
  liftThreshold?: number;
  liftOffset?: Offset;
}

interface UseDraggableLiftResult {
  phase: LiftPhase;
  offset: Offset;
  handlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
  };
  liftNow: () => void;
}

const ZERO: Offset = { x: 0, y: 0 };

// 把黑膠唱片「拖出封套」的手勢狀態機獨立成 hook：idle（蓋在封套下）→
// dragging（跟著指標移動）→ lifted（超過門檻，鎖定拿起、之後不再變回去）。
// 用 setPointerCapture 讓拖曳中途滑出元素範圍也不會斷線。
export function useDraggableLift({
  onLift,
  liftThreshold = 70,
  liftOffset = { x: 0, y: -96 },
}: UseDraggableLiftOptions): UseDraggableLiftResult {
  const [phase, setPhase] = useState<LiftPhase>("idle");
  const [offset, setOffset] = useState<Offset>(ZERO);
  const startRef = useRef<Offset | null>(null);
  const offsetRef = useRef<Offset>(ZERO);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase === "lifted") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY };
      setPhase("dragging");
    },
    [phase]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase !== "dragging" || !startRef.current) return;
      const next = {
        x: e.clientX - startRef.current.x,
        y: e.clientY - startRef.current.y,
      };
      offsetRef.current = next;
      setOffset(next);
    },
    [phase]
  );

  const release = useCallback(() => {
    if (phase !== "dragging" || !startRef.current) return;
    const dist = Math.hypot(offsetRef.current.x, offsetRef.current.y);
    if (dist >= liftThreshold) {
      setPhase("lifted");
      setOffset(liftOffset);
      onLift();
    } else {
      setPhase("idle");
      setOffset(ZERO);
    }
    startRef.current = null;
  }, [phase, liftThreshold, liftOffset, onLift]);

  const liftNow = useCallback(() => {
    if (phase === "lifted") {
      onLift();
      return;
    }
    setPhase("lifted");
    setOffset(liftOffset);
    onLift();
  }, [phase, liftOffset, onLift]);

  return {
    phase,
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
    },
    liftNow,
  };
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤(這個檔案目前還沒被任何元件引用，純粹確認語法/型別正確)

- [ ] **Step 3: 寫單張唱片元件**

建立 `src/components/VinylRecord.tsx`:

```tsx
import { useMemo } from "react";
import type { Note } from "../data/notes";
import { useDraggableLift } from "../hooks/useDraggableLift";
import { useSpeech } from "../hooks/useSpeech";
import SpeakButton from "./SpeakButton";

interface Props {
  note: Note;
  accent: "rust" | "orange" | "gold";
  tilt: 1 | 2 | 3;
}

export default function VinylRecord({ note, accent, tilt }: Props) {
  const { speak } = useSpeech();
  const { phase, offset, handlers, liftNow } = useDraggableLift({
    onLift: () => speak(note.thai),
  });

  const isLifted = phase === "lifted";
  const isDragging = phase === "dragging";

  const ariaLabel = isLifted
    ? `Day ${note.day}：${note.thai}，${note.zh}，播放發音`
    : "拖曳或按 Enter 拿起唱片，聽聽今天抽到哪一句";

  const style = useMemo(
    () => ({ transform: `translate(${offset.x}px, ${offset.y}px)` }),
    [offset.x, offset.y]
  );

  return (
    <div className={`record-sleeve record-tilt-${tilt} accent-${accent}`}>
      <div
        className={`vinyl ${isDragging ? "vinyl-dragging" : ""} ${isLifted ? "vinyl-lifted" : ""}`}
        style={style}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            liftNow();
          }
        }}
      >
        <span className="vinyl-label">
          {isLifted ? (
            <>
              <strong lang="th">{note.thai}</strong>
              <em>{note.roman}</em>
              <b>{note.zh}</b>
            </>
          ) : (
            <span className="vinyl-mystery">?</span>
          )}
        </span>
      </div>
      {isLifted && (
        <div className="vinyl-replay">
          <SpeakButton text={note.thai} size="sm" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 加唱片牆樣式**

在 `src/style.css` 檔案最後面加上(沿用現有的 CSS 變數，如 `--night`、`--cream`、`--rust`、`--orange`、`--gold`、`--ink`、`--line`、`--night-dim`):

```css
/* ---------- Record wall ---------- */
.record-wall {
  background: var(--night);
  padding: 8px 24px 64px;
  text-align: center;
}

.record-wall-hint {
  color: var(--night-dim);
  font-size: 14px;
  letter-spacing: 0.04em;
  margin: 0 0 40px;
}

.record-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 56px;
  flex-wrap: wrap;
}

.record-sleeve {
  position: relative;
  width: 140px;
  height: 140px;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.record-tilt-1 {
  transform: rotate(-4deg);
}

.record-tilt-2 {
  transform: rotate(3deg);
}

.record-tilt-3 {
  transform: rotate(-2deg);
}

.accent-rust .vinyl-label {
  background: var(--rust);
}

.accent-orange .vinyl-label {
  background: var(--orange);
}

.accent-gold .vinyl-label {
  background: var(--gold);
}

.vinyl {
  position: absolute;
  left: 50%;
  bottom: -18px;
  width: 120px;
  height: 120px;
  margin-left: -60px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #1a1a1a 0px,
    #1a1a1a 2px,
    #262626 3px,
    #1a1a1a 4px
  );
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  cursor: grab;
  touch-action: none;
  transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-dragging {
  transition: none;
  cursor: grabbing;
}

.vinyl-lifted {
  cursor: pointer;
}

.vinyl-label {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  color: var(--ink);
  font-size: 9px;
  line-height: 1.3;
  text-align: center;
  padding: 4px;
}

.vinyl-lifted .vinyl-label {
  width: 78px;
  height: 78px;
  font-size: 10px;
}

.vinyl-label strong {
  display: block;
  font-size: 13px;
}

.vinyl-mystery {
  font-size: 20px;
  font-weight: 800;
  color: var(--night);
}

.vinyl-replay {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .vinyl {
    transition: none;
  }
}
```

- [ ] **Step 5: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤

- [ ] **Step 6: 手動驗證（暫時掛到 App 上）**

在 [src/App.tsx](../../../src/App.tsx) 最上面暫時加：

```tsx
import VinylRecord from "./components/VinylRecord";
```

在 `<section className="hero">` 結束的 `</section>` 後面暫時加一行：

```tsx
<VinylRecord note={sortedNotes[0]} accent="rust" tilt={1} />
```

Run: `npm run dev`，打開瀏覽器到終端機顯示的網址。

檢查：
- 畫面上出現一張封套卡片，黑色唱片從底部露出一小截，中間圓標籤顯示「?」。
- 滑鼠/觸控拖曳唱片往上拉超過一小段距離放開：唱片滑到封套上方定住，圓標籤淡入顯示泰文/拼音/中文，且會聽到唸出泰文（若瀏覽器有支援 Web Speech API 且系統裝了泰文語音包）。
- 拖曳距離不夠就放開：唱片彈簧滑回封套底部原位，不會揭曉內容。
- 用 Tab 鍵移到唱片上，按 Enter：直接揭曉內容並播音，不用拖曳。
- 已經揭曉的唱片下方出現一顆 🔊 按鈕，點下去會重播發音。

確認以上都符合預期後，把這段暫時加的 `import` 跟 `<VinylRecord .../>` 從 `App.tsx` 刪掉（Task 3 會用正式的 `RecordWall` 取代）。

---

### Task 3: 唱片牆容器（隨機抽選 + 排版）+ 掛進首頁

**Files:**
- Create: `src/components/RecordWall.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `pickRandom` from [src/lib/random.ts](../../../src/lib/random.ts)（Task 1）；`sortedNotes` from [src/data/notes.ts](../../../src/data/notes.ts)；`VinylRecord` from `src/components/VinylRecord.tsx`（Task 2，props `{ note, accent, tilt }`）。
- Produces: `<RecordWall />`（無 props）— 掛進 `App.tsx` 的 hero 區塊之後。

- [ ] **Step 1: 寫唱片牆容器**

建立 `src/components/RecordWall.tsx`:

```tsx
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
```

- [ ] **Step 2: 掛進首頁**

修改 [src/App.tsx](../../../src/App.tsx)：

在檔案最上面的 import 區塊加入（放在其他 `./components/*` import 附近）：

```tsx
import RecordWall from "./components/RecordWall";
```

找到：

```tsx
        <p className="hero-sub">每天學一句，下次去泰國自助旅行就能自己開口</p>
      </section>
```

改成：

```tsx
        <p className="hero-sub">每天學一句，下次去泰國自助旅行就能自己開口</p>
      </section>

      <RecordWall />
```

（`<RecordWall />` 放在 hero 的 `</section>` 之後、`<section className="note-wall" ...>` 之前。）

- [ ] **Step 3: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤

- [ ] **Step 4: 手動驗證（完整流程）**

Run: `npm run dev`，打開首頁。

檢查：
- Hero 標題（「我的泰文旅行手帳」）下方出現一整排 3 張唱片，位置在拍立得照片牆（精選筆記）之前。
- 上方有一句引導文案「拖拖看，聽聽今天抽到哪一句 🎵」。
- 重新整理頁面幾次：3 張唱片的內容會換成不同天的筆記（隨機抽選），且同一次不會抽到重複的兩天。
- 3 張唱片的封套顏色（強調色）看起來不同（rust／orange／gold 輪流）、角度也略有歪斜。
- 依序拖拽 3 張唱片，都能各自獨立揭曉內容跟播音，互不影響。
- 手機版（瀏覽器開發者工具切換成行動裝置檢視、開啟觸控模擬）：用觸控拖曳唱片時，畫面不會跟著整頁往下捲動。

---

### Task 4: 最終檢查（reduced motion、鍵盤操作、建置）

**Files:**
- 不新增/修改檔案，純驗證

- [ ] **Step 1: 確認 reduced motion 有生效**

在瀏覽器開發者工具打開 Rendering 面板，把 `prefers-reduced-motion` 模擬成 `reduce`，重新整理頁面。

檢查：拖曳唱片放開後，回彈／定住的動作變成直接跳過去（沒有彈簧動畫的過渡），不會出現明顯的滑動效果。

- [ ] **Step 2: 確認全鍵盤操作**

不用滑鼠，只用 Tab／Shift+Tab／Enter 在頁面上移動，依序把 3 張唱片都用 Enter 拿起來。

檢查：每張都能被 Tab 到（有清楚的焦點outline）、Enter 後立刻揭曉內容並播音，不需要任何拖曳動作。

- [ ] **Step 3: Lint 檢查**

Run: `npm run lint`
Expected: 沒有新增的 lint 錯誤（既有的 warning 不在此次修改範圍內可忽略）

- [ ] **Step 4: 正式建置確認**

Run: `npm run build`
Expected: 建置成功產出 `dist/`，沒有 TypeScript 或 build 錯誤

- [ ] **Step 5: 完整 QA 走一遍所有邊界情況**

檢查以下情境（可對照 spec 的「無障礙與邊界情況」一節 [docs/superpowers/specs/2026-07-31-vinyl-record-wall-design.md](../specs/2026-07-31-vinyl-record-wall-design.md)）：

- 已經拿起來的唱片，再點一下（或再按一次 Enter）：只重播發音，不會重跑一次拖曳動畫、也不會換內容。
- 快速連續點同一張已揭曉的唱片重播好幾次：不會疊音或聲音卡住（沿用 `useSpeech` 既有的 `synth.speaking` 判斷）。
- 在系統/瀏覽器沒有泰文語音包的裝置上：拿起唱片一樣正常揭曉文字內容，只是沒有聲音，不會噴錯或整個功能壞掉。

---

## Self-Review Notes

- **Spec 覆蓋**：檔案結構（Task 1-3 對應 `random.ts`/`useDraggableLift.ts`/`VinylRecord.tsx`/`RecordWall.tsx`）、拖拽狀態機（Task 2）、視覺風格（Task 2 CSS）、無障礙與邊界情況（Task 2 的 aria-label/鍵盤 + Task 4 的驗證）、資料選取邏輯（Task 1）都各有對應任務涵蓋，spec 中「不在此次範圍」的項目（放回封套重抽、固定分類、新動畫套件）沒有出現在任何任務裡。
- **型別一致性**：`useDraggableLift` 回傳的 `{ phase, offset, handlers, liftNow }` 跟 `VinylRecord` 裡的解構用法一致；`VinylRecord` 的 `Props`（`note/accent/tilt`）跟 `RecordWall` 傳入的呼叫參數型別一致（`ACCENTS` 用 `as const` 確保是 `"rust"|"orange"|"gold"` 字面量型別）；`pickRandom<T>` 泛型呼叫 `pickRandom(sortedNotes, 3)` 回傳 `Note[]`，跟 `RecordWall` 後續 `.map((note) => ...)` 用法一致。
- **無佔位符**：所有步驟都附完整可執行的程式碼或具體的手動檢查清單，沒有「之後補」「加適當的錯誤處理」這類空話。
