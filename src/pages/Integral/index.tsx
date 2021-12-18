/*
 * @Author: Lee
 * @Date: 2021-09-04 14:21:21
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-18 22:40:14
 */

import Loading from '@/components/@lgs-react/Loading';
import React from 'react';
import './index.less';
const Integral: React.FC = () => {
  document.title='攒积分';
  return (
    <div className='tab-page'>
      <div className='coming-soon'>Demo Example</div>
      <Loading tips='加载中' color='blue'/>
    </div>
  );
};

export default Integral;
