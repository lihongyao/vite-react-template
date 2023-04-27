/*
 * @Author: Li-HONGYAO
 * @Date: 2021-02-25 11:03:02
 * @LastEditTime: 2021-02-25 11:32:04
 * @LastEditors: Li-HONGYAO
 * @Description:
 * @FilePath: /d-point-client/src/components/@lgs/SquareCode/index.tsx
 */

import classNames from 'lg-classnames';
import React, { FC, memo } from 'react';
import './index.less';

interface IProps {
  length: number;
  code: string;
  customCls?: string;
  onClick?: () => void;
}
const SquareCode: FC<IProps> = props => {
  // render
  return (
    <div
      className={classNames(['lg-square-code', props.customCls])}
      onClick={() => props.onClick && props.onClick()}
    >
      {new Array(props.length).fill(0).map((_, i) => (
        <section key={i} className="lg-square-code__item">
          {props.code.charAt(i)}
        </section>
      ))}
    </div>
  );
};

export default memo(SquareCode);
