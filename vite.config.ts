import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this as a project site under /thai-travel-notes/;
  // Vercel (and other hosts that set the VERCEL env var) serve it from
  // the domain root, so the base path must differ between the two.
  base: process.env.VERCEL ? '/' : '/thai-travel-notes/',
  plugins: [react()],
  build: {
    // 沒設這個的話，CSS 壓縮器會把原始碼裡寫的 max-width: 850px 這種
    // 傳統寫法「優化」成 Media Queries Level 4 的 range 語法
    // （width<=850px）——親自建置後直接檢查 dist/ 產物才發現這件事，
    // 原始碼裡怎麼寫完全沒差，壓縮器會統一轉成新語法。range 語法要
    // Safari 16.4（2023-03）以後才支援，舊一點的 iPad 遇到會讓整個
    // media query 靜默失效，等於響應式版面完全沒生效。safari14 這個
    // target 會讓壓縮器改輸出舊語法的等價寫法。
    cssTarget: 'safari14',
    // 沒有對應的 JS 修法可以放這裡：這個專案用的是 Rolldown 版 Vite
    // （node_modules 裡有 @rolldown/*），檢查編譯後的產物發現 optional
    // chaining（?.）、nullish coalescing（??）、邏輯賦值運算子
    // （||=／&&=／??=）都原封不動輸出，試過設 build.target: 'safari14'
    // 完全沒有影響（改前改後編譯出來的檔案內容逐位元組相同）——這幾個
    // 語法背後的 Lightning CSS（處理上面的 cssTarget）是成熟的獨立
    // 工具，但 Rolldown 本身的 JS 語法降級目前顯然還沒做完整，不是這裡
    // 能設定繞過去的。這些語法只要 Safari 14（2020-09）就支援，門檻比
    // CSS 那個 16.4 低很多，也沒有實測證據顯示這是任何回報問題的成因，
    // 先記錄下來，不為此拉進 @vitejs/plugin-legacy 這種量級的相依套件。
  },
  test: {
    environment: 'node',
  },
})
