/*
 * @Author: Lee
 * @Date: 2021-09-02 16:41:41
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-12 16:36:56
 */
import React from 'react';
import './index.less';

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // 捕获错误信息
    // 你同样可以将错误日志上报给服务器
    // logErrorToMyService(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      // 渲染错误视图
      return <h1 className='err'>Something went wrong.</h1>;
    }
    // 渲染正确视图
    return this.props.children;
  }
}
export default ErrorBoundary;
