/*
 * @Author: Lee
 * @Date: 2021-10-18 15:30:08
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-10 09:39:19
 */
import React, { memo } from "react";
import "./index.less";

interface IProps {
  tips?: string;
}
const NoData: React.FC<IProps> = ({ tips }) => {
  return (
    <div className="lg-no-data">
      <img
        className="lg-no-data__img"
        src={new URL("./images/no-data__4.png", import.meta.url).toString()}
        alt=""
      />
      {tips && <p className="lg-no-data__tips">{tips}</p>}
    </div>
  );
};

export default memo(NoData);
