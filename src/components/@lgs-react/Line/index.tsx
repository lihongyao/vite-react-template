/*
 * @Author: Lee
 * @Date: 2021-10-18 15:30:08
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-20 18:49:43
 */
import React, { FC, memo } from "react";

interface IProps {
  color?: string;
  height?: string | number;
  className?: string;
}
const Line: FC<IProps> = ({
  height = "1px",
  color = "#F7F7F7",
  className = "",
}) => {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height,
        backgroundColor: color,
      }}
    />
  );
};

export default memo(Line);
