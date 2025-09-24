import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'
import path from 'path';

export default defineConfig({
  base: '/pokesleep-tool/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        reserchEn: path.resolve(__dirname, 'index.html'),
        reserchJa: path.resolve(__dirname, 'index.ja.html'),
        reserchKo: path.resolve(__dirname, 'index.ko.html'),
        reserchZhCn: path.resolve(__dirname, 'index.zh-cn.html'),
        reserchZhTw: path.resolve(__dirname, 'index.zh-tw.html'),
        ivEn: path.resolve(__dirname, 'iv/index.html'),
        ivJa: path.resolve(__dirname, 'iv/index.ja.html'),
        ivKo: path.resolve(__dirname, 'iv/index.ko.html'),
        ivZhCn: path.resolve(__dirname, 'iv/index.zh-cn.html'),
        ivZhTw: path.resolve(__dirname, 'iv/index.zh-tw.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui';
            }
            return 'react';
          }
          if (id.includes('/src/data') || id.includes('/src/i18n/') ||
            id.includes('PokemonIconData.ts')
          ) {
            return 'resource';
          }
          return undefined;
        }
      }
    },
  },
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude],
  },
})
