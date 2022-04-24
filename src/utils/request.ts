/*
 * @Author: Lee
 * @Date: 2021-08-31 17:34:21
 * @LastEditors: Lee
 * @LastEditTime: 2022-04-24 18:14:29
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookie from 'lg-cookie';
import Tools from 'lg-tools';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_HOST,
  timeout: 20000,
});

// 请求拦截
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // => 如果是GET请求追加时间戳
    if (config.method && /get/i.test(config.method)) {
      config.params = {
        ...config.params,
        timeState: Tools.randomCharacters(1) + Date.now(),
      };
    }
    // => 配置请求头
    const token = Cookie.get<string>('AUTHORIZATION_TOKEN');
    config.headers = {
      'Content-Type': 'application/json',
      Authorization: Cookie.get<string>('AUTHORIZATION_TOKEN'),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg } = response.data;
    switch (code) {
      case 0:
        return response.data;
      case -10:
        // token过期
        /*
        // -- 二级目录
        const base = import.meta.env.VITE_APP_BASE;
        const url = base ? base + 'login' : "/login"*/
        history.replace('/login');
        history.go(0);
        return response.data;
      default:
        console.log(msg);
        return response.data;
    }
  },
  (error: any) => {
    console.log(error);
    /timeout/.test(error.message) && console.log('请求超时，请检查网络');
    return Promise.reject(error);
  }
);

export default service;
