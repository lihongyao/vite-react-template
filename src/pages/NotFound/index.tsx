/*
 * @Author: Lee
 * @Date: 2021-09-01 09:26:43
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-12 11:34:01
 */
import React from 'react';
import { useNavigate } from 'react-router';
import './index.less';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='not-found'>
      <img
        src='https://img.meituan.net/csc/b8dc984b0f717bda7464e747b0fc909988525.png'
        alt='404 缺省图'
        className='not-found__img'
      />
      <div className='not-found__tips'>您所访问的页面不存在 ~</div>
      <div
        className='not-found__btn'
        onClick={() => navigate('/index', { replace: true })}
      >
        返回首页
      </div>
    </div>
  );
};
export default NotFound;
