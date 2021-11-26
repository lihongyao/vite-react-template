import classNames from 'lg-classnames';
import React, { CSSProperties, memo, useEffect, useRef, useState } from 'react';
import './index.less';

export interface TabsItemProps {
  title: string;
  badge?: number | string;
  disabled?: boolean;
}

interface IProps {
  menus: TabsItemProps[] | string[] | any[] /** 菜单项 */;
  current: number /** 当前显示菜单 */;
  children?: JSX.Element | JSX.Element[] /** tabs children */;
  fixed?: boolean /** 是否固定在顶部，注意：该属性与sticky属性不能同时设置 */;
  bordered?: boolean /** 是否显示底部线条 */;
  sticky?: boolean /** 是否吸顶 */;
  cursor?: boolean /** 是否显示游标 */;

  itemStyle?: CSSProperties;
  cursorStyle?: CSSProperties;
  activeStyle?: CSSProperties;

  onDisabled?: (index: number) => void;
  onChange: (index: number) => void;
}
type ScrollElement = HTMLElement | Window;

const Tabs: React.FC<IProps> = ({
  menus,
  current,
  children,
  fixed = false,
  bordered = true,
  cursor = true,
  cursorStyle,
  itemStyle,
  activeStyle = {
    color: '#2d46f1',
    fontWeight: 600,
  },
  sticky = false,
  onChange,
  onDisabled,
}) => {
  // 菜单项是否超过横屏 true ? flex-start : space-around
  const [isOverbrim, setIsOverbrim] = useState(false);
  // 记录cursor在每个菜单项的位置
  const [cursorPos, setCursorPos] = useState<number[]>([]);
  const [isSticky, setIsSticky] = useState<boolean>(false);

  // refs
  const menuRef = useRef<HTMLDivElement>(null);
  const menuWrapperRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLElement[]>([]);
  const cursorRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // methods
  // 获取滚动容器
  const getScroller = (el: HTMLElement, root: ScrollElement = window) => {
    let node = el;
    const overflowScrollReg = /scroll|auto/i;
    while (
      node &&
      node.tagName !== 'HTML' &&
      node.nodeType === 1 &&
      node !== root
    ) {
      const { overflowY } = window.getComputedStyle(node);
      if (overflowScrollReg.test(overflowY)) {
        if (node.tagName !== 'BODY') {
          return node;
        }
        const { overflowY: htmlOverflowY } = window.getComputedStyle(
          node.parentNode as Element
        );
        if (overflowScrollReg.test(htmlOverflowY)) {
          return node;
        }
      }
      node = node.parentNode as HTMLElement;
    }
    return root;
  };

  // events
  const onMenuItemTap = (index: number) => {
    if (current === index) return;
    if (typeof menus[index] === 'object' && !!menus[index].disabled) {
      onDisabled && onDisabled(index);
      return;
    }
    onChange(index);
    // 控制视图移动
    const dom = menuItemsRef.current[index];
    const itemLeft = dom.offsetLeft;
    const itemHalf = dom.offsetWidth / 2;
    const menuHalf = menuRef.current!.offsetWidth / 2;
    let target = itemLeft - menuHalf + itemHalf;
    if (target < 0) {
      target = 0;
    }
    if (
      target >
      menuWrapperRef.current!.offsetWidth - menuRef.current!.offsetWidth
    ) {
      target =
        menuWrapperRef.current!.offsetWidth - menuRef.current!.offsetWidth - 1;
    }
    // 帧动画
    const minus = target - menuRef.current!.scrollLeft;
    const duration = 250;
    const interval = 12;
    const speed = minus / (duration / interval);
    const timer = setInterval(() => {
      menuRef.current!.scrollLeft += speed;
      if (
        Math.abs(target - menuRef.current!.scrollLeft) <= Math.abs(speed) ||
        Math.abs(speed) < 1
      ) {
        menuRef.current!.scrollLeft = target;
        clearInterval(timer);
      }
    }, interval);
  };

  // effects
  // => 判断内容是否溢出屏幕
  useEffect(() => {
    // 获取外层容器宽度
    const m = menuRef.current?.getBoundingClientRect().width;
    // 获取菜单容器宽度
    const w = menuWrapperRef.current?.getBoundingClientRect().width;
    if (m && w) setIsOverbrim(w > m);
  }, [menuRef, menuWrapperRef]);

  // => 计算游标在各项停留时的位置
  useEffect(() => {
    if (menuItemsRef.current && cursorRef.current) {
      const cursorHalf = cursorRef.current.getBoundingClientRect().width / 2;
      const pos: number[] = [];
      menuItemsRef.current.forEach((dom) => {
        if (dom) {
          const { left, width } = dom.getBoundingClientRect();
          pos.push(left + width / 2 - cursorHalf);
        }
      });
      setCursorPos(pos);
    }
  }, [menuItemsRef, cursorRef]);
  // => 吸顶
  useEffect(() => {
    let parent: ScrollElement | null = null;
    const onScroll = (e: any) => {
      const scrollTop =
        +e.target?.scrollTop ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      if (scrollTop >= tabsRef.current!.offsetTop) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    if (sticky && tabsRef.current) {
      parent = getScroller(tabsRef.current);
      parent.addEventListener('scroll', onScroll, false);
    }
    return () => {
      if (parent) {
        parent.removeEventListener('scroll', onScroll, false);
      }
    };
  }, [tabsRef]);

  // render
  return (
    <div ref={tabsRef} className='lg-tabs'>
      {/* 占位 */}
      {(fixed || isSticky) && <div className='lg-tabs__place' />}
      {/* 菜单 */}
      <div
        className={classNames([
          'lg-tabs__menu',
          { bordered, fixed: fixed || isSticky },
        ])}
        ref={menuRef}
      >
        {/* tab item's wrapper */}
        <div
          className='lg-tabs__menu_wrapper'
          ref={menuWrapperRef}
          style={{
            justifyContent: isOverbrim ? 'flex-start' : 'space-around',
          }}
        >
          {menus.map((item, i) => (
            <section
              ref={(dom: HTMLElement) => menuItemsRef.current.push(dom)}
              className={classNames([
                'lg-tabs__menu_item',
                { disabled: typeof item === 'object' && !!item.disabled },
              ])}
              style={
                current === i
                  ? { ...itemStyle, ...activeStyle }
                  : { ...itemStyle }
              }
              key={'tabs_menu_item_' + i}
              onClick={() => {
                onMenuItemTap(i);
              }}
            >
              {typeof item === 'string' ? (
                item
              ) : (
                <>
                  {item.title}
                  {item.badge && (
                    <span className='lg-tabs__menu_badge'>{item.badge}</span>
                  )}
                </>
              )}
            </section>
          ))}
          {/* cursor */}
          {cursor && (
            <section
              ref={cursorRef}
              className='lg-tabs__cursor'
              style={{
                transform: `translateX(${cursorPos[current]}px)`,
                ...cursorStyle,
              }}
            />
          )}
        </div>
      </div>
      {/* 内容 */}
      {children && <div className='lg-tabs__content'>{children}</div>}
    </div>
  );
};

export default memo(Tabs);
