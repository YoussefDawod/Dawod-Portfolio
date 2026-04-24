import { useEffect } from 'react';

/**
 * useSwipe — Touch-Swipe Detection für Mobile Navigation
 *
 * @param {React.RefObject} ref       - Ref auf das zu beobachtende Element
 * @param {object}          options
 * @param {Function}        options.onSwipeLeft   - Callback: Swipe nach links
 * @param {Function}        options.onSwipeRight  - Callback: Swipe nach rechts
 * @param {number}          options.threshold     - Mindest-Swipe-Distanz in px (default: 60)
 */
export function useSwipe(ref, { onSwipeLeft, onSwipeRight, threshold = 60 } = {}) {
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    let startX = 0;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -threshold) onSwipeLeft?.();
      if (dx >  threshold) onSwipeRight?.();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}
