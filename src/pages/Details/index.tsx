/*
 * @Author: Lee
 * @Date: 2021-11-12 14:06:07
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-13 15:15:26
 */
import React from 'react';
import { Link } from 'react-router-dom';
const Details: React.FC = () => {
  return (
    <div className='page'>
      <div className='coming-soon'>Demo Example</div>
      <div className='text-center f20 mt-20'>
        <Link to='/index'>Go Home</Link>
      </div>
    </div>
  );
};

export default Details;
