'use client';

/**
 * Wraps a DOM-mutating callback in the browser's View Transitions API
 * when available (Safari TP 17.4+, Chrome 111+, Firefox 127+). The
 * browser snapshots before/after and cross-fades the diff on the
 * compositor thread — gives plays / draws / nopes a kinetic feel
 * without per-element animation bookkeeping.
 *
 * Skips the animation when the user has `prefers-reduced-motion: reduce`
 * set at the OS level, matching every other animation in this widget
 * (`hudStyles.tsx` gates keyframes the same way). Motion-sensitive users
 * see plays land instantly without the cross-fade.
 *
 * In unsupported browsers the callback runs synchronously. Calling code
 * never branches on support — the helper handles the fallback.
 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => unknown;
};

export function withViewTransition(fn: () => void): void {
  if (typeof document === 'undefined') {
    fn();
    return;
  }
  const doc = document as ViewTransitionDocument;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof doc.startViewTransition !== 'function') {
    fn();
    return;
  }
  doc.startViewTransition(fn);
}
