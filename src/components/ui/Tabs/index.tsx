import { memo, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { Key, KeyboardEvent, ReactNode } from 'react';

import { createPortal } from 'react-dom';

import { m } from 'motion/react';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';

export interface TabsItemProps {
  key?: Key;
  title: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  menus: ReadonlyArray<TabsItemProps | string>;
  current: number;
  children?: ReactNode;
  fixed?: boolean;
  bordered?: boolean;
  sticky?: boolean;
  cursor?: boolean;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  indicatorClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
  onDisabled?: (index: number) => void;
  onChange: (index: number) => void;
}

const getItem = (item: TabsItemProps | string): TabsItemProps =>
  typeof item === 'string' ? { title: item } : item;

function Tabs({
  menus,
  current,
  children,
  fixed = false,
  bordered = true,
  sticky = false,
  cursor = true,
  className,
  tabListClassName,
  tabClassName,
  activeTabClassName,
  indicatorClassName,
  contentClassName,
  ariaLabel = 'Tabs',
  onDisabled,
  onChange,
}: TabsProps) {
  const tabsId = useId();
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabWrapperRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [isOverflowing, setIsOverflowing] = useState(false);
  const activeIndex = menus.length === 0 ? -1 : Math.min(Math.max(current, 0), menus.length - 1);

  useLayoutEffect(() => {
    const tabList = tabListRef.current;
    const tabWrapper = tabWrapperRef.current;
    if (!tabList || !tabWrapper) return undefined;

    const updateOverflow = () => {
      setIsOverflowing(tabWrapper.scrollWidth > tabList.clientWidth + 1);
    };
    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(tabList);
    observer.observe(tabWrapper);
    return () => observer.disconnect();
  }, [menus]);

  useEffect(() => {
    const tabList = tabListRef.current;
    const activeTab = tabRefs.current.get(activeIndex);
    if (!tabList || !activeTab) return;

    const targetLeft = activeTab.offsetLeft - (tabList.clientWidth - activeTab.offsetWidth) / 2;
    const maxLeft = Math.max(0, tabList.scrollWidth - tabList.clientWidth);
    tabList.scrollTo({ left: Math.min(Math.max(targetLeft, 0), maxLeft), behavior: 'smooth' });
  }, [activeIndex]);

  const selectTab = (index: number) => {
    const item = getItem(menus[index]);
    if (item.disabled) {
      onDisabled?.(index);
      return;
    }
    if (activeIndex !== index) onChange(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || menus.length === 0) {
      return;
    }

    event.preventDefault();
    const enabledIndexes = menus
      .map((item, itemIndex) => (getItem(item).disabled ? -1 : itemIndex))
      .filter((itemIndex) => itemIndex >= 0);
    if (enabledIndexes.length === 0) return;

    const currentEnabledIndex = enabledIndexes.indexOf(index);
    const nextIndex =
      event.key === 'Home'
        ? enabledIndexes[0]
        : event.key === 'End'
          ? enabledIndexes.at(-1)!
          : enabledIndexes[
              (currentEnabledIndex + (event.key === 'ArrowLeft' ? -1 : 1) + enabledIndexes.length) %
                enabledIndexes.length
            ];

    tabRefs.current.get(nextIndex)?.focus();
    if (activeIndex !== nextIndex) onChange(nextIndex);
  };

  const tabList = (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'scrollbar-hidden h-11 overflow-x-auto overflow-y-hidden bg-white whitespace-nowrap',
        bordered && 'border-b border-[#eee]',
        sticky && !fixed && 'sticky top-0 z-30',
        tabListClassName,
      )}
    >
      <div
        ref={tabWrapperRef}
        className={cn(
          'relative flex h-full w-max min-w-full items-stretch',
          isOverflowing ? 'justify-start' : 'justify-around',
        )}
      >
        {menus.map((rawItem, index) => {
          const item = getItem(rawItem);
          const active = index === activeIndex;
          const tabId = `${tabsId}-tab-${index}`;
          const panelId = `${tabsId}-panel-${index}`;

          return (
            <button
              ref={(element) => {
                if (element) tabRefs.current.set(index, element);
                else tabRefs.current.delete(index);
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-controls={panelId}
              aria-disabled={item.disabled || undefined}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              className={cn(
                'relative mx-5 flex h-full shrink-0 items-center justify-center text-[15px] text-[#444] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#2d46f1] focus-visible:ring-inset',
                active && 'font-semibold text-[#2d46f1]',
                item.disabled && 'cursor-not-allowed opacity-30',
                tabClassName,
                active && activeTabClassName,
              )}
              key={item.key ?? index}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span>{item.title}</span>
              {item.badge !== undefined && item.badge !== null ? (
                <span className="absolute top-1 left-full min-w-4 -translate-x-[30%] rounded-full bg-[#e42132] px-1 text-center text-[9px] leading-4 font-medium text-white">
                  {item.badge}
                </span>
              ) : null}
              {cursor && active ? (
                <m.span
                  layoutId={`${tabsId}-indicator`}
                  className={cn(
                    'absolute bottom-0 left-1/2 h-1 w-[30px] -translate-x-1/2 rounded-full bg-[#2d46f1]',
                    indicatorClassName,
                  )}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={cn('ui-tabs', className)}>
      {fixed ? <div className="h-11" aria-hidden /> : null}
      {fixed
        ? createPortal(
            <div className="app-fixed-frame fixed top-0" style={{ zIndex: ZIndex.Header }}>
              {tabList}
            </div>,
            document.body,
          )
        : tabList}
      {children !== undefined && activeIndex >= 0 ? (
        <div
          role="tabpanel"
          id={`${tabsId}-panel-${activeIndex}`}
          aria-labelledby={`${tabsId}-tab-${activeIndex}`}
          className={cn('outline-none', contentClassName)}
          tabIndex={0}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default memo(Tabs);
