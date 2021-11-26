/*
 * @Author: Lee
 * @Date: 2021-08-31 17:18:49
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-18 12:30:42
 */

/*
 * @Author: Li-HONGYAO
 * @Date: 2021-03-26 22:51:19
 * @LastEditTime: 2021-08-28 17:12:28
 * @LastEditors: Lee
 * @Description:
 * @FilePath: \vite-vue-template__H5\src\typings\index.d.ts
 */

import { AxiosRequestConfig } from "axios";
import { LazyExoticComponent } from "react";
export {};

// => axios 模块定义
declare module 'axios' {
  export interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>;
    request<T = any> (config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  }
}

// => 全局类型声明
declare global {
  interface Window {
    _hmt: any;
    wx: any;
    AlipayJSBridge: any;
    CONFIG_URL_FOR_IOS: string;
  }
  namespace GD {
    // 全局响应数据
    interface BaseResponse<T = any> {
      code: number;
      data: T;
      msg: string;
      page: {
        pageNo: number;
        pageSize: number;
        pages: number;
        total: number;
      };
    }
    // 路由配置属性
    interface RouteConfig {
      title?: string;
      path: string;
      component?: LazyExoticComponent<any>;
      auth?: boolean;
      redirect?: string;
    }
  }
}


