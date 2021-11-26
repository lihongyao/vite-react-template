/*
 * @Author: Lee
 * @Date: 2021-08-31 17:39:54
 * @LastEditors: Lee
 * @LastEditTime: 2021-08-31 17:42:37
 */

import request from "../utils/request";

/**
 * 获取用户信息
 * @returns
 */
export function users<T>() {
  return request.get<T>("/api-dev/users");
}
