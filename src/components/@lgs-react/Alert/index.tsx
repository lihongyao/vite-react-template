/*
 * @Author: Lee
 * @Date: 2021-09-14 20:33:00
 * @LastEditors: Lee
 * @LastEditTime: 2021-09-14 21:24:58
 */
import classNames from 'lg-classnames';
import React, { FC } from 'react';
import ReactDom from 'react-dom';
import './index.less';

interface IOptions {
  title?: string /** 标题 */;
  message?: string /** 内容 */;
  align?: 'left' | 'center' | 'right' /** 内容对齐方式 */;
  showCancel?: boolean;
  sureButtonText?: string /** 确认按钮文案 */;
  cancelButtonText?: string /** 取消按钮文案 */;
  onSure?: () => void /** 用户点击确认 */;
  onCancel?: () => void /** 用户点击取消 */;
}
interface IProps {
  dom: Element;
  config: IOptions;
}
const Alert: FC<IProps> = props => {
  // props
  const {
    dom,
    config: {
      align = 'left',
      sureButtonText = '确定',
      cancelButtonText = '取消',
    },
  } = props;
  // events
  const onButtonTap = (type: 'cancel' | 'sure') => {
    ReactDom.unmountComponentAtNode(dom);
    switch (type) {
      case 'sure':
        if (props.config.onSure) props.config.onSure();
        break;
      case 'cancel':
        if (props.config.onCancel) props.config.onCancel();
        break;
      default:
    }
  };
  // render
  return (
    <div className="lg-alert__wrapper">
      <div
        className={classNames([
          'lg-alert__content',
          { 'no-message': !props.config.message },
        ])}
      >
        {/* 标题 */}
        {props.config.title && (
          <div className="lg-alert__title">{props.config.title}</div>
        )}
        {/* 信息 */}
        {props.config.message && (
          <div className={`lg-alert__message ${align}`}>
            {props.config.message}
          </div>
        )}
        {/* 按钮 */}
        <div
          className={classNames([
            'lg-alert__btns',
            { 'no-message': !props.config.message },
          ])}
        >
          {props.config.showCancel && (
            <>
              <section
                className="lg-alert__btn cancel"
                onClick={() => onButtonTap('cancel')}
              >
                {cancelButtonText}
              </section>
            </>
          )}
          <section
            className={classNames([
              'lg-alert__btn sure',
              {
                'no-cancel-btn': !props.config.showCancel,
              },
            ])}
            onClick={() => onButtonTap('sure')}
          >
            {sureButtonText}
          </section>
        </div>
      </div>
    </div>
  );
};

function info(options: IOptions | string) {
  // 1.判断数据类型
  if (typeof options === 'string') {
    options = { title: options };
  }
  // 2.构造容器
  let wrap = document.querySelector('.lg-alert');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.setAttribute('class', 'lg-alert');
    document.body.appendChild(wrap);
  }
  // 3.卸载组件
  ReactDom.unmountComponentAtNode(wrap);
  // 4.渲染组件
  ReactDom.render(<Alert dom={wrap} config={options} />, wrap);
}

export default {
  info,
};
