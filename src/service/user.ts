/*
 * @Author: Lee
 * @Date: 2023-04-27 15:27:53
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 15:28:14
 * @Description:
 */

import { http } from '@/utils/request';

export function login(code: string) {
  return http.post<any>('/api/user/login', {
    code,
  });
}
