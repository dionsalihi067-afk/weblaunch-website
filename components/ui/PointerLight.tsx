'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Desktop-only CSS-variable pointer light. Skipped on touch / small screens
 * to protect mobile INP and battery.
 */
export default function PointerLight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === 'undefined') return;

    // Coarse pointers / narrow viewports: keep static gradient, no listeners
    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    const wideEnough = window.matchMedia('(min-width: 768px)');
    if (!finePointer.matches || !wideEnough.matches) return;

    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const rect = parent.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        parent.style.setProperty('--pointer-x', `${x}%`);
        parent.style.setProperty('--pointer-y', `${y}%`);
      });
    };

    parent.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      parent.removeEventListener('pointermove', onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={
        className ??
        'pointer-events-none absolute inset-0 z-[1] hidden opacity-60 mix-blend-soft-light md:block'
      }
      style={{
        background:
          'radial-gradient(520px circle at var(--pointer-x, 50%) var(--pointer-y, 35%), rgba(0,112,243,0.18), transparent 45%)',
      }}
    />
  );
}
