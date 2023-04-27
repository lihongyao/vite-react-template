/*
 * @Author: Lee
 * @Date: 2021-08-31 19:32:03
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-18 21:18:40
 */
import React from 'react';
import { Link } from 'react-router-dom';
import './index.less';
const Mine: React.FC = () => {
  document.title = '个人中心';
  return (
    <div className='page'>
      <div className='coming-soon'>Demo Example</div>
      <div className='text-center f20 mt-20'>
        <Link to='/download'>Go Download</Link>
      </div>
    </div>
  );
};

export default Mine;
