/*
 * @Author: Lee
 * @Date: 2021-11-12 14:06:07
 * @LastEditors: Lee
 * @LastEditTime: 2023-04-27 15:59:25
 */

import { Link } from 'react-router-dom';

export function Component() {
  return (
    <div className='page'>
      <div className='coming-soon'>Demo Example</div>
      <div className='text-center f20 mt-20'>
        <Link to='/'>Go Home</Link>
      </div>
    </div>
  );
}
Component.displayName = 'Details';
