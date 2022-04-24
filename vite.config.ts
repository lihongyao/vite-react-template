/*
 * @Author: Lee
 * @Date: 2021-08-31 15:50:32
 * @LastEditors: Lee
 * @LastEditTime: 2022-04-24 10:20:48
 */
import { defineConfig, loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import reactRefresh from '@vitejs/plugin-react-refresh';
import urlToModule from 'rollup-plugin-import-meta-url-to-module';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // -- 获取环境变量
  const env = loadEnv(mode, process.cwd());
  // -- 返回配置信息
  return defineConfig({
    // 部署二级目录基础路径
    base: env.VITE_APP_BASE || '/',
    build: {
      outDir: env.VITE_OUT_DIR,
      chunkSizeWarningLimit: 1000,
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
};
