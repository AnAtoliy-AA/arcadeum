'use client';

/**
 * Wraps a DOM-mutating callback in the browser's View Transitions API
 * when available (Safari TP 17.4+, Chrome 111+, Firefox 127+). The
 * browser snapshots before/after and cross-fades the diff on the
 * compositor thread — gives plays / draws / nopes a kinetic feel
 * without per-element animation bookkeeping.
 *
 * In unsupported browsers the callback runs synchronously. Calling
 * code never branches on support — the helper handles the fallback.
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
  if (typeof doc.startViewTransition !== 'function') {
    fn();
    return;
  }
  doc.startViewTransition(fn);
}
