/*
 * @Author: Lee
 * @Date: 2021-08-31 19:31:01
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-17 13:10:38
 */
import React from 'react';
import { useNavigate } from 'react-router';
import { useTitle } from 'lg-react-hooks';
const IndexPage: React.FC = (props) => {
  const navigate = useNavigate();
  document.title='首页'
  return (
    <div className='tab-page'>
      <div className='coming-soon'>Demo Example</div>
      <button
        className=' d-block mx-auto mt-20'
        onClick={() => {
          navigate('/auth/jump', { replace: true });
        }}
      >
        前往授权
      </button>
    </div>
  );
};

export default IndexPage;
