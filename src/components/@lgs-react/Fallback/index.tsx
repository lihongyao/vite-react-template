/*
 * @Author: Lee
 * @Date: 2021-08-31 20:00:28
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-22 14:47:19
 */
import { Loading } from "antd-mobile";
import React from "react";
import "./index.less";
const Fallback = () => {
  return (
    <div className="page fallback">
      <Loading />
    </div>
  );
};

export default Fallback();
