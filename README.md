# Vite React H5 Template

一个面向移动端 H5 的 React 项目模板，基于 Vite、TypeScript 和 Tailwind CSS。项目内置多环境构建、多语言路由、统一 API 请求层、全局状态、错误边界、通知组件，以及微信和 Telegram WebView 的基础适配能力。

## 技术栈

- React 19、React Router 8、TypeScript 6、Vite 8
- Tailwind CSS 4、SVGR
- i18next、react-i18next
- Zustand、Immer、持久化中间件
- Axios 统一请求层
- Oxlint、类型感知规则、Prettier、Husky、lint-staged

## 快速开始

```bash
pnpm install
pnpm dev
```

开发服务器默认运行在 [http://localhost:8888](http://localhost:8888)。如果端口已被占用，Vite 会自动选择其他端口。

常用命令：

| 命令                | 用途                         |
| ------------------- | ---------------------------- |
| `pnpm dev`          | 启动开发环境                 |
| `pnpm build:qa`     | 类型检查并构建 QA 版本       |
| `pnpm build:prod`   | 类型检查并构建生产版本       |
| `pnpm preview`      | 预览构建产物                 |
| `pnpm lint`         | 运行 Oxlint                  |
| `pnpm lint:ci`      | 将所有 lint warning 视为失败 |
| `pnpm lint:fix`     | 自动修复可修复的 lint 问题   |
| `pnpm format`       | 使用 Prettier 格式化项目     |
| `pnpm format:check` | 检查代码格式                 |
| `pnpm i18n`         | 从 Excel 生成多语言 JSON     |
| `pnpm i18n:lark`    | 运行飞书多语言同步脚本       |

## 目录结构

```text
src/
├── api/                  # 请求客户端、鉴权会话、错误归一化和业务接口
├── assets/               # 参与构建的图片与 SVG
├── components/
│   ├── features/         # 带业务或应用语义的组件
│   └── ui/               # 通用 UI 组件
├── constants/            # 全局常量
├── i18n/                 # 语言资源、路由本地化和导航工具
├── layout/               # 页面公共布局
├── libs/                 # 设备判断、样式工具和可选平台适配代码
├── pages/                # 路由页面
├── routes/               # React Router 配置
├── store/                # Zustand 全局状态
├── types/                # 全局类型声明
├── index.css             # Tailwind 入口和全局样式
└── main.tsx              # 应用启动入口

scripts/                  # Excel、飞书等工程脚本
public/                   # 不参与构建处理的静态资源
```

项目使用 `@/*` 映射到 `src/*`。页面组件放在 `pages`，跨页面业务组件放在 `components/features`，可复用的纯 UI 放在 `components/ui`。

## 应用启动流程

`main.tsx` 负责初始化调试工具、App Scheme、i18next 和 Router，并按以下层级挂载应用：

```text
AppErrorBoundary
└── I18nextProvider
    └── NotificationProvider
        └── MessageProvider
            └── DialogProvider
                ├── ApiErrorReporter
                └── AppEnvGuard
                    └── TelegramAuthBootstrap
                        └── AppRoutes
```

- `AppErrorBoundary` 提供应用级异常兜底。
- `NotificationProvider`、`MessageProvider` 和 `DialogProvider` 提供全局反馈能力。
- `ApiErrorReporter` 将 API 层抛出的非 401 错误接入 notification 或 Dialog Tips。
- `AppEnvGuard` 根据 `VITE_APP_SOURCE` 限制微信或 Telegram 运行环境。
- `TelegramAuthBootstrap` 在 Telegram Mini App 中读取 `initData` 并完成登录初始化。
- 非生产环境会启用 vConsole，方便移动端调试。

## 路由与国际化

路由统一定义在 `src/routes/index.tsx`，并由语言前缀驱动。目前支持：

| 语言               | URL 前缀 |
| ------------------ | -------- |
| English (`en-US`)  | 无前缀   |
| 简体中文 (`zh-CN`) | `/zh`    |
| Español (`es`)     | `/es`    |
| Português (`pt`)   | `/pt`    |

语言配置位于 `src/i18n/config.ts`，翻译资源位于 `src/i18n/locales`。每种语言共享同一组页面路由，整体结构如下：

```text
LocaleLayout                    # 切换语言、提供页面转场容器
├── RootLayout                  # Tab 页面公共布局
│   ├── TabTransitionOutlet     # 渲染当前 Tab 页面
│   └── AppTabBar               # 底部导航栏
├── apply                       # 普通二级页，不显示 TabBar
├── goods/:id                   # 带动态参数的普通二级页
└── *                           # 404 页面
```

Tab 页面使用 `transitionSurface: 'tab'`，切换时不产生页面入栈效果；普通二级页使用 `transitionSurface: 'stack'`，按页面栈方式转场。

### 添加普通页面

1. 在 `src/pages/<PageName>/index.tsx` 创建并默认导出页面组件。
2. 在 `src/routes/index.tsx` 引入页面，并将路由添加到对应的 `children` 中。
3. 非首屏页面可以通过 `lazy` 按需加载；使用 `lazy` 时，页面会由现有转场出口内的 `Suspense` 处理加载状态。

### 添加 Tab 页

Tab 页会显示底部导航栏，需要同时修改路由和 TabBar：

1. 将页面路由加入 `createPageRoutes()`，并设置 `handle: tabTransitionHandle`。
2. 在 `src/components/features/AppTabBar/index.tsx` 的 `paths` 中添加对应的路径、标题和图标。
3. TabBar 使用 `LocalizedNavLink`，路由路径和 `paths` 中的路径都写不带语言前缀的应用内绝对路径。

```tsx
// src/routes/index.tsx
{ path: 'orders', element: <Orders />, handle: tabTransitionHandle }

// src/components/features/AppTabBar/index.tsx
{ path: '/orders', text: 'Orders', icon: OrdersIcon }
```

首页是 `createPageRoutes()` 中的 `index: true` 路由，对应 TabBar 的 `/`。

### 添加普通二级页

普通二级页不应放入 `RootLayout`，而应作为它的同级路由直接添加到 `LocaleLayout` 的 `children`，这样页面不会显示底部 TabBar：

```tsx
{
  path: 'orders/:id',
  element: <OrderDetail />,
  handle: stackTransitionHandle,
}
```

页面可以通过 `useParams()` 读取动态参数，并使用 `SecondaryHeader` 提供统一的返回栏。若页面需要从任意入口打开，使用 `LocalizedLink` 或 `useLocalizedNavigate`：

```tsx
<LocalizedLink to={`/orders/${order.id}`}>查看订单</LocalizedLink>;

const navigate = useLocalizedNavigate();
navigate(`/orders/${order.id}`);
```

站内跳转应优先使用 `LocalizedLink`、`LocalizedNavLink` 和 `useLocalizedNavigate`，避免丢失当前语言前缀。只有返回上一页这类历史记录操作需要直接使用 React Router 的 `navigate(-1)`。

## API 与状态管理

`src/api/client.ts` 封装了 Axios，并统一处理：

- API Base URL、超时和公共请求上下文
- Token 注入与未授权会话失效
- `{ code, data, message }` 业务响应解包
- 网络错误和业务错误归一化
- 非 401 API 错误的全局展示分发
- Blob 文件下载与文件名解析

业务接口按领域放在 `src/api/modules`，再由 `src/api/index.ts` 统一导出。全局客户端状态使用 Zustand，示例 Store 已集成 Immer 和本地持久化。

### 业务接口类型组织

业务接口类型按模块维护，不集中堆到 `src/api/types.ts`。`src/api/types.ts` 只放请求层通用类型，例如 `ApiResponse`、`ApiRequestConfig`、分页结构等。

推荐每个业务模块使用目录结构：

```text
src/api/modules/product/
├── index.ts      # 接口函数
└── types.ts      # Product 模型、ProductListReq、ProductListRes 等业务类型
```

命名建议：

- 实体模型使用业务名：`Product`、`User`、`Order`。
- 请求/响应类型带接口动作：`ProductListReq`、`ProductListRes`、`ProductDetailReq`、`ProductDetailRes`。
- `Res` 表示 `request()` 解包后的真实业务数据，不包含 `{ code, data, message }` 外壳。

示例：

```ts
// src/api/modules/product/types.ts
export interface ProductListReq {
  limit?: number;
  select?: string;
  skip?: number;
}

export interface ProductListRes {
  limit: number;
  products: Product[];
  skip: number;
  total: number;
}
```

```ts
// src/api/modules/product/index.ts
export function list(params?: ProductListReq, signal?: AbortSignal) {
  return request<ProductListRes>({
    params,
    url: PRODUCT_API_URL,
  });
}
```

### API 错误展示约定

普通业务接口默认返回 `{ code, data, message }`。当 `code !== 200` 时，请求层会抛出 `ApiError`，并在继续向调用方 `throw` 之前触发全局错误展示。401 仍由 `authSession.expire()` 处理，不走普通 notification。

默认展示规则：

- 有业务错误码时，优先查找 `message.error_${code}`。
- 展示内容保留错误码，格式为 `[code] - translated message`。
- 如果没有业务错误码，则使用 HTTP 状态码或 `UNKNOWN` 作为展示码。
- 网络失败、超时和未知错误使用 `message.error_network`、`message.error_timeout`、`message.error_unknown` 兜底。

例如后端返回：

```json
{
  "code": 1201,
  "data": null,
  "message": "Login failed"
}
```

如果语言文件中存在：

```json
{
  "message": {
    "error_1201": "Login failed. Please try again later."
  }
}
```

则 notification 内容为：

```text
[1201] - Login failed. Please try again later.
```

带变量的错误码优先要求后端 `data` 字段和翻译变量名保持一致：

```json
{
  "code": 1203,
  "data": {
    "time": 10
  },
  "message": "Please wait"
}
```

```json
{
  "message": {
    "error_1203": "Please wait {{time}} minutes before trying again."
  }
}
```

如果历史接口字段名无法对齐，或需要把秒转换成分钟等格式化逻辑，在 `src/components/features/ApiErrorReporter/error-rules.ts` 的 `ERROR_MESSAGE_VALUE_RESOLVERS` 中为对应错误码补 resolver。

少数错误码需要用户确认、跳转或执行后续动作时，在 `ERROR_TIPS_RULES` 中配置为 Dialog Tips；其他错误码保持默认 notification 即可。

调用方需要完全自己处理错误时，在请求配置中传 `errorHandling: 'manual'`。此时请求仍会抛出 `ApiError`，但不会触发全局 notification/Tips：

```ts
await request<LoginResult, LoginParams>({
  data,
  errorHandling: 'manual',
  method: 'POST',
  url: '/api/login',
});
```

## 环境变量

项目分别使用 `.env.development`、`.env.qa` 和 `.env.production`：

| 变量                    | 说明                                          |
| ----------------------- | --------------------------------------------- |
| `VITE_APP_ENV`          | 当前环境：`development`、`qa` 或 `production` |
| `VITE_APP_HOST`         | 当前部署地址                                  |
| `VITE_API_BASE_URL`     | API 基础地址                                  |
| `VITE_APP_APPID_WEIXIN` | 微信 App ID                                   |
| `VITE_APP_APPID_ALIPAY` | 支付宝 App ID                                 |
| `VITE_APP_BASE`         | 二级目录部署前缀，可选                        |
| `VITE_OUT_DIR`          | 构建输出目录，可选                            |
| `VITE_APP_SOURCE`       | 运行来源：`universal`、`wechat` 或 `telegram` |

环境变量类型统一维护在 `src/vite-env.d.ts`。新增变量时，应同时更新对应环境文件和类型声明。

## 代码质量

提交前 Husky 会运行 lint-staged，对代码执行 Oxlint 自动修复和 Prettier 格式化。CI 建议执行：

```bash
pnpm lint:ci
pnpm format:check
pnpm build:prod
```

`src/libs/LibForAli.ts`、`src/libs/LibForWeixin.ts` 和 `src/libs/rem.ts` 是预留的平台及 REM 适配入口，可在对应 H5 场景启用或继续扩展。
