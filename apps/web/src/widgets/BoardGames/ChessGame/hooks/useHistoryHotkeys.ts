'use client';

import { useEffect } from 'react';
import type { HistoryStep } from './useMoveHistoryView';

const KEY_TO_STEP: Record<string, HistoryStep> = {
  ArrowLeft: 'prev',
  ArrowRight: 'next',
};

/**
 * True when a key event should be left alone: typing in a field, using a
 * slider, or navigating the board grid (which owns the arrow keys).
 */
export function isHistoryHotkeyBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return !!target.closest('[role="grid"],[role="dialog"],[role="slider"]');
}

/**
 * Arrow Left/Right step through the move history. Home/End are left to the
 * page (scrolling); the move list buttons cover first/last.
 */
export function useHistoryHotkeys(
  onStep: (step: HistoryStep) => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      const step = KEY_TO_STEP[event.key];
      if (!step || isHistoryHotkeyBlocked(event.target)) return;
      event.preventDefault();
      onStep(step);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStep, enabled]);
}
