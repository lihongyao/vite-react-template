/*
 * @Author: Lee
 * @Date: 2021-12-15 14:09:28
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-18 21:31:34
 */

import { DOWNLOAD_URL_FOR_Android, DOWNLOAD_URL_FOR_iOS } from '@/constants';
import classNames from 'lg-classnames';
import Tools from 'lg-tools';
import React, { useState } from 'react';
import './index.less';
const Download: React.FC = () => {
  // state
  const [showAni, setShowAni] = useState(false);
  // events
  const onDownload = () => {
    const env = Tools.getEnv();
    switch (env) {
      case 'weixin':
        setShowAni(true);
        setTimeout(() => {
          setShowAni(false);
        }, 1000);
        break;
      case 'android':
        window.location.href = DOWNLOAD_URL_FOR_Android;
        break;
      case 'ios':
        window.location.href = DOWNLOAD_URL_FOR_iOS;
        break;
      default:
    }
  };
  return (
    <div className='page download-app text-center color-FFFFFF pt-59 position-relative'>
      <img
        className={classNames([
          'open-tips',
          {
            show: Tools.getEnv() === 'weixin',
            ani: showAni,
          },
        ])}
        src='https://qn.d-dou.com/dcep/dbean/dd791bc81c0d451b9d3c4c37798094c98cxz7g.png'
      />
      <div className='f35 lh-49 '>趣味答题</div>
      <div className='f16 lh-22 mt-5'>好玩又轻松，不来试试吗？</div>
      <img
        className='phone mx-auto'
        src='https://qn.d-dou.com/dcep/dbean/601f63f091ab4a4b81afba59942de4f3piylc2.png'
      />
      <div className='box flex-v-start pt-30 w-100'>
        <div className=' flex-h-center'>
          <img
            className='icon-52x52 flex-shrink mr-7'
            src='https://qn.d-dou.com/dcep/dbean/09507a8db08d44beac6bf9425ecda7e9g9bwbv.png'
          />
          <div className='text-left' style={{ color: '#004CDB' }}>
            <div className='f20 f-800'>百万题王</div>
            <div className='f12 lh-17 mt-2'>丰富知识，福利多多</div>
          </div>
        </div>
        <img
          className='download-button mt-8'
          src='https://qn.d-dou.com/dcep/dbean/393d68175995409089f55a215e07871aosu5pl.png'
          onClick={onDownload}
        />
      </div>
    </div>
  );
};

export default Download;
