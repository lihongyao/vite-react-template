import type { UserConfig, ConfigEnv } from 'vite';
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react'
import viteCompression from "vite-plugin-compression";
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from "rollup-plugin-visualizer";
import { viteMockServe } from 'vite-plugin-mock'
import px2vw from 'postcss-px-to-viewport-8-plugin'
import autoprefixer from 'autoprefixer'
// https://cn.vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {

  // -- 获取当前工作目录路径
  const root = process.cwd();
  const pathResolve = (path: string) => resolve(root, '.', path);
  // -- 获取环境变量
  const env = loadEnv(mode, root, "VITE_");
  console.log(env);
  return {
    resolve: {
      alias: {
        "@": pathResolve('src'),
      },
    },
    plugins: [
      react(),
      viteCompression({
        deleteOriginFile: false
      }),
      // @ts-ignore
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'stats.html',
      }),
      viteMockServe({
        mockPath: 'mock',
        enable: true,
        logger: true,
      }),

    ],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://0.0.0.0:5173',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: ['last 2 versions', 'iOS >= 10']
          }),
          px2vw({
            unitToConvert: 'px',
            viewportWidth: 375,
            unitPrecision: 5,
            propList: ['*'],
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false
          })
        ]
      }
    },
    build: {
      outDir: env.VITE_OUT_DIR,
      chunkSizeWarningLimit: 2000,
      reportCompressedSize: false
    },
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log']
    }
  };
});