import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this as a project site under /thai-travel-notes/;
  // Vercel (and other hosts that set the VERCEL env var) serve it from
  // the domain root, so the base path must differ between the two.
  base: process.env.VERCEL ? '/' : '/thai-travel-notes/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
