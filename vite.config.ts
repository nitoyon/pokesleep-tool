import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'
import path from 'path';

export default defineConfig({
  base: '/pokesleep-tool/',
  plugins: [eslint(), react()],
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
        apiSerialize: path.resolve(__dirname, 'api/serialize.html'),
        apiDeserialize: path.resolve(__dirname, 'api/deserialize.html'),
      },
      output: {
        manualChunks(id) {
          // Third-party libraries
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui';
            }
            if (id.includes('react') || id.includes('scheduler') ||
              id.includes('i18next') || id.includes('react-i18next')
            ) {
              return 'react';
            }
            return 'vendor';
          }

          if (id.includes('pokemon.json')) {
            return 'pokemon';
          }
          if (id.includes('field.json')) {
            return 'field';
          }
          if (id.includes('event.json')) {
            return 'event';
          }
          if (id.includes('news.json')) {
            return 'news';
          }
          if (id.includes('/src/i18n/') || id.includes('/src/i18n.ts')) {
            return 'i18n';
          }
          if (id.includes('PokemonIconData.ts')) {
            return 'pokemon-icon';
          }
          if (id.includes('ui/Resources')) {
            return 'svg-icon';
          }
          // Catch-all for any other data files
          if (id.includes('/src/data')) {
            return 'data';
          }

          // Utility modules
          if (id.includes('/src/util/')) {
            return 'util';
          }

          // Common UI components (Dialog, common, etc.)
          if (id.includes('/src/ui/')) {
            return 'ui';
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
