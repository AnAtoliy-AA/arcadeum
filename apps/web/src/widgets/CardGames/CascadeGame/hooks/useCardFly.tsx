'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import { Card } from '../ui/Card';
import styles from '../ui/CascadeGame.module.css';
import type { CascadeCard } from '../types';

interface FlyState {
  card: CascadeCard;
  from: DOMRect;
  to: DOMRect;
  key: number;
}

/**
 * Animates a face-up clone of the played card from its slot to the discard
 * pile. A fixed-position overlay (outside the table's clipped bounds) so it
 * reads even as the real hand re-renders from the next snapshot. No-ops when
 * elements aren't laid out (e.g. jsdom), so it's safe in tests.
 */
export function useCardFly() {
  const [fly, setFly] = useState<FlyState | null>(null);
  const [arrived, setArrived] = useState(false);

  const launch = useCallback(
    (
      card: CascadeCard,
      fromEl: HTMLElement | null | undefined,
      toEl: HTMLElement | null | undefined,
    ) => {
      if (!fromEl || !toEl) return;
      const from = fromEl.getBoundingClientRect();
      const to = toEl.getBoundingClientRect();
      if (!from.width || !to.width) return;
      setArrived(false);
      setFly({ card, from, to, key: Date.now() });
    },
    [],
  );

  useLayoutEffect(() => {
    if (!fly) return;
    const raf = requestAnimationFrame(() => setArrived(true));
    const timer = setTimeout(() => setFly(null), 460);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [fly]);

  const node = fly ? (
    <div
      key={fly.key}
      className={styles.fly}
      style={{
        left: fly.from.left,
        top: fly.from.top,
        width: fly.from.width,
        height: fly.from.height,
        transformOrigin: 'top left',
        opacity: arrived ? 0.25 : 1,
        transform: arrived
          ? `translate(${fly.to.left - fly.from.left}px, ${
              fly.to.top - fly.from.top
            }px) scale(${fly.to.width / fly.from.width})`
          : 'none',
      }}
    >
      <Card card={fly.card} />
    </div>
  ) : null;

  return { node, launch };
}
