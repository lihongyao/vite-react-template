/*
 * @Author: Lee
 * @Date: 2023-04-27 10:54:26
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 14:48:36
 * @Description:
 */

import React, { CSSProperties } from 'react';
import NotEnv from './components/@lgs-react/NotEnv';
import Tools from 'lg-tools';

/**
 * 错误边界
 */
const errorStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '12px',
  letterSpacing: '2px',
  paddingTop: '100px',
};
export class ErrorBoundary extends React.Component<
  { children?: JSX.Element },
  { hasError: boolean }
> {
  constructor(props: { children?: JSX.Element }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // 捕获错误信息
    console.log(error, errorInfo);
  }
  render() {
    // 渲染错误视图
    if (this.state.hasError) {
      return <h1 style={errorStyles}>Something went wrong.</h1>;
    }
    // 渲染正确视图
    return this.props.children;
  }
}

/**
 * 环境判断
 * 如果 VITE_APP_SOURCE === 'mp'，即表示公众号/生活号
 * 那么在浏览器环境将提示 “请在微信或支付宝客户端打开链接”
 * @param param0
 * @returns
 */
export const GuardEnv: React.FC<{ children?: JSX.Element }> = ({
  children,
}) => {
  return import.meta.env.VITE_APP_SOURCE === 'mp' &&
    ['weixin', 'alipay'].indexOf(Tools.getEnv()) === -1 ? (
    <NotEnv />
  ) : (
    <>{children}</>
  );
};
