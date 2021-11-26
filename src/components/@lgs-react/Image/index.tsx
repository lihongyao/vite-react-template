/*
 * @Author: Lee
 * @Date: 2021-10-18 15:30:07
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-20 14:40:43
 */
import classNames from "lg-classnames";
import React, { memo, useState, useEffect, CSSProperties, useRef } from "react";
import "./index.less";

interface IProps {
  src: string /** 图片地址 */;
  defaultImage?: any /** 默认显示 */;
  alt?: string /** 图片描述 */;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  round?: boolean;
  className?: string;
  onTap?: () => void /** 监听点击 */;
}
const _Image: React.FC<IProps> = ({
  className = "",
  src,
  defaultImage,
  alt,
  width = 45,
  height = 45,
  style = {},
  round,
  onTap,
}) => {
  const [innerSrc, setInnerSrc] = useState(defaultImage);
  // ref
  const imgRef = useRef<HTMLImageElement>(null);
  // effects
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      if (image.width > 1) {
        if (imgRef.current) {
          const s1 = image.width / parseFloat(width + "");
          const s2 = image.height / parseFloat(height + "");
          imgRef.current.style.height = s1 > s2 ? "100%" : "auto";
          imgRef.current.style.width = s1 > s2 ? "auto" : "100%";
          setInnerSrc(src);
        }
      }
    };
    image.src = src;
  }, [src]);

  return (
    <div
      className={classNames(["lg-img", className])}
      style={{
        width,
        height,
        borderRadius: round ? "50%" : 0,
        ...style,
      }}
    >
      <img
        ref={imgRef}
        src={innerSrc}
        alt={alt}
        onClick={() => {
          if (onTap) onTap();
        }}
      />
    </div>
  );
};

export default memo(_Image);
