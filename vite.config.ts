/*
 * @Author: Lee
 * @Date: 2023-04-27 10:54:26
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 16:11:05
 * @Description:
 */
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import urlToModule from 'rollup-plugin-import-meta-url-to-module';
import mockDevServerPlugin from 'vite-plugin-mock-dev-server';
import autoprefixer from 'autoprefixer';
import postCssPxToRem from 'postcss-pxtorem';
// https://vitejs.dev/config/
export default ({ mode }) => {
  // -- 获取环境变量
  const env = loadEnv(mode, process.cwd());
  // -- 返回配置信息
  return defineConfig({
    // 1.部署二级目录基础路径
    base: env.VITE_APP_BASE || '/',
    // 2.构建相关
    build: {
      outDir: env.VITE_OUT_DIR,
      chunkSizeWarningLimit: 1000,
    },
    // 3.别名解析
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    // 4. 服务器选项
    server: {
      port: 3000,
      host: '0.0.0.0',
      fs: {
        strict: false,
      },
      proxy: {
        '^/api': {
          target: 'http://example.com',
        },
      },
    },
    // 5. 插件相关
    plugins: [
      react(),
      // https://github.com/pengzhanbo/vite-plugin-mock-dev-server
      mockDevServerPlugin(),
      urlToModule(),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ],
    // 6. 样式相关
    css: {
      postcss: {
        plugins: [
          postCssPxToRem({
            rootValue: 37.5,
            propList: ['*'],
            selectorBlackList: ['.norem'],
          }),
          autoprefixer({
            overrideBrowserslist: [
              'Android 4.1',
              'iOS 7.1',
              'Chrome > 31',
              'ff > 31',
              'ie >= 8',
            ],
          }),
        ],
      },
    },
  });
};
