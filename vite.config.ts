import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pokesleep-tool/iv/',
  plugins: [react()],
  server: {
    open: true,
  },
})
