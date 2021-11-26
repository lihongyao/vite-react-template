/*
 * @Author: Lee
 * @Date: 2021-10-25 16:29:06
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-10 17:18:36
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Scroll, { IScrollRefs } from '@/components/@lgs-react/Scroll';
import './indx.less';
import Loading2 from '@/components/@lgs-react/Loading2';

let page = 1;
export default () => {
  const scrollRef = useRef<IScrollRefs | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [list, setList] = useState<number[] | null>(null);

  const getData = (type: string) => {
    setTimeout(() => {
      if (type === 'refresh' || list === null) {
        setList([...new Array(20).fill(1)]);
        scrollRef.current?.finishRefresh();
      } else {
        setList([...list, ...new Array(20).fill(1)]);
        scrollRef.current?.finishLoad();
      }
      setHasMore(page <= 3);
    }, 1000);
  };
  // effects
  useEffect(() => {
    getData('refresh');
    return () => {
      page = 1;
    };
  }, []);
  // effects
  return (
    <div className='page h-100 '>
      <Scroll
        ref={scrollRef}
        hasMore={hasMore}
        onRefresh={() => {
          console.log('__refresh__');
          page = 1;
          getData('refresh');
        }}
        onLoad={() => {
          console.log('__load__');
          page++;
          getData('load');
        }}
      >
        <div className='cts mt-10'>
          {list ? (
            list.map((_, i) => (
              <div className='item' key={i}>
                {i}
              </div>
            ))
          ) : (
            <Loading2 />
          )}
        </div>
      </Scroll>
    </div>
  );
};
