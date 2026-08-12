import { useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

export type AnimatedNumberProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  value: number;
  from?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  duration?: number;
  formatValue?: (value: number) => string;
};

const DEFAULT_DURATION = 1.2;
const DEFAULT_EASE = [0.22, 1, 0.36, 1] as const;

const formatInteger = (value: number) => Math.round(value).toLocaleString();

export default function AnimatedNumber({
  value,
  from = 0,
  prefix,
  suffix,
  duration = DEFAULT_DURATION,
  formatValue = formatInteger,
  ...props
}: AnimatedNumberProps) {
  const reducedMotion = Boolean(useReducedMotion());
  // `from` 只决定首次渲染的起点，后续 value 更新会从当前动画值继续。
  const animatedValue = useMotionValue(reducedMotion ? value : from);

  // 动画过程中始终读取最新格式函数，支持语言或展示规则动态切换。
  const formatValueRef = useRef(formatValue);
  formatValueRef.current = formatValue;
  const formattedValue = useTransform(animatedValue, (latest) => formatValueRef.current(latest));

  useEffect(() => {
    // 数值静止时格式函数变化不会触发 MotionValue，需主动刷新一次文本。
    formattedValue.set(formatValue(animatedValue.get()));
  }, [animatedValue, formatValue, formattedValue]);

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.set(value);
      return;
    }

    const controls = animate(animatedValue, value, {
      duration,
      ease: DEFAULT_EASE,
    });

    return () => controls.stop();
  }, [animatedValue, duration, reducedMotion, value]);

  return (
    <span {...props}>
      {prefix}
      <m.span>{formattedValue}</m.span>
      {suffix}
    </span>
  );
}
