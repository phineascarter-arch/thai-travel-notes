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
  },
  test: {
    environment: 'node',
  },
})
