/*
 * @Author: Lee
 * @Date: 2021-11-09 15:43:30
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-24 16:12:15
 */

import React, {
  useState, 
  useRef,
  useEffect,
  memo,
  useImperativeHandle,
} from 'react';

// better-scroll 2.x
import BScroll from '@better-scroll/core';
import Pullup from '@better-scroll/pull-up';
import PullDown from '@better-scroll/pull-down';
BScroll.use(Pullup).use(PullDown); // register Pullup & PullDown

// styles
import './index.less';
// libs
import classNames from 'lg-classnames';

interface IProps {
  // properties
  children: any;
  hasMore?: boolean;
  // events
  onRefresh?: () => void;
  onLoad?: () => void;
  onScroll?: (offset: { x: number; y: number }) => void;
}
export interface IScrollRefs {
  finishRefresh: () => void /** 下拉刷新结束回调 */;
  finishLoad: () => void /** 上拉加载结束回调 */;
  scrollTo: (x: number, y: number, time?: number) => void /**滚动到指定位置 */;
}

const Scroll = React.forwardRef<IScrollRefs, IProps>(
  ({ children, hasMore, onRefresh, onLoad, onScroll }, refs) => {
    // state
    const [bs, setBS] = useState<BScroll | null>(null);
    const [flag, setFlag] = useState(false);
    const [refreshStatusText, setRefreshStatusText] = useState('下拉刷新');
    // refs
    const ref = useRef<HTMLDivElement | null>(null);

    // effects
    // 初始化scroll对象
    useEffect(() => {
      const node = ref.current;
      if (node) {
        setBS(
          new BScroll(node, {
            scrollY: true,
            probeType: 3, // 实时派发scroll事件
            bounceTime: 800,
            pullUpLoad: true,
            pullDownRefresh: onRefresh
              ? {
                  threshold: 70,
                  stop: 60,
                }
              : undefined,
            click: true,
          })
        );
      }
      return () => {
        bs?.destroy();
        setBS(null);
      };
    }, []);

    // ==> 滚动
    useEffect(() => {
      if (!bs || !onScroll) return;
      bs.on('scroll', onScroll);
      return () => {
        bs.off('scroll', onScroll);
      };
    }, [bs, onScroll]);
    // ==> 上拉加载更多
    useEffect(() => {
      if (!bs || !onLoad || !hasMore) return;
      bs.on('pullingUp', onLoad);
      return () => {
        bs.off('pullingUp', onLoad);
      };
    }, [bs, onLoad]);
    // ==> 下拉刷新
    useEffect(() => {
      if (!bs || !onRefresh) return;
      // default -> moving -> fetching
      // 事件处理函数
      const onPullingDown = () => {
        setRefreshStatusText('正在刷新...');
        onRefresh();
      };
      const onEnterThreshold = () => setRefreshStatusText('下拉刷新');
      const onLeaveThreshold = () => setRefreshStatusText('松手立即刷新');
      // 注册事件
      bs.on('pullingDown', onPullingDown);
      bs.on('enterThreshold', onEnterThreshold);
      bs.on('leaveThreshold', onLeaveThreshold);
      return () => {
        // 移除事件
        bs.off('pullingDown', onPullingDown);
        bs.off('enterThreshold', onEnterThreshold);
        bs.off('leaveThreshold', onLeaveThreshold);
      };
    }, [bs, onRefresh]);

    // ==> 监听子元素如果发生了变化则刷新Scroll组件
    useEffect(() => {
      bs?.refresh();
    }, [children]);
    // ==> useImperativeHandle
    useImperativeHandle(
      refs,
      () => ({
        finishRefresh: () => {
          setRefreshStatusText('刷新完成');
          setFlag(true);
          setTimeout(() => {
            bs?.finishPullDown();
          }, 500);
        },
        finishLoad: () => {
          bs?.finishPullUp();
        },
        scrollTo: (x: number, y: number, time?: number) => {
          bs?.scrollTo(x, y, time);
        },
      }),
      [bs]
    );
    // ==> renders
    return (
      <div className='lg-scroll' ref={ref}>
        <div className='lg-scroll__content'>
          {/* 下拉刷新 */}
          {onRefresh && (
            <div className='lg-scroll__refresh'>{refreshStatusText}</div>
          )}
          {/* 滚动内容 */}
          {children}
          {/* 上拉加载 */}
          {onLoad && (
            <div className={classNames(['lg-scroll__load', { visible: flag }])}>
              <span className='lg-scroll__load_tips'>
                {hasMore ? '数据加载中...' : '没有更多啦~'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default memo(Scroll);
