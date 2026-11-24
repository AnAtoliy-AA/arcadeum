/**
 * Page-level rules for broadcast scenes, scoped by the `data-stream-root`
 * marker so they never touch the rest of the site.
 *
 * - No scrollbars or text selection on the capture surface.
 * - No backdrop-filter anywhere: it is expensive to rasterise and wrecks
 *   video encoder efficiency. Applies to portaled content too.
 * - Game widgets raise modals, toasts and celebration layers (result,
 *   rematch, milestones). None of that belongs in a broadcast, so any
 *   portaled dialog directly under <body> is hidden.
 */
const CSS = `
html, body { overflow: hidden !important; background: #000 !important; }
body { margin: 0; user-select: none; cursor: none; }
[data-stream-root] *, body > *:not([data-stream-root]) {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}
body > [role="dialog"],
body > [data-testid="modal-overlay"],
body > [data-sonner-toaster],
body > [data-radix-portal],
body > [id^="headlessui-portal"] { display: none !important; }
/* The widget's own header (turn pill, undo, fullscreen) duplicates the overlay. */
[data-stream-root] [data-testid="game-widget-container"] div.justify-between:has(> [data-testid="turn-status-pill"]),
[data-stream-root] [data-testid="multiplayer-undo-button"],
[data-stream-root] [data-testid="widget-fullscreen-button"] { display: none !important; }
[data-stream-root] [data-testid="game-result-modal"],
[data-stream-root] [data-testid="rules-modal"],
[data-stream-root] [data-testid="modal-overlay"],
[data-stream-root] canvas.confetti-canvas { display: none !important; }
`;

export function StreamGlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
