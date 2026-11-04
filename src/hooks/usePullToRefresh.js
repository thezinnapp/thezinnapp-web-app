import { useEffect, useRef, useState } from 'react';

export function usePullToRefresh(onRefresh, containerRef) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const THRESHOLD = 72;

  useEffect(() => {
    const el = containerRef?.current || window;
    const getScrollTop = () =>
      containerRef?.current ? containerRef.current.scrollTop : window.scrollY;

    const onTouchStart = (e) => {
      if (getScrollTop() === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === 0) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && getScrollTop() === 0) {
        setPullDistance(Math.min(delta * 0.5, THRESHOLD));
        setIsPulling(true);
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance >= THRESHOLD) {
        try {
          await onRefresh();
        } finally {
          setPullDistance(0);
          setIsPulling(false);
          startY.current = 0;
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
        startY.current = 0;
      }
    };

    const target = containerRef?.current || document;
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: true });
    target.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, pullDistance, containerRef]);

  return { isPulling, pullDistance, THRESHOLD };
}