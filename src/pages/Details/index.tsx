/*
 * @Author: Lee
 * @Date: 2021-11-12 14:06:07
 * @LastEditors: Lee
 * @LastEditTime: 2022-02-23 17:48:07
 */
import React from 'react';
import { Link } from 'react-router-dom';
const Details: React.FC = () => {
  return (
    <div className='page'>
      <div className='coming-soon'>Demo Example</div>
      <div className='text-center f20 mt-20'>
        <Link to='/'>Go Home</Link>
      </div>
    </div>
  );
};

export default Details;
