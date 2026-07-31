# 泰文旅遊手帳

以「泰文學習手帳」網站為範本做的個人專案，主題聚焦在旅遊基礎對話（機場交通、住宿、餐廳點餐、購物殺價、閒聊）。React + Vite + 手寫 CSS，資料驅動，不需要後端。

## 開發

```bash
npm install
npm run dev
```

打開終端機顯示的網址（預設 `http://localhost:5173`）即可看到畫面，存檔會自動更新（HMR）。

想跑測試（目前只有 `src/lib/random.ts` 這種不碰 DOM 的純函式有寫 Vitest 單元測試）：

```bash
npm test
```

## 怎麼新增一天的內容？

**只需要編輯一個檔案：[`src/data/notes.ts`](src/data/notes.ts)。**

1. 打開 `src/data/notes.ts`，找到 `notes` 陣列
2. 複製陣列中任何一筆物件，貼到陣列最前面（新的一天排在最上面）
3. 依序填入：

   | 欄位 | 說明 | 範例 |
   |---|---|---|
   | `day` | 第幾天，通常是目前最大值 +1 | `7` |
   | `date` | 日期，格式 `YYYY.MM.DD` | `"2026.07.28"` |
   | `thai` | 泰文單字／短句 | `"เช็คอิน"` |
   | `roman` | 羅馬拼音 | `"chék-in"` |
   | `zh` | 中文意思 | `"辦理入住"` |
   | `category` | 只能是 `CATEGORIES` 裡的其中一種：`閒聊`／`機場／交通`／`住宿`／`餐廳點餐`／`購物殺價` | `"住宿"` |
   | `pattern` | 選填，句型公式 | `"ขอ + เช็คอิน"` |
   | `examples` | 2-3 句例句，每句都要拆 `tokens`（逐詞對照拼音＋中文） | 見下方範例 |
   | `note` | 選填，補充說明或使用小提醒 | — |

4. 存檔即可，畫面（拍立得牆、時間軸、搜尋、分類篩選、複習測驗題庫）都會自動讀到新資料，不用改任何其他檔案。

### 完整範例

```ts
{
  day: 7,
  date: "2026.07.28",
  thai: "เช็คอิน",
  roman: "chék-in",
  zh: "辦理入住",
  category: "住宿",
  pattern: "ขอ + เช็คอิน",
  examples: [
    {
      zh: "我要辦理入住",
      thai: "ขอเช็คอินครับ",
      roman: "khǎaw chék-in khráp",
      tokens: [
        { thai: "ขอ", roman: "khǎaw", zh: "請給我／要求" },
        { thai: "เช็คอิน", roman: "chék-in", zh: "辦理入住" },
        { thai: "ครับ", roman: "khráp", zh: "（男性禮貌詞尾）" },
      ],
    },
  ],
  note: "chék-in 是英文 check-in 的泰語音譯，飯店、機場都通用。",
}
```

### 想加新的分類？

打開 `src/data/notes.ts` 最上面的 `CATEGORIES` 陣列，直接加一個字串進去即可，主題篩選按鈕、TypeScript 型別檢查都會自動跟著更新。

## 發音播放（🔊）

點單字、例句、逐詞卡片旁邊的 🔊 就會用瀏覽器內建的 Web Speech API（`speechSynthesis`）唸出泰文，純前端、不用 API key、不用網路服務。實作在 [`src/hooks/useSpeech.ts`](src/hooks/useSpeech.ts) 和 [`src/components/SpeakButton.tsx`](src/components/SpeakButton.tsx)。

**音質吃裝置系統內建的泰文語音包，不是網站自動下載的。** 在 iPhone 上第一次使用前，建議先手動裝一次：

> 設定 → 輔助使用 → 語音內容 → 聲音 → 加入新語言 → 泰文 → 下載

裝好之後 Safari／Chrome 等瀏覽器都能直接用該語音包，不用每個網站另外設定。沒裝的話系統可能會用其他語言的引擎硬唸泰文，發音會不準。

## 複習測驗怎麼來的？

`ReviewQuiz` 元件（[`src/components/ReviewQuiz.tsx`](src/components/ReviewQuiz.tsx)）會把 `notes.ts` 裡所有例句攤平成題庫，測驗時純前端出題，不呼叫任何 AI 或 API，所以完全免費、離線也能用。三種模式：

- **拼音選中文**：看羅馬拼音選中文意思
- **中文選拼音**：看中文選羅馬拼音
- **句子挖空**：句子裡的一個詞被挖空，看完整翻譯猜詞，答案用自評（✓／✗）

出題不是單純隨機——常常答錯的句子權重比較高，會更容易被抽到（邏輯在 [`src/lib/progress.ts`](src/lib/progress.ts) 的 `weightOf`）。答錯的題目也不會就這樣過去，會被排到這一輪測驗的尾端稍後再考一次，直到答對為止；最後的「%成績」只看每題**第一次**看到時有沒有答對，重考不會把分數灌水。

所有答題紀錄存在瀏覽器的 `localStorage`（key：`thai-notes-word-stats`），只在你自己的裝置上，不會上傳。清瀏覽器資料或換裝置就會重新開始累積。

## 連續學習天數

側欄的「連續學習」數字是**真的每天打開這個網站才會累積**的天數（存在 `localStorage`，key：`thai-notes-visited-days`），不是內容寫了幾天。中斷一天沒開，數字就會歸零重算。這跟首頁「看全部 N 篇筆記」的內容篇數是兩件事，不要搞混。

## 首頁的黑膠唱片牆 🎵

Hero 標題下方會隨機抽 3 篇筆記，用黑膠唱片的造型呈現：一開始蓋在封套下面只看得到一個「?」，拖曳唱片（或是 Tab 移過去、按 Enter）把它拿起來，拖超過一定距離放開，就會揭曉泰文／拼音／中文，同時用 Web Speech API 唸出來。已經揭曉的唱片，點旁邊的 🔊 或是再點一次唱片本身都可以重播發音。每次重新整理頁面才會重新抽一批，同一次不會抽到重複的兩天。

實作分三塊：`src/lib/random.ts` 的 `pickRandom` 負責不重複隨機抽選、`src/hooks/useDraggableLift.ts` 封裝拖拽手勢的狀態機（idle／dragging／lifted）、`src/components/VinylRecord.tsx` + `src/components/RecordWall.tsx` 負責畫面跟排版。跟複習測驗一樣不呼叫任何 AI 或 API。

## 部署

跑 `npm run build` 產生 `dist/` 資料夾，丟到 Cloudflare Pages / Vercel / Netlify / GitHub Pages 任何一個都可以直接上線，是純靜態網站。

```bash
npm run build
```

## 專案結構

```
src/
├── data/notes.ts          ← 你唯一需要常常編輯的檔案
├── components/
│   ├── ReviewQuiz.tsx      複習測驗（三種模式 + 弱點加強 + 錯題重考）
│   ├── NoteModal.tsx       筆記詳細內容彈窗
│   ├── RecordWall.tsx      首頁黑膠唱片牆容器（隨機抽 3 篇 + 排版）
│   ├── VinylRecord.tsx     單張黑膠唱片（拖拽／Enter 拿起 + 播音）
│   └── SpeakButton.tsx     發音按鈕
├── hooks/
│   ├── useSpeech.ts         Web Speech API 封裝
│   └── useDraggableLift.ts  唱片拖拽手勢的狀態機（idle/dragging/lifted）
├── lib/
│   ├── progress.ts          本機學習紀錄（答題權重、連續天數）
│   └── random.ts             pickRandom：不重複、不會抽爆的隨機抽選
├── App.tsx                  頁面主結構
└── style.css                 手寫的手帳風格樣式
```
