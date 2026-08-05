/**
<DragView ariaLabel="Draggable action" onPress={() => {}}>
	<span>Drag</span>
</DragView>
 */
import { memo, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';

import { createPortal } from 'react-dom';

import { m, useMotionValue } from 'motion/react';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';

export type DragViewPosition = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export interface DragViewProps {
  children: ReactNode;
  zIndex?: number;
  position?: DragViewPosition;
  className?: string;
  ariaLabel?: string;
  onPress?: () => void;
}

const defaultPosition: DragViewPosition = { right: 15, bottom: 80 };
const keyboardDirections: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -10 },
  ArrowRight: { x: 10, y: 0 },
  ArrowDown: { x: 0, y: 10 },
  ArrowLeft: { x: -10, y: 0 },
};

export default memo(function DragView({
  children,
  zIndex = ZIndex.FloatingBar,
  position = defaultPosition,
  className,
  ariaLabel = 'Draggable control',
  onPress,
}: DragViewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const draggedRef = useRef(false);
  const dragResetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const { top, right, bottom, left } = position;

  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [bottom, left, right, top, x, y]);

  useEffect(() => {
    return () => {
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
    };
  }, []);

  // Ref constraints rescale Motion values on viewport resize, so clamp only while dragging.
  const keepControlInFrame = () => {
    const control = controlRef.current;
    const frame = frameRef.current;
    if (!control || !frame) return;

    const controlRect = control.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    let nextX = x.get();
    let nextY = y.get();

    if (controlRect.left < frameRect.left) {
      nextX += frameRect.left - controlRect.left;
    } else if (controlRect.right > frameRect.right) {
      nextX += frameRect.right - controlRect.right;
    }

    if (controlRect.top < frameRect.top) {
      nextY += frameRect.top - controlRect.top;
    } else if (controlRect.bottom > frameRect.bottom) {
      nextY += frameRect.bottom - controlRect.bottom;
    }

    x.set(nextX);
    y.set(nextY);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const delta = keyboardDirections[event.key];
    const control = controlRef.current;
    const frame = frameRef.current;
    if (!delta || !control || !frame) return;

    event.preventDefault();
    const controlRect = control.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const currentX = x.get();
    const currentY = y.get();
    const baseLeft = controlRect.left - currentX;
    const baseTop = controlRect.top - currentY;
    const minX = frameRect.left - baseLeft;
    const maxX = frameRect.right - baseLeft - controlRect.width;
    const minY = frameRect.top - baseTop;
    const maxY = frameRect.bottom - baseTop - controlRect.height;

    x.set(Math.min(Math.max(currentX + delta.x, minX), maxX));
    y.set(Math.min(Math.max(currentY + delta.y, minY), maxY));
  };

  const anchoredStyle = {
    top: bottom === undefined ? (top ?? 0) : undefined,
    right,
    bottom,
    left: right === undefined ? (left ?? 0) : undefined,
    x,
    y,
  };

  return createPortal(
    <div
      ref={frameRef}
      className="app-fixed-frame pointer-events-none fixed inset-y-0"
      style={{ zIndex }}
    >
      <m.button
        ref={controlRef}
        type="button"
        drag
        dragMomentum={false}
        aria-label={ariaLabel}
        aria-roledescription="draggable"
        className={cn(
          'ui-drag-view pointer-events-auto absolute cursor-grab touch-none outline-none select-none focus-visible:ring-2 focus-visible:ring-[#168653] focus-visible:ring-offset-2',
          dragging && 'cursor-grabbing',
          className,
        )}
        data-dragging={dragging ? 'true' : 'false'}
        style={anchoredStyle}
        whileDrag={{ scale: 1.03 }}
        onClick={() => {
          if (!draggedRef.current) onPress?.();
        }}
        onDragEnd={() => {
          keepControlInFrame();
          setDragging(false);
          dragResetTimerRef.current = setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        }}
        onDragStart={() => {
          if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
          draggedRef.current = true;
          setDragging(true);
        }}
        onDrag={keepControlInFrame}
        onKeyDown={handleKeyDown}
      >
        {children}
      </m.button>
    </div>,
    document.body,
  );
});
