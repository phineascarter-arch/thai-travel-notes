# 唱片牆互動動畫 — 設計文件

日期:2026-07-31

## 背景與目標

首頁 hero 區塊(標題「我的泰文旅行手帳」所在的深色區塊)目前只有靜態文案。使用者想要參考一張「音樂相框」實體商品的照片(照片中是拼貼照片上疊了好幾張小黑膠唱片,伸手把唱片拿起來的動作會觸發播放音樂),做出對應的網頁互動:黑膠造型的卡片疊在照片牆上,使用者拖拽把唱片「拿起來」,拿起的瞬間揭曉一句泰文短句並用既有的語音合成(`useSpeech`)唸出來,做成一個好玩的隨機複習小互動。

## 範圍

- 新增一個區塊,插入在 `<section className="hero">` 之後、`<section className="note-wall">` 之前([App.tsx](../../../src/App.tsx))。
- 一次顯示 3 張「唱片」,每張對應從全部筆記([src/data/notes.ts](../../../src/data/notes.ts))隨機抽出的 1 天內容,每次重新整理頁面重新抽一批。
- 互動方式:拖拽把唱片從封套裡拉出來(超過距離門檻才算數,沒拉夠會彈簧回彈);鍵盤/無指標裝置有 Enter/Space 後備方案直接觸發同樣效果。
- 唱片一開始只顯示「?」之類的謎面,拿起來的瞬間才揭曉泰文/羅馬拼音/中文,同時觸發語音播放(小遊戲感,呼應現有複習測驗的精神)。
- 不做:放回封套重抽、唱片對應固定分類或固定筆記、新增動畫套件依賴。

## 架構與檔案

新增檔案:

| 檔案 | 職責 |
|---|---|
| `src/lib/random.ts` | 純函式 `pickRandom<T>(arr: T[], n: number): T[]`,Fisher–Yates 洗牌後取前 `min(n, arr.length)` 筆,保證不重複、不會在陣列太短時壞掉。 |
| `src/hooks/useDraggableLift.ts` | 封裝拖拽手勢(pointer 事件、距離門檻、回彈/鎖定狀態機),回傳 `phase`、目前的 transform 偏移量、要綁定在唱片元素上的事件 handler,以及鍵盤後備用的 `liftNow()`。跟 UI 長相、播音邏輯無關,可獨立測試/理解。 |
| `src/components/RecordWall.tsx` | 新區塊容器。掛載時用 `useState(() => pickRandom(sortedNotes, 3))` 抽 3 天筆記(只抽一次,重整頁面才會換),渲染區塊標題引導文案 + 3 張 `VinylRecord`。 |
| `src/components/VinylRecord.tsx` | 單張唱片:封套 + 可拖拽黑膠圓盤。內部用 `useDraggableLift` 驅動狀態與位移,`useSpeech` 播放發音,`lifted` 狀態下顯示泰文/拼音/中文 + `SpeakButton`(重播用)。 |

修改檔案:

- `src/App.tsx`:在 hero 區塊後插入 `<RecordWall />`。
- `src/style.css`:新增 `.record-wall`、`.record-sleeve`、`.vinyl`、`.vinyl-label` 等樣式。

## 資料選取邏輯

```ts
// src/lib/random.ts
export function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(n, shuffled.length));
}
```

`RecordWall` 呼叫 `pickRandom(sortedNotes, 3)`,結果存進 `useState` 的初始值(惰性初始化),確保同一次頁面存活期間 3 張唱片內容固定,重新整理頁面才會重抽。

## 拖拽狀態機

每張唱片有三個狀態:`idle`(蓋在封套下)→ `dragging`(拖曳中)→ `lifted`(已拿起,之後維持此狀態不再變回去)。

- **`pointerdown`**:呼叫 `setPointerCapture`,記錄起始座標,狀態轉 `dragging`。
- **`pointermove`**(僅 `dragging` 時處理):計算與起始座標的位移 `(dx, dy)`,即時套用 `transform: translate(dx, dy)`,不加 CSS transition(手感即時跟手)。
- **`pointerup` / `pointercancel`**:
  - 計算總拖曳距離 `Math.hypot(dx, dy)`。
  - 距離 ≥ 門檻(70px):狀態轉 `lifted`,位移設為固定的「拿起來」位置,觸發一次 `onLift()` callback(`VinylRecord` 用它呼叫 `speak(note.thai)` 並揭曉內容)。
  - 距離 < 門檻:狀態轉回 `idle`,位移歸零,這次改用 CSS transition 做彈簧回彈(跟拖曳中的「無 transition 即時跟手」形成對比)。
- **`liftNow()`**(鍵盤後備):跳過拖曳,直接把狀態設成 `lifted` 並觸發 `onLift()`。綁定在唱片元素的 `onKeyDown`,Enter/Space 觸發,做法呼應 [App.tsx](../../../src/App.tsx) 現有的 `openOnEnterOrSpace`。
- **已經 `lifted` 的唱片被再次點擊/按 Enter**:不重新跑一次拖拽動畫,直接重播 `speak(note.thai)`(方便重聽,不用整個互動重來)。
- 拖拽中的黑膠元素套用 `touch-action: none`,避免手機上拖曳時整頁跟著捲動。
- 唱片容器是 `role="button" tabIndex={0}`,`aria-label` 依狀態變化:
  - `idle`:「拖曳或按 Enter 拿起唱片,聽聽今天抽到哪一句」
  - `lifted`:「Day {n}：{thai}，{zh}，播放發音」(跟現有 polaroid/note-row 的 aria-label 寫法一致)

## 視覺風格

- **封套**:方形小卡,`--cream` 底、`--line` 邊框,套用跟拍立得一樣的 `tilt-*` 隨機小角度歪斜。3 張封套依序用 `--rust` / `--orange` / `--gold` 當強調色(邊框或貼紙裝飾),延續手帳的拼貼感。
- **黑膠圓盤**:圓形,深黑底(`repeating-radial-gradient` 做出溝紋),中心一個彩色圓標籤(圖案用對應的強調色)。`idle` 狀態下只從封套底部露出一小段弧形,暗示可拖拽;`lifted` 狀態下整片滑出、微幅旋轉立在封套上方,圓標籤淡入顯示泰文(大字)/羅馬拼音/中文,搭配一顆 `SpeakButton`(`size="sm"`)供之後重播。
- 區塊標題放一句引導文案(例如「拖拖看,聽聽今天抽到哪一句」),不在每張唱片上個別加提示文字,保持畫面乾淨。

## 無障礙與邊界情況

- 支援 `prefers-reduced-motion`:該偏好開啟時,狀態切換直接跳結果(不做拖曳跟隨/彈簧動畫的漸變)。
- `useSpeech` 回報不支援語音合成(`supported === false`)時,拿起唱片一樣揭曉文字內容,只是不出聲,跟現有 `SpeakButton` 的降級邏輯一致(該元件在不支援時直接回傳 `null`)。
- 連續快速點擊重播:沿用 `useSpeech` 內建的 `synth.speaking`/`pending` 判斷與取消邏輯,不會疊音或搶播。
- `pickRandom` 在筆記總數小於 3 的極端情況(理論邊界,目前有 30 天不會發生)會自動降為抽全部,不會噴錯或重複。

## 不在此次範圍

- 唱片對應固定分類、固定精選筆記,或依複習測驗弱點加權抽選(維持單純隨機)。
- 拖拽把黑膠放回封套、抽新的一批(重新整理頁面才會換一批)。
- 新增動畫/手勢函式庫依賴(維持專案目前零依賴、手刻 hook 的風格)。
