/**
<DragView ariaLabel="Draggable action" onPress={() => {}}>
  <span>Drag</span>
</DragView>
 */
import { memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';

import { createPortal } from 'react-dom';

import { RouteScenePresentContext } from '@/components/features/RouteTransition/route-scene-context';
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

type Point = { x: number; y: number };

const defaultPosition: DragViewPosition = { right: 15, bottom: 80 };
const keyboardDirections: Record<string, Point> = {
  ArrowUp: { x: 0, y: -10 },
  ArrowRight: { x: 10, y: 0 },
  ArrowDown: { x: 0, y: 10 },
  ArrowLeft: { x: -10, y: 0 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export default memo(function DragView({
  children,
  zIndex = ZIndex.FloatingBar,
  position = defaultPosition,
  className,
  ariaLabel = 'Draggable control',
  onPress,
}: DragViewProps) {
  const isRouteScenePresent = useContext(RouteScenePresentContext);
  const frameRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const pointerRef = useRef<{ id: number; start: Point; origin: Point } | null>(null);
  const movedRef = useRef(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const clampToViewport = useCallback((point: Point): Point => {
    const frame = frameRef.current;
    const control = controlRef.current;
    if (!frame || !control) return point;

    const frameRect = frame.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();
    return {
      x: clamp(point.x, 0, frameRect.width - controlRect.width),
      y: clamp(point.y, 0, frameRect.height - controlRect.height),
    };
  }, []);

  const getInitialPosition = useCallback((): Point => {
    const frame = frameRef.current;
    const control = controlRef.current;
    if (!frame || !control) return { x: 0, y: 0 };

    const frameRect = frame.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();
    const x =
      position.right !== undefined
        ? frameRect.width - position.right - controlRect.width
        : (position.left ?? 0);
    const y =
      position.bottom !== undefined
        ? frameRect.height - position.bottom - controlRect.height
        : (position.top ?? 0);

    return clampToViewport({ x, y });
  }, [clampToViewport, position.bottom, position.left, position.right, position.top]);

  useLayoutEffect(() => {
    setOffset(getInitialPosition());
  }, [getInitialPosition]);

  useEffect(() => {
    const handleResize = () => setOffset((current) => clampToViewport(current));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampToViewport]);

  useEffect(() => {
    if (isRouteScenePresent) return;
    pointerRef.current = null;
    movedRef.current = false;
    setDragging(false);
  }, [isRouteScenePresent]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || pointerRef.current) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = {
      id: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: offset,
    };
    movedRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;

    const deltaX = event.clientX - pointer.start.x;
    const deltaY = event.clientY - pointer.start.y;
    if (!movedRef.current && Math.hypot(deltaX, deltaY) < 4) return;

    movedRef.current = true;
    setDragging(true);
    setOffset(clampToViewport({ x: pointer.origin.x + deltaX, y: pointer.origin.y + deltaY }));
  };

  const finishPointerInteraction = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerRef.current?.id !== event.pointerId) return;

    pointerRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onPress?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = keyboardDirections[event.key];
    if (!delta) return;

    event.preventDefault();
    setOffset((current) => clampToViewport({ x: current.x + delta.x, y: current.y + delta.y }));
  };

  return isRouteScenePresent
    ? createPortal(
        <div
          ref={frameRef}
          className="app-fixed-frame pointer-events-none fixed inset-y-0"
          style={{ zIndex }}
        >
          <button
            ref={controlRef}
            type="button"
            aria-label={ariaLabel}
            aria-roledescription="draggable"
            className={cn(
              'ui-drag-view pointer-events-auto absolute cursor-grab touch-none border-0 bg-transparent p-0 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#168653] focus-visible:ring-offset-2',
              dragging && 'cursor-grabbing',
              className,
            )}
            data-dragging={dragging ? 'true' : 'false'}
            style={{ left: offset.x, top: offset.y }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onPointerCancel={finishPointerInteraction}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerInteraction}
          >
            {children}
          </button>
        </div>,
        document.body,
      )
    : null;
});
