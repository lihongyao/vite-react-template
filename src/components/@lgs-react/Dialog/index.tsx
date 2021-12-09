/*
 * @Author: Lee
 * @Date: 2021-10-18 15:30:07
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-21 11:19:44
 */
import classNames from "lg-classnames";
import React, { CSSProperties, FC, memo, useEffect, useRef } from "react";
import "./index.less";
interface IProps {
  visible: boolean /** 切换显示 */;
  children: JSX.Element | JSX.Element[] /** 子元素 */;
  closeable?: boolean /** 是否显示关闭按钮 */;
  closeButtonPosition?: "default" | "bottom" /** 关闭按钮位置 */;
  closeOnClickOverlay?: boolean /** 是否允许点击遮罩关闭视图 */;
  customStyle?: CSSProperties;
  onClose: () => void;
}

const Dialog: FC<IProps> = ({
  visible,
  children,
  closeable = true,
  closeButtonPosition = "default",
  closeOnClickOverlay = true,
  customStyle = {},
  onClose,
}) => {
  const lgWrapper = useRef<HTMLDivElement | null>(null);

  // events
  const onTap = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = event.target as HTMLDivElement;
    if (closeOnClickOverlay && target.classList.contains("lg-dialog")) {
      onClose();
    }
  };
  // effects
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "auto";
  }, [visible]);
  // render
  return (
    <div
      ref={lgWrapper}
      className={`lg-dialog ${visible ? "visible" : ""}`}
      onClick={onTap}
    >
      <div className="lg-dialog__content" style={{ ...customStyle }}>
        {children}
        {closeable && (
          <img
            src={new URL("./images/icon-close.png", import.meta.url).toString()}
            className={classNames([
              "lg-dialog__close",
              {
                bottom: closeButtonPosition === "bottom",
              },
            ])}
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default memo(Dialog);
