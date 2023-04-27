/*
 * @Author: Lee
 * @Date: 2023-04-27 11:26:23
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 13:51:25
 * @Description:
 */
import path from 'path';
import Mock from 'mockjs';
import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/users',
    method: 'GET',
    body: {
      code: 0,
      data: {
        name: 'Li-HONGYAO',
        phone: '173 **** 8669',
        address: '成都市高新区雅和南四路216号',
      },
      msg: 'success',
    },
  },
]);
