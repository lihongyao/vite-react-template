import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import vconsole from "vconsole";
import Schemes from "@likg/schemes";
import AppRoutes from "./routes/index.tsx";
import { GuardEnv } from "./App.tsx";
import ErrorFallback from "./components/@lgs-react/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";

// 1. 开发环境 & 测试环境 启用vconsole --- Tips：目前启用vconsole打包会出现异常
if (import.meta.env.VITE_ENV !== "prod") {
  new vconsole();
}

// 2. 记录出入进入程序时的url地址（用于配置iOS js-sdk）
window.CONFIG_URL_FOR_IOS = window.location.href;

// 3. Schemes地址（APP嵌套H5模式）
Schemes.config("xxx://www.xxx.com");

// 4. 渲染视图
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <GuardEnv>
        <AppRoutes />
      </GuardEnv>
    </ErrorBoundary>
  </StrictMode>
);

// 5. antd-mobile 兼容 React 19.x
import { unstableSetRender } from "antd-mobile"; // Support since version ^5.40.0
unstableSetRender((node, container) => {
  // @ts-ignore
  container._reactRoot ||= createRoot(container);
  // @ts-ignore
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});
