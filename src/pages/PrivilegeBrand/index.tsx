/*
 * @Author: Lee
 * @Date: 2021-09-04 14:21:34
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 16:31:17
 */
import React from 'react';
import { Link } from 'react-router-dom';
import './index.less';
const PrivilegeBrand: React.FC = () => {
  document.title = '权益';
  return (
    <div className='tab-page'>
      <div className='coming-soon'>Demo Example</div>
      <div className='text-center f20 mt-20'>
        <Link to='/details'>Go Details</Link>
      </div>
    </div>
  );
};

export default PrivilegeBrand;
