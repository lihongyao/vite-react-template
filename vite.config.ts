/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-18 22:41:40
 */
import { defineConfig } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import reactRefresh from '@vitejs/plugin-react-refresh';
import urlToModule from 'rollup-plugin-import-meta-url-to-module';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'react-h5',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
  plugins: [
    reactRefresh(),
    viteMockServe({}),
    urlToModule(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
});
