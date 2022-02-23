/*
 * @Author: Lee
 * @Date: 2021-09-04 14:21:21
 * @LastEditors: Lee
 * @LastEditTime: 2022-02-23 17:50:27
 */

import Loading from '@/components/@lgs-react/Loading';
import React from 'react';
import { Button, Space } from 'antd-mobile';
import './index.less';
const Integral: React.FC = () => {
  document.title = '攒积分';
  return (
    <div className='tab-page'>
      <div className='coming-soon'>Demo Example</div>
      <Loading tips='加载中' color='blue' />
      <div className='flex-h-center px-10 mt-10'>
        <Space wrap>
          <Button color='primary'>Primary</Button>
          <Button color='success'>Success</Button>
          <Button color='danger'>Danger</Button>
        </Space>
      </div>
    </div>
  );
};

export default Integral;
