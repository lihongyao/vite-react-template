/*
 * @Author: Lee
 * @Date: 2021-10-19 13:41:59
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-19 13:57:29
 */
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import "./index.less";
interface IProps {
  children: JSX.Element | JSX.Element[];
}
const PullToRefresh: React.FC<IProps> = ({ children }) => {
  const [startPos, setStartPos] = useState(0);
  const [transitionHeight, setTransitionHeight] = useState(0);
  // refs
  const refresh = useRef<HTMLDivElement>(null);
  // events
  const onTouchStart = useCallback((e: TouchEvent) => {
    setStartPos(e.touches[0].pageY);
    if (refresh.current) {
      refresh.current.style.position = "relative";
      refresh.current.style.transition = "transform 0s";
    }
  }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    const transitionHeight = e.touches[0].pageY - startPos;
    console.log(transitionHeight);
    if (transitionHeight > 30) {
      if (refresh.current) {
        refresh.current.style.transform =
          "translateY(" + transitionHeight + "px)";
      }
    }
  }, []);
  const onTouchEnd = useCallback(() => {}, []);
  // effects
  useEffect(() => {
    if (refresh.current) {
      refresh.current.addEventListener("touchstart", onTouchStart, false);
    }
    return () =>
      refresh.current?.removeEventListener("touchstart", onTouchStart, false);
  }, []);
  useEffect(() => {
    if (refresh.current) {
      refresh.current.addEventListener("touchmove", onTouchMove, false);
    }
    return () =>
      refresh.current?.removeEventListener("touchmove", onTouchMove, false);
  }, []);
  useEffect(() => {
    if (refresh.current) {
      refresh.current.addEventListener("touchend", onTouchEnd, false);
    }
    return () =>
      refresh.current?.removeEventListener("touchend", onTouchEnd, false);
  }, []);
  return (
    <div className="lg-refresh" ref={refresh}>
      <div className="lg-refresh__box">456</div>
      {children}
    </div>
  );
};

export default memo(PullToRefresh);
