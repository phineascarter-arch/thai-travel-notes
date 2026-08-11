# 水上市場互動小遊戲 — 設計文件

日期:2026-08-12

## 背景與目標

使用者想要第二個互動學習小遊戲,跟首頁黑膠唱片機([RecordWall](../../../src/components/RecordWall.tsx))互補:唱片機是夜晚室內、拖曳拿起唱片的觸覺互動;水上市場走白天戶外路線,沒有時間壓力、沒有對錯評分,純粹「划船經過、點擊、聽發音、看意思」的探索式複習,靈感來自泰國經典的水上市場(丹嫩沙朵/安帕瓦)。相較於唱片機一次只呈現 3 天的「headline 例句」,水上市場改用逐詞拆解出的單字(tokens)當內容,讓使用者能大量、隨機地接觸已學過的個別詞彙。

## 範圍

- 新增獨立區塊 `<section id="floating-market">`,插入在複習測驗(`<ReviewQuiz />`)之後、時間軸(`content-grid`)之前;`<nav>` 新增對應錨點連結「水上市場」([App.tsx](../../../src/App.tsx))。
- 場景同時顯示固定 6 艘船(常數,可調;先前討論的「5~8 艘」取中間值定案),各自沿河道緩緩橫向漂移;船划出畫面或被點擊後,從單字池隨機補一艘新船上場,維持船數穩定、持續補新。
- 點擊船隻:在船隻旁彈出一張小卡牌,顯示中文意思＋拼音;同時用 `useSpeech` 播放泰文發音。卡牌顯示 5 秒後自動關閉(或使用者再次點擊該船/點擊卡牌外提前關閉),船隻在這段期間持續原本的划行動畫,划出畫面後自然消失、被新船取代。
- 不做:計時、分數、對錯判定、答題記錄;不影響/不取代黑膠唱片機的既有邏輯;不引入外部動畫/物理套件。

## 資料模型:單字池

```ts
// src/lib/wordPool.ts
import { sortedNotes, type Token, type Category } from "../data/notes";

export interface PoolWord extends Token {
  category: Category; // 來源例句所屬分類,決定船隻貨物插畫
}

export const wordPool: PoolWord[] = dedupeByThai(
  sortedNotes.flatMap((note) =>
    note.examples.flatMap((ex) => ex.tokens.map((t) => ({ ...t, category: note.category })))
  )
);
```

- 依 `thai` 文字去重(同一個詞在不同例句重複出現時只保留第一次出現的版本),避免 ค่ะ／ครับ／แล้ว 這類高頻助詞洗版。
- 去重後的池子是純衍生資料,不需手動維護,之後新增 Day 會自動納入。
- [ReviewQuiz.tsx](../../../src/components/ReviewQuiz.tsx) 內已有一個功能相同的私有函式 `dedupeByThai(tokens: Token[]): Token[]`(用來去除 cloze 選項的重複字)。實作時把它抽成 `src/lib/tokens.ts` 的共用函式,`wordPool.ts` 與 `ReviewQuiz.tsx` 都改成引用同一份,避免兩份重複邏輯各自維護。

## 船隻邏輯

- `FloatingMarket` 元件維護 `boats: Boat[]` 狀態,每個 `Boat` 是 `{ id, word: PoolWord, lane, speed, startedAt }` 的組合:
  - `lane`:決定船隻的垂直位置與微幅浮動相位,讓船不會全部疊在同一條水平線上。
  - `speed` / `startedAt`:決定這艘船的動畫時長與延遲,讓每艘船的節奏不同、不會整批同時抵達終點。
- 掛載時用 `pickRandom(wordPool, 8)`(複用既有 [src/lib/random.ts](../../../src/lib/random.ts))產生初始 8 艘船。
- 每艘船的 CSS 動畫(`animation-duration` 對應 `speed`)結束時觸發 `onAnimationEnd`,把該船從陣列移除、用 `pickRandom(wordPool, 1)` 補一艘新船,新船的 `startedAt`/`lane` 重新隨機。
- 點擊船隻不會提前結束動畫或讓船消失——單純疊加一張 `WordCard`,船繼續划行;卡牌用 `position: absolute` 定位在點擊當下船隻的位置附近,不跟著船一起移動(避免卡牌內容還沒看完就被拖走)。

## 視覺風格

- 晨光水上市場:暖金色天空漸層(沿用 `--gold`/`--orange`)、深藍綠色河水(新增 `--river` CSS 變數)、木造小船剪影、遠景棕櫚樹/水上屋輪廓。
- 船隻依 `word.category` 決定船上貨物插畫(例如 購物殺價→水果籃、餐廳點餐→餐具/湯鍋、住宿→行李箱、機場交通→船槳/地圖、閒聊→燈籠/花環),用簡單的 emoji 或手繪風 SVG 圖示點綴,非必要精細插畫。
- `WordCard`:米白底卡片(沿用 `--cream`/`--line`),大字泰文＋拼音＋中文,右上角一顆 `SpeakButton`(`size="sm"`,方便重播)。
- 整體與黑膠唱片機的深夜室內色調(`--night` 系列)形成日夜對比,呼應「白天戶外探索」vs「夜晚室內複習」的兩種心情。

## 無障礙與邊界情況

- 支援 `prefers-reduced-motion`:開啟時船隻改為靜態排列(不做橫向漂移動畫),點擊互動不受影響。
- `useSpeech` 不支援時,點擊船隻一樣彈出卡牌顯示文字內容,只是不出聲(跟現有 `SpeakButton`、`VinylRecord` 的降級邏輯一致)。
- 快速連續點擊多艘船:沿用 `useSpeech` 內建的 `activeUtterance`/`requestId` 機制,不會疊音或搶播;卡牌本身允許同時開啟多張(這裡沒有唱片機那種「一次只播一句」的排他 UI 狀態),但同一時間只有一句語音真正在播放,其餘卡牌純顯示文字。
- 船隻元素用 `role="button" tabIndex={0}`,鍵盤 Enter/Space 觸發跟點擊相同效果(沿用 `openOnEnterOrSpace` 邏輯),`aria-label` 例如「聽聽 สั่ง 怎麼唸」。
- `wordPool` 數量小於 8(理論邊界,目前有數百個詞不會發生)時,`pickRandom` 自動降為抽全部,不會噴錯或重複。

## 不在此次範圍

- 學習進度/收集紀錄(例如「已聽過幾個字」計數器)——先做成單純探索體驗,之後若需要可再疊加。
- 依複習測驗那套 `weightOf()` 加權抽選(維持單純隨機,不特別讓弱項詞洗更多版,因為這是探索場景不是測驗)。
- 點擊卡牌連結回該詞彙所屬的完整筆記/例句(`NoteModal`)。
- 船隻貨物插畫做成精緻手繪 SVG(先用簡單圖示/emoji 頂上,之後可再迭代美化)。
