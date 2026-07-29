/**
 *  品牌配置集中维护在 config/brands.ts，本脚本只负责选择并注入到 Vite
 */
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';

import { brands } from '../../config/brands.js';

const keys = Object.keys(brands);

let brandKey = process.argv[2];

if (!brandKey) {
  console.log('\n◆ 请选择要启动的品牌：');
  keys.forEach((key, index) => {
    console.log(`  ${index + 1}. ${key} - ${brands[key].label}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question('请输入编号或品牌名称：');
  rl.close();

  brandKey = keys[Number(answer) - 1] ?? answer;
}

const brand = brands[brandKey];

if (!brand) {
  throw new Error(`✗ 未知品牌：${brandKey}`);
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

console.log(`\n✓ 已选择：${brand.label} (${brandKey})`);
console.log('→ 正在启动本地开发服务...\n');

// 将当前品牌信息注入子进程，Vite 会通过 import.meta.env 读取这些变量。
const child = spawn(command, ['dev'], {
  env: {
    ...process.env,
    VITE_BRAND: brandKey,
    VITE_APP_ID: brand.appId,
    VITE_API_BASE_URL: brand.apiBaseUrl,
  },
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
