import type { Key, ReactNode } from 'react';

import { A11y, Autoplay, Keyboard, Pagination } from 'swiper/modules';
import type { SwiperProps } from 'swiper/react';
import { Swiper, SwiperSlide } from 'swiper/react';

import { cn } from '@/libs/class-helpers';

import './index.css';
import 'swiper/css';
import 'swiper/css/pagination';

type CarouselSwiperProps = Omit<
  SwiperProps,
  'a11y' | 'autoplay' | 'children' | 'className' | 'keyboard' | 'loop' | 'modules' | 'pagination'
>;

export type CarouselProps<T> = CarouselSwiperProps & {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey?: (item: T, index: number) => Key;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  className?: string;
  emptyContent?: ReactNode;
  loop?: boolean;
  showPagination?: boolean;
  slideClassName?: string;
  ariaLabel?: string;
};

const carouselModules = [A11y, Autoplay, Keyboard, Pagination];

export default function Carousel<T>({
  items,
  renderItem,
  getItemKey = (_, index) => index,
  autoPlay = false,
  autoPlayDelay = 5000,
  className,
  emptyContent = null,
  loop = true,
  showPagination = true,
  slideClassName,
  ariaLabel = 'Carousel',
  ...swiperProps
}: CarouselProps<T>) {
  const hasMultipleItems = items.length > 1;

  if (items.length === 0) return emptyContent;

  return (
    <Swiper
      {...swiperProps}
      a11y={{
        enabled: true,
        containerMessage: ariaLabel,
        containerRole: 'region',
        containerRoleDescriptionMessage: 'carousel',
        itemRoleDescriptionMessage: 'Slide',
      }}
      autoplay={
        autoPlay && hasMultipleItems
          ? {
              delay: autoPlayDelay,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false
      }
      className={cn('ui-carousel', className)}
      grabCursor={hasMultipleItems}
      keyboard={hasMultipleItems ? { enabled: true, onlyInViewport: true } : false}
      loop={loop && hasMultipleItems}
      modules={carouselModules}
      pagination={
        showPagination && hasMultipleItems
          ? {
              bulletElement: 'button',
              clickable: true,
            }
          : false
      }
      watchOverflow
    >
      {items.map((item, index) => (
        <SwiperSlide
          className={cn('ui-carousel__slide', slideClassName)}
          key={getItemKey(item, index)}
        >
          {renderItem(item, index)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
