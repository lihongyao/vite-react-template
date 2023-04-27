/*
 * @Author: Lee
 * @Date: 2021-10-18 15:30:07
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-18 15:41:21
 */
import classNames from "lg-classnames";
import React, { CSSProperties, memo, useState } from "react";
import "./index.less";

interface IProps {
  text: string | number;
  icon?: any;
  style?: CSSProperties;
  className?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;

  onDisabled?: () => void /** 禁用状态时点击 */;
  onTap?: () => void /** 点击按钮 */;
}
const Button: React.FC<IProps> = ({
  text,
  icon,
  style = {},
  className = "",
  loading = false,
  loadingText = "正在处理",
  disabled = false,
  onDisabled,
  onTap,
}) => {
  // events
  const _onTap = () => {
    if (disabled) {
      if (onDisabled) onDisabled();
    } else {
      if (!loading && onTap) onTap();
    }
  };
  return (
    <div
      className={classNames([
        "lg-button",
        className,
        {
          disabled,
        },
      ])}
      style={{ ...style }}
      onClick={_onTap}
    >
      {loading ? (
        <>
          <img
            src={
              icon ||
              new URL("./images/loading.png", import.meta.url).toString()
            }
            className="lg-button__loading"
          />
          <span>{loadingText}</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
};

export default memo(Button);
