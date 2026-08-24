'use client';

import { useEffect, useRef } from 'react';

/** Arrow keys used to move focus between board cells. */
export const ARROW_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
] as const;

export type ArrowKey = (typeof ARROW_KEYS)[number];

/** Keys that activate the focused cell (select/place a piece). */
export const ACTIVATION_KEYS = ['Enter', ' '] as const;

export function isArrowKey(key: string): key is ArrowKey {
  return (ARROW_KEYS as readonly string[]).includes(key);
}

export function isActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

export function isEscapeKey(key: string): boolean {
  return key === 'Escape';
}

/**
 * Shared `focus-visible` ring for keyboard-focusable board cells and game
 * controls. Applied on top of each board's own styling so keyboard users
 * always get a visible focus indicator.
 */
export const BOARD_CELL_FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]';

/**
 * Invokes `handler` when the user presses Escape, while the listener is
 * enabled. Used to deselect the active piece/ship/weapon without touching
 * the mouse. No-op during SSR and when `enabled` is false.
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEscapeKey(event.key)) handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
