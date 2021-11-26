/*
 * @Author: Lee
 * @Date: 2021-09-14 13:58:38
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-21 11:05:14
 */
import classNames from "lg-classnames";
import React, { memo, CSSProperties, useEffect } from "react";
import "./index.less";
interface IProps {
  visible: boolean;
  round?: boolean;
  title?: string;
  closeable?: boolean;
  closeOnClickOverlay?: boolean;
  customStyle?: CSSProperties;
  customCls?: string;
  children?: JSX.Element | JSX.Element[];
  onClose: () => void;
}
const Popup: React.FC<IProps> = ({
  visible,
  children,
  round,
  title,
  closeable,
  customCls = "",
  customStyle = {},
  closeOnClickOverlay = true,
  onClose,
}) => {
  // events
  const onClickOverlay = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.persist();
    const target = event.target as HTMLDivElement;
    if (target.classList.contains("lg-popup")) {
      closeOnClickOverlay && onClose();
    }
  };
  // effects
  /** 阻止显示时页面可拖拽 */
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "scroll";
  }, [visible]);
  return (
    <div
      className={classNames(["lg-popup", customCls, { visible: !!visible }])}
      onClick={onClickOverlay}
    >
      <div
        className={classNames(["lg-popup__contents", { round: !!round }])}
        style={customStyle}
      >
        {title && <div className="lg-popup__title">{title}</div>}
        {closeable && (
          <img
            className="lg-popup__close"
            src={new URL("./images/icon_close.png", import.meta.url).toString()}
            alt="close-icon"
            onClick={onClose}
          />
        )}
        {children}
      </div>
    </div>
  );
};

export default memo(Popup);
