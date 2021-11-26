/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-08 09:11:40
 */
import { defineConfig } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import reactRefresh from '@vitejs/plugin-react-refresh';
import urlToModule from 'rollup-plugin-import-meta-url-to-module';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'react-app',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [reactRefresh(), viteMockServe({}), urlToModule()],
});
