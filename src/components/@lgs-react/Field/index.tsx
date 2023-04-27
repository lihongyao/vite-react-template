/*
 * @Author: Lee
 * @Date: 2021-05-13 13:40:56
 * @LastEditors: Lee
 * @LastEditTime: 2021-10-20 18:56:45
 */
import React, { memo, FormEvent, CSSProperties } from "react";
import "./index.less";

interface IProps {
  value: string | number;
  placeHolder?: string;
  placeHolderColor?: string;
  maxLength?: number;

  type?: "text" | "password" | "number" | "tel";
  clear?: boolean;
  disabled?: boolean;

  underline?: boolean;
  underlineStyle?: CSSProperties;

  fieldStyle?: CSSProperties;
  controlStyle?: CSSProperties;

  fontSize?: string;
  color?: string;

  className?: string;
  bold?: boolean;
  rule?: RegExp;

  onChange: (value: string) => void;
}

const Field: React.FC<IProps> = ({
  value = "",
  placeHolder,
  placeHolderColor = "#DDDDDD",
  maxLength = Infinity,

  type = "text",
  clear = true,
  disabled = false,

  underline,
  underlineStyle,

  fieldStyle,
  controlStyle,

  fontSize = "14px",
  color = "#333333",


  className = "",  
  rule = new RegExp(""),
  
 
  onChange,
}) => {
  // events
  const _onChange = (event: FormEvent<HTMLInputElement>) => {
    event.persist();
    let value = event.currentTarget.value;
    rule.test(value) && onChange(value);
  };
  const _onClear = () => {
    onChange("");
  };

  return (
    <div className={`lg-field ${className}`} style={fieldStyle}>
      <input
        className="lg-field__control"
        placeholder={placeHolder}
        type={type}
        value={value}
        onChange={_onChange}
        maxLength={maxLength}
        disabled={disabled}
        style={{
          // @ts-ignore
          "--placeholder-color": placeHolderColor,
          "--size": fontSize,
          color,
          ...controlStyle,
        }}
      />
      {clear && !disabled && String(value).length > 0 && (
        <img
          className="lg-field__clear"
          src={new URL("./images/icon_clear.png", import.meta.url).toString()}
          onClick={_onClear}
          alt=""
        />
      )}
      <div>
        {underline && (
          <div className="lg-field__underline" style={underlineStyle}></div>
        )}
      </div>
    </div>
  );
};

export default memo(Field);
