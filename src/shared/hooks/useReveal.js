import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — IntersectionObserver-basierter Reveal-Hook (global).
 *
 * Default: bidirektional (`once: false`). Element zeigt sich beim Reinscrollen,
 * verschwindet beim Hochscrollen wieder. Das ist die Phase-0-Entscheidung
 * für eine symmetrische, „Geschichte vor und rückwärts"-Bewegung.
 *
 * Nutzung:
 *   const { ref, isVisible } = useReveal();
 *   <section ref={ref} data-revealed={isVisible}>...</section>
 *
 * Im CSS:
 *   [data-revealed='false'] .reveal { opacity: 0; transform: translateY(18px); }
 *   [data-revealed='true']  .reveal { opacity: 1; transform: none; }
 *   .reveal {
 *     transition:
 *       opacity   var(--dur-2) var(--ease-soft),
 *       transform var(--dur-2) var(--ease-soft);
 *     transition-delay: calc(var(--idx, 0) * var(--stagger-step));
 *   }
 */
export function useReveal({ threshold = 0.2, once = false, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null);
  // Lazy-init: ohne IntersectionObserver direkt sichtbar (kein setState im Effect nötig).
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, isVisible };
}
