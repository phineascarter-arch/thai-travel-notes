# 唱片牆改版：撥放器 + 對接動畫 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把現有的「唱片牆」從「每張唱片自己的封套裡拖出來揭曉」改成「畫面上一台共用的復古黑膠撥放器，把唱片拖到撥放器上才會對接、播放、播完自動飛回原位」。

**Architecture:** 撥放器（`RecordPlayer`）是純顯示元件；狀態往上提到 `RecordWall`（哪張唱片目前在撥放器上）；每張唱片（`VinylRecord`）自己管理拖拽手勢（`useDockingDrag` hook），對接時即時量測自己跟撥放器轉盤的螢幕座標差（`computeDockOffset` 純函式）算出飛行的 CSS transform。

**Tech Stack:** React 19 + TypeScript，原生 Pointer Events（不用新的動畫/手勢函式庫），CSS transform/transition/animation，Vitest 只用於 `computeDockOffset` 這種不涉及 DOM 的純函式。

## Global Constraints

- 這次改版取代 2026-07-31 那版的拖拽揭曉互動，spec 見 [docs/superpowers/specs/2026-08-01-record-player-redesign-design.md](../specs/2026-08-01-record-player-redesign-design.md)。
- 不新增任何**執行期**依賴（唯一允許新增的是開發期用的東西，這次不需要新增任何套件）。
- 拖拽/播放時序/動畫這類 UI 邏輯**只做手動瀏覽器驗證**，不寫自動化測試；只有像 `computeDockOffset` 這種純函式（輸入輸出都是普通物件、不碰 DOM/React）才寫 Vitest 單元測試——跟 `src/lib/random.ts` 當時的做法一致。
- 這個資料夾是 git repository，main 分支已經有先前唱片牆功能的完整歷史；每個任務做完直接 commit。
- CSS 一律加進既有的單一 `src/style.css`，不要拆新的樣式檔。
- 撥放器本身是「復古寫實黑膠機」風格（木紋機身、金屬唱臂），不是手帳塗鴉風——這是視覺協作工具確認過的方向，顏色可以用新的一次性色值（機身漸層、金屬唱臂），不用勉強套用 `--paper`/`--cream` 這類紙感色票；轉盤中心點、既有的黑色紋理沿用跟原本唱片一樣的 `repeating-radial-gradient`。
- 唱片飛到撥放器上之後揭曉的泰文/羅馬拼音/中文顯示在撥放器下方的獨立標籤區，**不是**印在唱片自己的圓標籤上——唱片的圓標籤全程只顯示「?」。
- 拿掉「點已揭曉的唱片重播」機制，這次每次對接都是完整播一次的動作，不保留 `SpeakButton` 重播按鈕。
- 對接位置是每次對接當下即時量測算出來的（唱片跟撥放器轉盤的 `getBoundingClientRect()` 差），不是寫死的像素位移——這跟舊版「拿起唱片固定位移 96px」是本質上的差異，也代表這次不需要像舊版一樣為了響應式斷點精算固定位移的像素數字。

---

### Task 1: 撥放器顯示元件 `RecordPlayer` + 樣式

**Files:**
- Create: `src/components/RecordPlayer.tsx`
- Modify: `src/style.css`（在檔案最後面加新的一個區塊，不動任何現有內容）

**Interfaces:**
- Produces: `RecordPlayer` 元件，props `{ isPlaying: boolean; activeNote: Note | null; platterRef: RefObject<HTMLDivElement | null> }` — Task 3 的 `RecordWall` 會用到這個 props 形狀。`Note` type 從 [src/data/notes.ts](../../../src/data/notes.ts) 引入（欄位：`day, date, thai, roman, zh, category, ...`）。

- [ ] **Step 1: 寫撥放器元件**

建立 `src/components/RecordPlayer.tsx`:

```tsx
import type { RefObject } from "react";
import type { Note } from "../data/notes";

interface Props {
  isPlaying: boolean;
  activeNote: Note | null;
  platterRef: RefObject<HTMLDivElement | null>;
}

// 撥放器本身是完全無狀態的顯示元件：唱臂角度、轉盤/唱片旋轉動畫（旋轉
// 動畫實際上套用在 VinylRecord 自己的 .vinyl-disc 上，不是這裡）、下方
// 標籤區的內容，全部只看 isPlaying / activeNote 這兩個 prop，不知道
// 拖拽或語音播放的細節。platterRef 是轉盤的 DOM 節點，讓 VinylRecord
// 量測位置算出對接時要飛過去的位移量。
export default function RecordPlayer({ isPlaying, activeNote, platterRef }: Props) {
  return (
    <div className="record-player">
      <div className="record-player-body">
        <div className="record-player-platter" ref={platterRef} />
        <div className={`record-player-arm ${isPlaying ? "record-player-arm-down" : ""}`} />
        <div className="record-player-knob" />
      </div>
      <div className={`record-player-caption ${activeNote ? "record-player-caption-visible" : ""}`}>
        {activeNote ? (
          <>
            <strong lang="th">{activeNote.thai}</strong>
            <em>{activeNote.roman}</em>
            <b>{activeNote.zh}</b>
          </>
        ) : (
          <span>把唱片拖上來聽聽看</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤（這個元件目前還沒被任何地方引用，純粹確認語法/型別正確）

- [ ] **Step 3: 加撥放器樣式**

在 `src/style.css` 檔案最後面（在既有內容全部結束之後）加上：

```css
/* ---------- Record player ---------- */
.record-player {
  position: relative;
  z-index: 1;
  width: 220px;
  height: 170px;
  margin: 0 auto 26px;
}

.record-player-body {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #d8cfbc, #a89878);
  border-radius: 12px;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.15);
}

.record-player-platter {
  position: absolute;
  left: 30px;
  top: 26px;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #1a1a1a 0px,
    #1a1a1a 2px,
    #262626 3px,
    #1a1a1a 4px
  );
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), inset 0 0 0 7px #3a3a3a;
}

.record-player-platter::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border-radius: 50%;
  background: var(--rust);
}

.record-player-arm {
  position: absolute;
  top: 18px;
  right: 30px;
  width: 8px;
  height: 88px;
  background: linear-gradient(180deg, #c7cee0, #8b96ad);
  border-radius: 4px;
  transform: rotate(34deg);
  transform-origin: top center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  transition: transform 480ms ease;
}

.record-player-arm::before {
  content: "";
  position: absolute;
  top: -9px;
  left: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #465272;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.record-player-arm-down {
  transform: rotate(9deg);
}

.record-player-knob {
  position: absolute;
  bottom: 14px;
  left: 18px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #465272;
}

.record-player-caption {
  min-height: 64px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--night-dim);
  font-size: 13px;
  text-align: center;
  opacity: 0.7;
  transition: opacity 320ms ease;
}

.record-player-caption-visible {
  opacity: 1;
}

.record-player-caption strong {
  color: var(--gold);
  font-size: 22px;
}

.record-player-caption em {
  color: var(--cream);
  font-style: normal;
}

.record-player-caption b {
  color: var(--night-dim);
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .record-player-arm {
    transition: none;
  }
}
```

- [ ] **Step 4: 手動驗證（暫時掛到 App 上）**

在 [src/App.tsx](../../../src/App.tsx) 最上面暫時加：

```tsx
import { useRef } from "react";
import RecordPlayer from "./components/RecordPlayer";
```

（`useRef` 如果檔案已經有從 `"react"` 引入其他東西，併到同一行 import 就好。）

在 `App` 函式最上面（其他 hook 呼叫旁邊）暫時加：

```tsx
const tempPlatterRef = useRef<HTMLDivElement>(null);
```

在 `<section className="hero">` 結束的 `</section>` 後面暫時加一行：

```tsx
<RecordPlayer isPlaying={true} activeNote={sortedNotes[0]} platterRef={tempPlatterRef} />
```

Run: `npm run dev`，打開瀏覽器到終端機顯示的網址。

檢查：
- 出現一台木紋機身、深色轉盤、金屬唱臂的撥放器，唱臂角度是「搖下來」的角度（比較平、貼近轉盤）。
- 撥放器下方顯示 `sortedNotes[0]` 的泰文（大字、金色）/羅馬拼音/中文。

把 `isPlaying` 改成 `false`、`activeNote` 改成 `null`，存檔讓 HMR 更新，再檢查：
- 唱臂角度變成「搖起來」的角度（比較斜）。
- 下方標籤區顯示「把唱片拖上來聽聽看」的提示文字，顏色比較淡（`opacity: 0.7`）。

確認以上都符合預期後，把這段暫時加的 `import`、`useRef`、`<RecordPlayer .../>` 從 `App.tsx` 刪掉（Task 3 會用正式的 `RecordWall` 取代）。

- [ ] **Step 5: Commit**

```bash
git add src/components/RecordPlayer.tsx src/style.css
git commit -m "Add RecordPlayer display component for the record-player redesign"
```

---

### Task 2: 對接手勢 hook + 唱片元件重寫

**Files:**
- Create: `src/lib/dockOffset.ts`
- Test: `src/lib/dockOffset.test.ts`
- Create: `src/hooks/useDockingDrag.ts`
- Modify: `src/hooks/useSpeech.ts`
- Modify: `src/components/VinylRecord.tsx`（整個重寫）
- Modify: `src/style.css`
- Delete: `src/hooks/useDraggableLift.ts`（被 `useDockingDrag.ts` 取代，重寫後的 `VinylRecord` 不再引用它）

**Interfaces:**
- Consumes: `RecordPlayer` 的 `platterRef` 概念（`RefObject<HTMLDivElement | null>`，Task 1）；`useSpeech()` from [src/hooks/useSpeech.ts](../../../src/hooks/useSpeech.ts)（既有回傳 `{ speak, supported, hasThaiVoice, voiceName }`，這個任務會幫 `speak` 加第三個參數）。
- Produces: `computeDockOffset(source: Rect, target: Rect): DockOffset`（`Rect = { left, top, width, height }`，`DockOffset = { x, y, scale }`）；`useDockingDrag({ getDockTarget, onDock, dragThreshold? }): { phase: "idle"|"dragging"|"docked"; offset: DockOffset; handlers: {...}; dockNow: () => void; undock: () => void }`；`VinylRecord` props `{ note: Note; accent: "rust"|"orange"|"gold"; platterRef: RefObject<HTMLDivElement | null>; isActive: boolean; onDock: (day: number) => void; onUndock: (day: number) => void }` — Task 3 的 `RecordWall` 會用到這個 props 形狀。`speak` 新簽名：`speak(text: string, rate?: number, onEnd?: () => void): void`。

- [ ] **Step 1: 寫會失敗的 `computeDockOffset` 測試**

建立 `src/lib/dockOffset.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeDockOffset } from "./dockOffset";

describe("computeDockOffset", () => {
  it("computes the delta between the two rects' centers", () => {
    const source = { left: 100, top: 200, width: 92, height: 92 };
    const target = { left: 300, top: 50, width: 92, height: 92 };
    const result = computeDockOffset(source, target);
    expect(result.x).toBe(200);
    expect(result.y).toBe(-150);
    expect(result.scale).toBe(1);
  });

  it("computes a scale factor based on the target's size relative to the source", () => {
    const source = { left: 0, top: 0, width: 80, height: 80 };
    const target = { left: 0, top: 0, width: 120, height: 120 };
    const result = computeDockOffset(source, target);
    expect(result.scale).toBe(1.5);
  });

  it("returns zero offset and scale 1 when source and target are the same rect", () => {
    const rect = { left: 50, top: 50, width: 100, height: 100 };
    const result = computeDockOffset(rect, rect);
    expect(result).toEqual({ x: 0, y: 0, scale: 1 });
  });
});
```

- [ ] **Step 2: 執行測試，確認失敗**

Run: `npx vitest run src/lib/dockOffset.test.ts`
Expected: FAIL（找不到模組 `./dockOffset`，因為 `src/lib/dockOffset.ts` 還沒建立）

- [ ] **Step 3: 寫最小實作**

建立 `src/lib/dockOffset.ts`:

```ts
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DockOffset {
  x: number;
  y: number;
  scale: number;
}

// 算「唱片飛到撥放器轉盤上」要套用的 CSS transform：兩個矩形中心點的
// 位移量，加上讓唱片視覺尺寸貼合轉盤大小的縮放比例。source/target 用
// 結構相容的普通物件（不是真的 DOMRect），呼叫端可以直接傳
// getBoundingClientRect() 的結果，也方便在這裡寫不需要瀏覽器 DOM 的
// 單元測試。
export function computeDockOffset(source: Rect, target: Rect): DockOffset {
  const sourceCenterX = source.left + source.width / 2;
  const sourceCenterY = source.top + source.height / 2;
  const targetCenterX = target.left + target.width / 2;
  const targetCenterY = target.top + target.height / 2;
  return {
    x: targetCenterX - sourceCenterX,
    y: targetCenterY - sourceCenterY,
    scale: target.width / source.width,
  };
}
```

- [ ] **Step 4: 執行測試，確認通過**

Run: `npx vitest run src/lib/dockOffset.test.ts`
Expected: PASS（3 個測試全過）

- [ ] **Step 5: 寫對接手勢 hook**

建立 `src/hooks/useDockingDrag.ts`:

```ts
import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { DockOffset } from "../lib/dockOffset";

export type DockPhase = "idle" | "dragging" | "docked";

interface UseDockingDragOptions {
  // 拖拽超過門檻放開、或呼叫 dockNow() 的當下才會呼叫，量測「唱片現在
  // 的位置」跟「撥放器轉盤的位置」算出對接用的位移／縮放比例。放在
  // callback 裡而不是預先算好，是因為唱片在架上的座標只有觸發當下才
  // 準確（重新整理頁面抽到不同筆記、視窗尺寸改變都會影響座標）。
  getDockTarget: () => DockOffset;
  onDock: () => void;
  dragThreshold?: number;
}

interface UseDockingDragResult {
  phase: DockPhase;
  offset: DockOffset;
  handlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
  };
  dockNow: () => void;
  undock: () => void;
}

const IDLE_OFFSET: DockOffset = { x: 0, y: 0, scale: 1 };

// 唱片「拖到撥放器上」的手勢狀態機：idle（在架上）→ dragging（跟著
// 指標移動，位移用 scale:1 讓唱片維持原本大小、只是鬆鬆跟著手指）→
// docked（超過門檻放開，或鍵盤觸發 dockNow()，套用 getDockTarget()
// 算出的精確位移／縮放，疊到轉盤上）。docked 不是終點狀態：呼叫端
// （VinylRecord）會在播放結束或被別的唱片打斷時呼叫 undock()，讓唱片
// 飛回架上原位。
export function useDockingDrag({
  getDockTarget,
  onDock,
  dragThreshold = 70,
}: UseDockingDragOptions): UseDockingDragResult {
  const [phase, setPhase] = useState<DockPhase>("idle");
  const [offset, setOffset] = useState<DockOffset>(IDLE_OFFSET);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase === "docked") return;
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
      dragOffsetRef.current = next;
      setOffset({ ...next, scale: 1 });
    },
    [phase]
  );

  const release = useCallback(() => {
    if (phase !== "dragging" || !startRef.current) return;
    const dist = Math.hypot(dragOffsetRef.current.x, dragOffsetRef.current.y);
    if (dist >= dragThreshold) {
      setPhase("docked");
      setOffset(getDockTarget());
      onDock();
    } else {
      setPhase("idle");
      setOffset(IDLE_OFFSET);
    }
    startRef.current = null;
  }, [phase, dragThreshold, getDockTarget, onDock]);

  const dockNow = useCallback(() => {
    if (phase === "docked") return;
    setPhase("docked");
    setOffset(getDockTarget());
    onDock();
  }, [phase, getDockTarget, onDock]);

  const undock = useCallback(() => {
    setPhase("idle");
    setOffset(IDLE_OFFSET);
  }, []);

  return {
    phase,
    offset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
    },
    dockNow,
    undock,
  };
}
```

- [ ] **Step 6: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤（這個 hook 目前還沒被任何元件引用）

- [ ] **Step 7: 幫 `useSpeech` 加播放結束的回呼**

修改 [src/hooks/useSpeech.ts](../../../src/hooks/useSpeech.ts)。找到：

```ts
  const speak = useCallback(
    (text: string, rate = 0.65) => {
      if (!supported) return;
      const synth = window.speechSynthesis;

      const doSpeak = () => {
        // 音訊管線啟動本身也有一點延遲，就算前面沒有任何語音在播、單獨點一次
        // 也偶爾會發生。在真正內容前面墊一個逗號當緩衝——逗號不會被念出來，
        // 只會造成一個很短的停頓，讓管線啟動的延遲去吃這個停頓，而不是吃到
        // 真正的第一個音節。
        const utter = new SpeechSynthesisUtterance(`, , ${text}`);
        utter.lang = "th-TH";
        if (thaiVoice) utter.voice = thaiVoice;
        utter.rate = rate;
        utter.onend = () => {
          if (activeUtterance === utter) activeUtterance = null;
        };
        utter.onerror = () => {
          if (activeUtterance === utter) activeUtterance = null;
        };
        activeUtterance = utter; // 強引用住，播放完成前不能被 GC 回收
        synth.speak(utter);
      };
```

改成：

```ts
  const speak = useCallback(
    (text: string, rate = 0.65, onEnd?: () => void) => {
      if (!supported) return;
      const synth = window.speechSynthesis;

      const doSpeak = () => {
        // 音訊管線啟動本身也有一點延遲，就算前面沒有任何語音在播、單獨點一次
        // 也偶爾會發生。在真正內容前面墊一個逗號當緩衝——逗號不會被念出來，
        // 只會造成一個很短的停頓，讓管線啟動的延遲去吃這個停頓，而不是吃到
        // 真正的第一個音節。
        const utter = new SpeechSynthesisUtterance(`, , ${text}`);
        utter.lang = "th-TH";
        if (thaiVoice) utter.voice = thaiVoice;
        utter.rate = rate;
        utter.onend = () => {
          if (activeUtterance === utter) activeUtterance = null;
          onEnd?.();
        };
        utter.onerror = () => {
          if (activeUtterance === utter) activeUtterance = null;
          onEnd?.();
        };
        activeUtterance = utter; // 強引用住，播放完成前不能被 GC 回收
        synth.speak(utter);
      };
```

`onEnd` 是 `speak()` 呼叫當下傳進來的參數（不是外層 `useCallback` 依賴陣列裡的東西），所以 `[supported, thaiVoice]` 這個依賴陣列不用跟著改。既有呼叫端（例如 `SpeakButton` 裡的 `speak(text, rate)`）省略第三個參數一樣能正常運作，不受影響。

- [ ] **Step 8: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤

- [ ] **Step 9: 重寫 `VinylRecord`**

整個取代 `src/components/VinylRecord.tsx` 的內容:

```tsx
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Note } from "../data/notes";
import { computeDockOffset } from "../lib/dockOffset";
import { useDockingDrag } from "../hooks/useDockingDrag";
import { useSpeech } from "../hooks/useSpeech";

const UNSUPPORTED_SPEECH_FALLBACK_MS = 3000;

interface Props {
  note: Note;
  accent: "rust" | "orange" | "gold";
  platterRef: RefObject<HTMLDivElement | null>;
  isActive: boolean;
  onDock: (day: number) => void;
  onUndock: (day: number) => void;
}

export default function VinylRecord({ note, accent, platterRef, isActive, onDock, onUndock }: Props) {
  const { speak, supported } = useSpeech();
  const vinylRef = useRef<HTMLDivElement>(null);

  const getDockTarget = useCallback(() => {
    const vinyl = vinylRef.current;
    const platter = platterRef.current;
    if (!vinyl || !platter) return { x: 0, y: 0, scale: 1 };
    return computeDockOffset(vinyl.getBoundingClientRect(), platter.getBoundingClientRect());
  }, [platterRef]);

  const handleDockRequest = useCallback(() => onDock(note.day), [onDock, note.day]);

  const { phase, offset, handlers, dockNow, undock } = useDockingDrag({
    getDockTarget,
    onDock: handleDockRequest,
  });

  const isDocked = phase === "docked";
  const isDragging = phase === "dragging";

  // 對接成功後才開始播放：播完（語音 onEnd）或不支援語音時的降級計時器
  // 一到，就飛回原位並通知 RecordWall 這張不再是作用中的那張。cleanup
  // 同時處理「正常播完」跟「被別的唱片打斷」（isDocked 從 true 變 false）
  // 兩種情況，靠 cancelled 旗標避免計時器/onEnd 在打斷之後才觸發而重複
  // 收尾。故意只依賴 [isDocked]：speak/supported/note 在同一次對接期間
  // 不會變，列進依賴只會讓 effect 在無關的重新渲染時誤重跑、打斷正在
  // 播放的語音。
  useEffect(() => {
    if (!isDocked) return;
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      undock();
      onUndock(note.day);
    };

    if (supported) {
      speak(note.thai, undefined, finish);
    } else {
      fallbackTimer = setTimeout(finish, UNSUPPORTED_SPEECH_FALLBACK_MS);
    }

    return () => {
      cancelled = true;
      if (fallbackTimer != null) clearTimeout(fallbackTimer);
    };
  }, [isDocked]);

  // 被別的唱片搶走撥放器：isActive 從 true 變 false 時立刻中斷、飛回原位。
  useEffect(() => {
    if (!isActive && isDocked) {
      undock();
    }
  }, [isActive, isDocked, undock]);

  const ariaLabel = isDocked
    ? `Day ${note.day}：${note.thai}，${note.zh}，播放中`
    : "拖曳或按 Enter 把唱片放上撥放器";

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.scale})`,
  };

  return (
    <div
      ref={vinylRef}
      className={`vinyl accent-${accent} ${isDragging ? "vinyl-dragging" : ""} ${isDocked ? "vinyl-docked" : ""}`}
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
          dockNow();
        }
      }}
    >
      <div className="vinyl-disc">
        <span className="vinyl-label">
          <span className="vinyl-mystery">?</span>
        </span>
      </div>
    </div>
  );
}
```

**重要技術細節**：唱片的「位移/縮放」（`transform: translate(...) scale(...)`，跟著 `offset` state 變）跟「旋轉」（對接後持續轉圈的動畫）分別套在**兩層不同的 DOM 元素**上——外層 `.vinyl`（inline style 的 translate/scale）、內層 `.vinyl-disc`（CSS `animation` 做旋轉）。這不是隨便分的：CSS 的 `transform` 屬性在同一個元素上只能有一個最終值，如果把 `rotate()` 的 keyframe 動畫也套在同一個 `.vinyl` 上，動畫執行時會**整個蓋掉** inline style 算出來的 translate/scale，唱片對接後會瞬間跳回沒有位移的位置、視覺上像是又飛回架上但同時在旋轉，是錯的。分成兩層各自控制自己的 `transform`，才不會互相打架。

- [ ] **Step 10: 更新唱片樣式，刪掉舊的封套/重播樣式**

修改 `src/style.css`，找到（從 `.record-sleeve` 開始，到舊版 `@media (prefers-reduced-motion: reduce) { .vinyl { transition: none; } }` 那個區塊結束為止，這一大段全部替換掉）：

```css
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

換成：

```css
.accent-rust .vinyl-label {
  background: var(--rust);
}

.accent-orange .vinyl-label {
  background: var(--orange);
}

.accent-gold .vinyl-label {
  background: var(--gold);
}

/* z-index:2 是刻意的簡化：讓對接中／已對接的唱片一律蓋在整台撥放器
   （z-index:1，見 Task 1 的 .record-player）上面，包含唱臂。真實世界
   唱臂應該要蓋在唱片上面才對，但唱片元素跟撥放器元素是兩棵不同的
   DOM 子樹（分別在 .record-row / .record-player 底下），要讓唱臂單獨
   蓋在唱片上面、唱片又蓋在轉盤上面，需要把唱臂拆成獨立的第三層或用
   React portal 重新掛載唱片節點，對這個規模的個人專案不划算。目前的
   簡化結果：唱臂角度設計成從撥放器右上角斜插進來、只碰到轉盤邊緣，
   跟唱片主要蓋住的中心區域重疊不多，視覺上還可以接受。 */
.vinyl {
  position: relative;
  z-index: 2;
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vinyl-dragging {
  transition: none;
  cursor: grabbing;
}

.vinyl-docked {
  cursor: default;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #1a1a1a 0px,
    #1a1a1a 2px,
    #262626 3px,
    #1a1a1a 4px
  );
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-docked .vinyl-disc {
  animation: record-spin 1.8s linear infinite;
}

@keyframes record-spin {
  to {
    transform: rotate(360deg);
  }
}

.vinyl-label {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-mystery {
  font-size: 16px;
  font-weight: 800;
  color: var(--night);
}

@media (prefers-reduced-motion: reduce) {
  .vinyl {
    transition: none;
  }

  .vinyl-docked .vinyl-disc {
    animation: none;
  }
}
```

- [ ] **Step 11: 刪掉被取代的舊 hook**

```bash
rm src/hooks/useDraggableLift.ts
```

- [ ] **Step 12: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤（`VinylRecord.tsx` 現在需要 `platterRef`/`isActive`/`onDock`/`onUndock` 這幾個新 props，還沒有任何呼叫端傳；下一步用暫時的測試接線提供假資料驗證，Task 3 才會是正式接線）

- [ ] **Step 13: 手動驗證（暫時掛到 App 上）**

在 [src/App.tsx](../../../src/App.tsx) 最上面暫時加：

```tsx
import { useRef, useState } from "react";
import RecordPlayer from "./components/RecordPlayer";
import VinylRecord from "./components/VinylRecord";
```

在 `<section className="hero">` 結束的 `</section>` 後面暫時加：

```tsx
<TempDockingHarness />
```

在檔案最後面（`export default App;` 之後，或另外找個地方，只要在同一個檔案、`App` 函式外面）暫時加一個測試用元件：

```tsx
function TempDockingHarness() {
  const platterRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const note = sortedNotes[0];
  const isActive = activeDay === note.day;

  return (
    <div style={{ padding: "40px 0", background: "#1b2438" }}>
      <RecordPlayer isPlaying={isActive} activeNote={isActive ? note : null} platterRef={platterRef} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <VinylRecord
          note={note}
          accent="rust"
          platterRef={platterRef}
          isActive={isActive}
          onDock={(day) => setActiveDay(day)}
          onUndock={(day) => setActiveDay((prev) => (prev === day ? null : prev))}
        />
      </div>
    </div>
  );
}
```

Run: `npm run dev`，打開瀏覽器到終端機顯示的網址。

檢查：
- 畫面上出現撥放器 + 一張唱片（圓標籤顯示「?」）。
- 拖曳唱片往撥放器方向拉超過一段距離放開：唱片飛過去疊在轉盤上、放大到轉盤大小、開始持續旋轉；撥放器唱臂搖下來；撥放器下方標籤區淡入顯示這句筆記的泰文/拼音/中文；如果瀏覽器有支援 Web Speech API 且系統裝了泰文語音包，會聽到唸出來。
- 語音播完之後（或瀏覽器不支援語音、等大約 3 秒後）：唱片自動飛回原本在架上的位置、停止旋轉，撥放器唱臂搖回去、標籤區清空。
- 拖曳距離不夠就放開：唱片彈簧滑回原位，不會對接、不會播音。
- 用 Tab 鍵移到唱片上，按 Enter：直接對接、播放，效果跟拖曳一樣，不用拖曳。

確認以上都符合預期後，把這段暫時加的 `import`、`<TempDockingHarness />`、`TempDockingHarness` 函式整個從 `App.tsx` 刪掉（Task 3 會用正式的 `RecordWall` 取代，包含「兩張唱片互相搶撥放器」的情況，這裡先不用測）。

- [ ] **Step 14: Commit**

```bash
git add src/lib/dockOffset.ts src/lib/dockOffset.test.ts src/hooks/useDockingDrag.ts src/hooks/useSpeech.ts src/components/VinylRecord.tsx src/style.css
git rm src/hooks/useDraggableLift.ts
git commit -m "Replace lift-and-reveal drag with dock-to-player drag on VinylRecord"
```

---

### Task 3: `RecordWall` 狀態協調 + 版面樣式

**Files:**
- Modify: `src/components/RecordWall.tsx`（整個重寫）
- Modify: `src/style.css`

**Interfaces:**
- Consumes: `RecordPlayer`（Task 1，props `{ isPlaying, activeNote, platterRef }`）；`VinylRecord`（Task 2，props `{ note, accent, platterRef, isActive, onDock, onUndock }`）；`pickRandom` from [src/lib/random.ts](../../../src/lib/random.ts)；`sortedNotes` from [src/data/notes.ts](../../../src/data/notes.ts)。
- Produces: `<RecordWall />`（無 props，跟現在 [src/App.tsx](../../../src/App.tsx) 裡的呼叫方式完全一樣，不需要改 `App.tsx`）。

- [ ] **Step 1: 重寫 `RecordWall`**

整個取代 `src/components/RecordWall.tsx` 的內容:

```tsx
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
```

- [ ] **Step 2: 更新版面樣式**

修改 `src/style.css`，找到:

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
  /* 一顆拿起來的唱片會從封套頂端往上冒出約 58px（見下方 .vinyl 的算法：
     靜止時 top = 140 - (-18) - 120 = 38px，拿起時再位移 -96px，
     38 - 96 = -58px），40px 的間距不夠、蓋到這句提示文字。
     80px 留出約 22px 緩衝，唱片牆三個斷點都刻意讓這個上冒距離維持
     58px（見 .vinyl 在兩個 media query 裡的 bottom 值），所以這裡不用
     另外針對斷點加規則。 */
  margin: 0 0 80px;
}

.record-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 56px;
  flex-wrap: wrap;
}
```

換成:

```css
/* ---------- Record wall ---------- */
.record-wall {
  background: var(--night);
  padding: 32px 24px 56px;
  text-align: center;
}

.record-wall-hint {
  color: var(--night-dim);
  font-size: 14px;
  letter-spacing: 0.04em;
  margin: 0 0 4px;
}

.record-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  margin-top: 24px;
}
```

- [ ] **Step 3: 更新響應式斷點**

修改 `src/style.css`，找到（在 `@media (width <= 850px) { ... }` 區塊裡面）:

```css
  /* 唱片牆：3 張封套 140px + 2 個 56px 間距 = 532px。.record-wall 左右
     padding 各 24px，寬度介於 561px~579px 之間時可用寬度會落到
     532px 以下（例：570px 時可用寬度只有 522px），若不縮小這裡會在
     還沒進到 560px 斷點前就先擠出換行。縮到 116/100/40 之後
     3*116+2*40=428px，涵蓋這個斷點內所有寬度都還能一行排下。
     .vinyl 的 bottom 從 -18px 改成 -22px，是為了讓「靜止時黑膠露出
     封套頂端的距離」（= sleeve高 - vinyl高 + |bottom|）維持在跟桌面版
     一樣的 38px（116 - 100 + 22 = 38），這樣拿起來後上冒的距離也
     維持在 38 - 96 = -58px，跟桌面版一致，不會讓上面 .record-wall-hint
     的間距在這個斷點失準。 */
  /* .record-wall 前綴不是裝飾——這個「Responsive」區塊在檔案裡排在
     「Record wall」那個區塊（.record-row/.record-sleeve/.vinyl 的
     無條件基礎規則）前面，兩者 specificity 一樣的話，後面出現的基礎規則
     會贏（CSS 同 specificity 比的是原始碼順序，跟是否包在 @media 裡無關），
     這裡加的縮小規則就會被完全蓋掉、白寫。加 .record-wall 前綴把
     specificity 墊高，才能確保無論原始碼順序如何，這裡的斷點規則
     都贏得過後面的基礎規則。 */
  .record-wall .record-row { gap: 40px; }
  .record-wall .record-sleeve { width: 116px; height: 116px; }
  .record-wall .vinyl { width: 100px; height: 100px; bottom: -22px; margin-left: -50px; }
  .record-wall .vinyl-label { width: 38px; height: 38px; }
  .record-wall .vinyl-lifted .vinyl-label { width: 65px; height: 65px; }
```

換成:

```css
  /* 唱片牆改成撥放器 + 底部一排唱片後，對接位置是即時量測算出來的
     （見 VinylRecord 的 getDockTarget/computeDockOffset），不需要再
     像舊版那樣為了固定位移量精算每個斷點的像素數字。這裡只是讓撥放器
     跟唱片架在較窄的螢幕上不會太擠。
     .record-wall 前綴不是裝飾——這裡的斷點規則跟後面「Record player」/
     「Record wall」區塊裡的無條件基礎規則 specificity 一樣（都是單一
     class 選擇器），同 specificity 時 CSS 比原始碼順序決定輸贏，
     跟是否包在 @media 裡無關；基礎規則排在檔案更後面，沒有前綴的話
     會贏、讓這裡的縮小規則整個變成死代碼。加 .record-wall 前綴把
     specificity 墊高，才能確保無論原始碼順序如何都贏得過基礎規則
     ——跟舊版（已刪除）的 .record-sleeve/.vinyl-lifted 斷點規則用的
     是同一招。 */
  .record-wall .record-player { width: 190px; height: 148px; }
  .record-wall .record-player-platter { width: 100px; height: 100px; }
  .record-wall .vinyl { width: 80px; height: 80px; }
```

找到（在 `@media (width <= 560px) { ... }` 區塊裡面）:

```css
  /* 唱片牆：手機寬度下 3 張封套一定擠不進一行，改用直排讓「一排一張」
     的結果不用再賭寬度剛好落在哪裡。真正要顧的是垂直間距：拿起唱片的
     位移量寫死在 useDraggableLift 的 liftOffset（translate(0, -96px)，
     跟斷點無關、CSS 改不到），加上 .vinyl-replay 固定 bottom:-40px，
     兩者都不會因為斷點縮小而跟著變小。把 .vinyl 的 bottom 調到 -24px，
     讓這個斷點下「靜止時黑膠露出封套頂端的距離」還是 38px
     （104 - 90 + 24 = 38），拿起來後一樣上冒 38 - 96 = -58px（跟桌面版
     一致）。同一排相鄰兩張唱片都被拿起的最壞情況需要的垂直間距是
     「上冒 58px ＋ 下面重播按鈕垂到封套下緣外 40px」= 98px，
     這裡給 120px（多留 22px 緩衝），確保不會疊到。 */
  /* 同上面 850px 斷點的理由：加 .record-wall 前綴確保 specificity 贏過
     後面「Record wall」區塊裡的無條件基礎規則。 */
  .record-wall .record-row { flex-direction: column; align-items: center; flex-wrap: nowrap; gap: 120px; }
  .record-wall .record-sleeve { width: 104px; height: 104px; }
  .record-wall .vinyl { width: 90px; height: 90px; bottom: -24px; margin-left: -45px; }
  .record-wall .vinyl-label { width: 35px; height: 35px; }
  .record-wall .vinyl-lifted .vinyl-label { width: 59px; height: 59px; }
```

換成:

```css
  .record-wall .record-player { width: 160px; height: 126px; }
  .record-wall .record-player-platter { width: 86px; height: 86px; left: 24px; top: 20px; }
  .record-wall .record-player-arm { height: 72px; }
  .record-wall .vinyl { width: 68px; height: 68px; }
  .record-wall .record-row { gap: 24px; }
```

- [ ] **Step 4: 型別檢查**

Run: `npx tsc -b --noEmit`
Expected: 沒有錯誤

- [ ] **Step 5: 手動驗證（完整流程，包含互斥規則）**

Run: `npm run dev`，打開首頁。

檢查：
- Hero 標題下方依序出現：引導文案 →撥放器（空的，唱臂搖起來的角度，標籤區顯示提示文字）→ 一排 3 張唱片（都顯示「?」）。
- 重新整理頁面幾次：3 張唱片內容會換成不同天的筆記，且同一次不會抽到重複的兩天（沿用既有的 `pickRandom`）。
- 拖曳其中一張唱片到撥放器上：對接動畫、播放、播完自動飛回原位，跟 Task 2 驗證過的行為一致。
- **互斥規則（這個任務才第一次能測到，因為 Task 2 的暫時測試接線只有一張唱片）**：拖一張唱片到撥放器上開始播放後，趁它還在播放時，馬上把另一張也拖到撥放器上。檢查：前一張立刻中斷、飛回原位（不等它自然播完），新的那張正常對接、播放；播放器唱臂/轉盤旋轉/標籤區內容都正確切換成新的那張的資訊，沒有殘留舊的。
- 依序測試 3 張都能各自對接、播放、返回，互不影響順序。
- 手機版（瀏覽器開發者工具切換成行動裝置檢視）：撥放器跟唱片排版不會爆版、唱片依然可以拖拽對接。

- [ ] **Step 6: Commit**

```bash
git add src/components/RecordWall.tsx src/style.css
git commit -m "Coordinate active-record state in RecordWall and finalize shelf layout"
```

---

### Task 4: 最終檢查（reduced motion、鍵盤操作、不支援語音的降級、建置）

**Files:**
- 不新增/修改檔案，純驗證

- [ ] **Step 1: 確認 reduced motion 有生效**

在瀏覽器開發者工具打開 Rendering 面板，把 `prefers-reduced-motion` 模擬成 `reduce`，重新整理頁面。

檢查：拖曳唱片對接時，飛行位移的過渡動畫、唱片旋轉動畫、撥放器唱臂搖動的過渡動畫都變成直接跳過去（沒有動畫過渡），但唱臂角度、標籤內容、聲音本身都還在，只是沒有動畫。

- [ ] **Step 2: 確認全鍵盤操作**

不用滑鼠，只用 Tab／Shift+Tab／Enter 在頁面上移動，依序把 3 張唱片都用 Enter 對接。

檢查：每張都能被 Tab 到（有清楚的焦點 outline）、Enter 後立刻對接、播放，效果跟拖曳一樣完整（飛行動畫、唱臂、旋轉、標籤、聲音），不需要任何拖曳動作。用 Enter 觸發互斥規則（一張還在播放時，Tab 到另一張按 Enter）也要正常運作。

- [ ] **Step 3: 確認不支援語音時的降級**

在瀏覽器開發者工具的 Console 執行 `Object.defineProperty(window, 'speechSynthesis', { value: undefined })`，然後重新整理頁面（這會讓 `useSpeech` 的 `supported` 判斷為 `false`）。

檢查：拖曳唱片對接一樣正常觸發動畫、唱臂搖下來、標籤區顯示內容，只是沒有聲音；大約 3 秒後唱片自動飛回原位、唱臂搖回去，不會卡在對接狀態出不來。

- [ ] **Step 4: Lint 檢查**

Run: `npm run lint`
Expected: 沒有新增的 lint 錯誤

- [ ] **Step 5: 正式建置確認**

Run: `npm run build`
Expected: 建置成功產出 `dist/`，沒有 TypeScript 或 build 錯誤

- [ ] **Step 6: 自動化測試確認**

Run: `npm test`
Expected: 全部通過（`src/lib/random.test.ts` 5 個 + `src/lib/dockOffset.test.ts` 3 個，共 8 個測試）

---

## Self-Review Notes

- **Spec 覆蓋**：spec 的每一節都有對應任務——撥放器視覺（Task 1）、對接動畫時序（Task 2 的 `useDockingDrag` + `VinylRecord` 的 `useEffect`）、互斥規則（Task 3 的 `RecordWall` state + Step 5 手動驗證）、無障礙（Task 2/4 的鍵盤路徑）、資料層不變（沒有任何任務動 `src/lib/random.ts` 或 `src/data/notes.ts`）、拿掉重播機制（Task 2 的 `VinylRecord` 重寫沒有 `SpeakButton`/`.vinyl-replay`）都各自有任務涵蓋。spec 中「不在此次範圍」的項目（播放佇列、撥放器可拖曳、新動畫套件）沒有出現在任何任務裡。
- **型別一致性**：`useDockingDrag` 回傳的 `{ phase, offset, handlers, dockNow, undock }` 跟 `VinylRecord` 裡的解構用法一致；`computeDockOffset` 的 `DockOffset` 型別在 `useDockingDrag.ts`/`VinylRecord.tsx` 之間一致（都從 `src/lib/dockOffset.ts` 匯入，不是各自重複定義）；`RecordPlayer`/`VinylRecord` 的 `platterRef` prop 型別（`RefObject<HTMLDivElement | null>`）跟 `RecordWall` 裡 `useRef<HTMLDivElement>(null)` 建立的 ref 型別相容；`onDock`/`onUndock` 的簽名 `(day: number) => void` 在 `VinylRecord` 的 props 型別、`RecordWall` 的 `handleDock`/`handleUndock` 之間一致。
- **無佔位符**：所有步驟都附完整可執行的程式碼或具體的手動檢查清單。
