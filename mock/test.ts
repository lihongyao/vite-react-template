/*
 * @Author: Lee
 * @Date: 2021-08-31 17:23:49
 * @LastEditors: Lee
 * @LastEditTime: 2021-08-31 17:25:09
 */
export default [
  {
    url: "/api-dev/users",
    method: "get",
    response: (req) => {
      return {
        code: 0,
        data: {
          name: "Li-HONGYAO",
          phone: "173 **** 8669",
          address: "成都市高新区雅和南四路216号",
        },
        msg: "success",
      };
    },
  },
];
