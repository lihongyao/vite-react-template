
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import { Toast } from 'antd-mobile';

// 1. 基础类型定义
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

interface TokenData {
  token: string;
  refreshToken: string;
}

// 2. 全局变量（用于控制刷新 token 状态）
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];



// 3. 创建实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  timeout: 60000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 4. Token 操作工具函数
const getToken = (): TokenData | null => {
  const token = localStorage.getItem('AUTHORIZATION_TOKEN');
  return token ? JSON.parse(token) : null;
};

const setToken = (tokenData: TokenData): void => {
  localStorage.setItem('AUTHORIZATION_TOKEN', JSON.stringify(tokenData));
};

const clearToken = (): void => {
  localStorage.removeItem('AUTHORIZATION_TOKEN');
};


// 5. 刷新 Token 逻辑
const refreshToken = async (): Promise<string> => {
  try {
    const currentToken = getToken();
    if (!currentToken?.refreshToken) {
      throw new Error('No refresh token available');
    }
    // TODO: 替换为实际的刷新 token 接口
    // 例如：/api/token/refresh
    const response = await axios.post(`${import.meta.env.VITE_API_HOST}/v1/token/refresh`, {
      refreshToken: currentToken.refreshToken
    });
    const newToken = response.data.data.token as TokenData;
    setToken(newToken);
    return newToken.token;
  } catch (error) {
    clearToken();
    throw error;
  }
};


// 6. 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    // -- GET请求拼接随机值
    if (/GET/i.test(config.method ?? '')) {
      const t = Math.random().toString(36).slice(2, 9);
      config.params = { ...config.params, t };
    }

    // -- 拼接token
    const token = localStorage.getItem('AUTHORIZATION_TOKEN') ?? '';
    const whiteList = ['/api/login'];

    if (token && !whiteList.some((path) => config.url?.startsWith(path))) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);


// 7. 响应拦截器
instance.interceptors.response.use(
  (response) => {

    // 处理流数据
    if (response.request.responseType === 'blob') {
      return { code: 200, data: response.data, msg: 'success' };
    }

    // 业务错误处理
    const { code, msg } = response.data as unknown as ApiResponse;


    // -- 刷新 token
    if (code === 10002) {
      const originalRequest = response.config;
      if (!isRefreshing) {
        isRefreshing = true;
        refreshToken()
          .then(newToken => {
            // 处理挂起的请求
            refreshSubscribers.forEach(cb => cb(newToken));
            refreshSubscribers = [];
            // 重试原始请求
            originalRequest.headers.Authorization = newToken;
            return instance(originalRequest);
          })
          .catch(err => {
            // 刷新失败处理
            Toast.show({
              content: '登录已过期，请重新登录',
              afterClose: () => {
                window.location.href = `${import.meta.env.VITE_BASE.slice(0, -1)}/login`;
              },
            });
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      // 返回一个未解决的Promise，等待token刷新后重试
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          originalRequest.headers.Authorization = newToken;
          resolve(instance(originalRequest));
        });
      });
    }

    // -- 重新登录
    if (code === 401) {
      Toast.show({
        content: msg,
        afterClose() {
          window.location.href = import.meta.env.VITE_BASE.slice(0, -1) + '/login';
        },
      })
    }
    return response.data;
  },
  (error: AxiosError) => {
    console.log('[request error] > ', error);
    return { code: 0, msg: error.message, data: null };
  },
);

// 8. 统一的 request 方法
const request = <R = any>(
  options: AxiosRequestConfig,
): Promise<ApiResponse<R>> => {
  return instance(options);
};


export default request;
