# 唱片牆改版：撥放器 + 對接動畫 — 設計文件

日期:2026-08-01

## 背景與目標

現有的「唱片牆」(2026-07-31 上線)是每張唱片自己一個封套,拖拽把唱片從封套裡拉出來揭曉內容。實際用過之後,使用者想要改成更接近真實場景的互動:畫面上有**一台**撥放器,唱片原本放在下面的架上,把唱片拖到撥放器上才會揭曉內容、播放發音,播完自動飛回原本的位置。這份文件取代原本的拖拽揭曉互動設計,資料來源(隨機抽 3 天筆記)不變。

## 範圍

- 撥放器是唯一一台、共用的元件,浮在畫面上方當視覺主角;3 張唱片沿底部一字排開(呼應現有拍立得牆的排法),各自獨立、間距固定,不再需要「封套」卡片包著。架上待選的唱片本身不做傾斜/歪斜裝飾,平整排列(對應視覺協作工具確認的 mockup),歪斜效果留給既有的拍立得牆使用。
- 撥放器畫成復古寫實黑膠機風格:木紋機身、金屬唱臂、有陰影漸層,跟深色 hero 背景形成對比(已用視覺協作工具確認過,見下方「已定案的視覺方向」)。
- 拖拽任一張唱片到撥放器上(超過距離門檻),或用 Tab 聚焦後按 Enter,都會觸發同一套「對接」動畫:唱片飛到撥放器轉盤上、唱臂搖下來、轉盤與唱片持續旋轉、撥放器下方的獨立標籤區淡入顯示泰文/羅馬拼音/中文,同時觸發語音播放。
- 播放結束(語音 `onend`,或不支援語音時的固定時間降級)後,唱片自動飛回架上原本的位置,唱臂搖回去,標籤區清空,撥放器恢復空白。
- 同時只能有一張唱片在撥放器上:播放中如果又把另一張拖上去,前一張立即中斷、飛回原位,新的那張接上去播,不做播放佇列。
- 想重聽就再拖一次或再按一次 Enter——不再保留「點已揭曉的唱片重播」這個機制(舊設計裡的 `SpeakButton` 重播按鈕跟著拿掉)。
- `prefers-reduced-motion` 開啟時跳過飛行位移與旋轉動畫,直接顯示對接後的最終狀態(標籤內容 + 聲音),不做動畫過渡。
- 不在此次範圍:播放佇列/排隊、超過 3 張唱片、撥放器本身可拖動或客製化外觀、新增動畫函式庫依賴(維持手刻 CSS transform + transition/animation)。

## 已定案的視覺方向(視覺協作工具確認)

- **版面**:撥放器懸浮在上方當主視覺,3 張唱片沿底部排開,各自獨立、間距固定(對應方案 C)。
- **撥放器風格**:復古寫實黑膠機——木紋機身、金屬唱臂、漸層陰影(對應方案 B,而非手帳塗鴉風)。
- **內容顯示位置**:揭曉的泰文/拼音/中文顯示在撥放器下方的獨立標籤區,不是印在唱片自己的圓標籤上(唱片飛到轉盤上之後圖案偏小,獨立標籤區比較好讀)。

## 架構與元件

| 元件/檔案 | 職責 |
|---|---|
| `src/components/RecordPlayer.tsx`(新) | 純顯示元件:畫撥放器本體(機身、轉盤、唱臂、底座)。Props:`isPlaying: boolean`(控制唱臂角度與轉盤旋轉動畫)、`activeNote: Note \| null`(驅動下方獨立標籤區的內容淡入/淡出)。不含任何拖拽或播放邏輯。 |
| `src/components/RecordWall.tsx`(改) | 狀態往上提一層:新增 `activeDay: number \| null` state,代表目前誰在撥放器上。渲染 `RecordPlayer`(依 `activeDay` 算出 `isPlaying`/`activeNote`)跟 3 張 `VinylRecord`,把 `playerRef`(撥放器轉盤的 DOM ref)跟 `onDock(day)` / `onUndock(day)` 往下傳。 |
| `src/components/VinylRecord.tsx`(大改) | 唱片視覺本體。保留拖拽手勢(pointer 事件、距離門檻),但「對接」不再是位移固定像素,而是量測自己與 `playerRef` 的螢幕座標差,transform 過去疊在轉盤上;播放結束後 transform 回歸原位。觸發 `onDock(day)` 讓 `RecordWall` 更新 `activeDay`,結束時觸發 `onUndock(day)`。 |
| `src/hooks/useDraggableLift.ts`(改名/大改為 `useDockingDrag.ts`) | 狀態機從「idle → dragging → lifted(定住)」改成「idle → dragging → docked(暫時,播完自動回 idle)」,`lifted` 的固定位移改成呼叫端傳入的、依 DOM 量測算出的目標位移。 |
| `src/lib/random.ts` | 不動,`pickRandom(sortedNotes, 3)` 邏輯照舊。 |

## 對接動畫時序

1. **觸發**:拖拽距離超過門檻放開,或聚焦後按 Enter(兩者走同一條路徑)。
2. **量測與位移**:用 `playerRef.current.getBoundingClientRect()` 和這張唱片自己的 DOM 節點量出中心點差距(`dx`, `dy`)跟縮放比例(讓唱片視覺尺寸貼合轉盤大小),套用 `transform: translate(dx, dy) scale(s)`,配上 CSS transition 做飛行動畫。
3. **同步效果**:飛行動畫開始的同時,`RecordWall` 把 `activeDay` 設成這張唱片的 `day`——`RecordPlayer` 收到 `isPlaying=true` 後,唱臂 CSS transform 搖下來、轉盤套用持續旋轉的 CSS animation(`@keyframes spin`, `animation: spin 2s linear infinite`),下方標籤區淡入顯示 `note.thai`/`note.roman`/`note.zh`。
4. **播放**:呼叫既有的 `useSpeech().speak(note.thai)`。
5. **結束判定**:優先用 `SpeechSynthesisUtterance.onend` 判斷播放結束;`useSpeech().supported === false`(不支援語音合成)時,改用固定的降級計時器(例如 3 秒後視為結束),避免卡在播放狀態出不來。
6. **回歸**:結束時觸發 `onUndock(day)`——`RecordWall` 把 `activeDay` 設回 `null`,這張唱片的 transform 過渡回 `translate(0,0) scale(1)`(飛回架上原位),`RecordPlayer` 的 `isPlaying` 變 `false`,唱臂搖回去、轉盤停止旋轉、標籤區清空。

## 互斥規則

只有一台撥放器,同一時間只能有一張唱片「對接」中。如果播放中使用者又把另一張唱片拖上去(或用 Enter 觸發):
- 前一張唱片立即中斷:取消它的計時器/語音(`speechSynthesis.cancel()`)、直接把它的 transform 過渡回原位(不用等它自然播完)。
- 新的那張立刻接上去走完整的對接流程(步驟 1-6)。
- `activeDay` 直接切換成新的 `day`,不做播放佇列或排隊等待。

## 無障礙

- 鍵盤 Enter 觸發跟拖拽走完全同一套動畫與時序(飛行、唱臂、旋轉、標籤淡入、聲音),不因為是鍵盤操作就簡化,體驗一致。
- `aria-label` 依對接狀態變化:未對接時是「拖曳或按 Enter 把唱片放上撥放器」,對接中是「Day {n}：{thai}，{zh}，播放中」。
- `prefers-reduced-motion: reduce` 開啟時:跳過飛行位移的 transition 與轉盤的持續旋轉動畫,直接切換到對接後的最終視覺狀態(唱臂角度、標籤內容都還在,只是沒有動畫過渡),聲音本身不受影響。

## 資料與既有邏輯(不變)

- `RecordWall` 掛載時仍用 `pickRandom(sortedNotes, 3)`(`src/lib/random.ts`,已有 Vitest 單元測試,不用重寫)抽 3 天筆記,重新整理頁面才會換一批。
- `useSpeech`/`src/hooks/useSpeech.ts` 不用改,沿用既有的語音合成封裝(含避免開頭截斷的緩衝邏輯)。

## 不在此次範圍

- 播放佇列/排隊等待。
- 超過 3 張唱片、或唱片數量可設定。
- 撥放器本身可拖曳移動或客製化外觀(顏色、機型)。
- 新增動畫或手勢函式庫依賴(維持專案零依賴、手刻 CSS transform/transition/animation 的風格)。
- 「點已揭曉的唱片重播」機制與對應的 `SpeakButton` 重播按鈕——本次改版直接拿掉,想重聽就重新拖拽或按 Enter。
