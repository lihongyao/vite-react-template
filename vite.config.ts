import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, loadEnv } from 'vite';

// import svgr from 'vite-plugin-svgr';

// https://cn.vitejs.dev/config/
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  // -- 获取当前工作目录路径
  const root = process.cwd();
  const pathResolve = (path: string) => resolve(root, '.', path);
  // -- 获取环境变量
  const env = loadEnv(mode, root, 'VITE_');
  console.log(env);
  return {
    resolve: {
      alias: {
        '@': pathResolve('src'),
      },
    },
    plugins: [
      react(),
      // tailwindcss
      tailwindcss(),
      // code inspector
      command === 'serve' &&
        codeInspectorPlugin({
          bundler: 'vite',
        }),
      // svgr
      // svgr({
      //   svgrOptions: {
      //     dimensions: false,
      //     plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
      //     svgoConfig: {
      //       plugins: [
      //         {
      //           name: 'preset-default',
      //           params: {
      //             overrides: {
      //               convertColors: { currentColor: true },
      //               removeViewBox: false,
      //             },
      //           },
      //         },
      //         'prefixIds',
      //       ],
      //     },
      //   },
      // }),
    ],
    server: {
      host: '0.0.0.0',
      port: 8888,
      strictPort: false,
      open: true,
      cors: true,
      allowedHosts: ['heritage-grey-industries-selecting.trycloudflare.com'],
      // proxy: {
      //   // 代理规则：将所有以 /v1 开头的请求转发到目标服务器
      //   '/v1': {
      //     target: 'http://106.53.69.189', // 后端服务器地址
      //     changeOrigin: true, // 修改请求头中的 Origin 为目标服务器地址
      //     secure: false, // 如果是https接口，需要配置为false
      //     rewrite: (path) => path.replace(/^\/v1/, ''), // 可选：移除路径前缀
      //   },
      // },
    },
    build: {
      outDir: env.VITE_OUT_DIR || 'dist',
      // 大型项目可关闭压缩体积报告，以缩短构建时间
      reportCompressedSize: false,
    },
  };
});
