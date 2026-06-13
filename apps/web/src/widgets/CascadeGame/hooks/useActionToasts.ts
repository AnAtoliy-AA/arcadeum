'use client';

import { useEffect, useRef, useState } from 'react';
import type { CardKind, CascadeCard } from '../types';

export interface ActionToast {
  key: string;
  glyph: string;
  label: string;
}

// Short, mechanic-level captions for the cards that change the flow of play.
// Plain wilds only recolour, so they don't toast.
const ACTION_TOAST: Partial<Record<CardKind, string>> = {
  SKIP: 'Skip',
  REVERSE: 'Reverse',
  DRAW_TWO: '+2',
  WILD_DRAW_FOUR: '+4',
};

/**
 * Pops a transient toast whenever the discard's top card changes to an action
 * card. Driven purely off `topCard.id` so it works from the shared snapshot
 * without any extra events; each toast self-clears after its animation.
 */
export function useActionToasts(
  topCard: CascadeCard | undefined,
  symbols: Record<string, string>,
): ActionToast[] {
  const [toasts, setToasts] = useState<ActionToast[]>([]);
  const prevId = useRef<string | null>(topCard?.id ?? null);

  useEffect(() => {
    const id = topCard?.id ?? null;
    if (!id || id === prevId.current) return;
    prevId.current = id;

    const label = topCard ? ACTION_TOAST[topCard.kind] : undefined;
    if (!label || !topCard) return;

    const key = `${id}-${Date.now()}`;
    const glyph = symbols[topCard.kind] ?? '';
    // Enqueue a toast in response to the snapshot's top card changing — the
    // sanctioned "react to external state change" use of setState-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToasts((list) => [...list, { key, glyph, label }]);
    const timer = setTimeout(
      () => setToasts((list) => list.filter((t) => t.key !== key)),
      1300,
    );
    return () => clearTimeout(timer);
  }, [topCard, symbols]);

  return toasts;
}
