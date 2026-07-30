import type { DeviceEnvironment } from '@/libs/device';

export interface AppInitializationContext {
  environment: DeviceEnvironment;
  signal: AbortSignal;
}

type AppInitializer = (context: AppInitializationContext) => Promise<unknown>;

const appInitializers: AppInitializer[] = [
  // 在这里加入依赖登录态的全局初始化任务，例如用户信息、远程配置等。
  // 任务默认并行执行；存在前后依赖的步骤应封装在同一个 initializer 内串行完成。

  // 任务1
  async () => {
    console.log('执行任务1');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },

  // 任务2
  async () => {
    console.log('执行任务2');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },
];

export async function initializeApp(context: AppInitializationContext) {
  if (context.signal.aborted) return;

  await Promise.all(appInitializers.map((initializer) => initializer(context)));
}
