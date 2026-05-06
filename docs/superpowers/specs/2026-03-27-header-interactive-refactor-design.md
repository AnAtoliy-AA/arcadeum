# HeaderInteractive Refactor Design

**Date:** 2026-03-27
**Branch:** ARC-425

## Problem

`HeaderInteractive.tsx` and `MobileMenu.tsx` contain duplicated logic:

- The `useSyncExternalStore` mount-detection pattern appears in both files with different variable names but identical behavior.
- Auth state derivation (`isAuthenticated`, `displayName`) from `useSessionTokens()` is repeated in both files.
- `HeaderInteractive` owns inline `useEffect` click-outside logic and mobile menu state that belongs in dedicated hooks.

## Approach

Extract four focused hooks into `apps/web/src/widgets/header/ui/`, then simplify both components to consume them.

## New Files

### `useIsMounted.ts`

Wraps the `useSyncExternalStore` client-only mount detection pattern. Returns `boolean`. Both `HeaderInteractive` and `MobileMenu` use this instead of their current inline boilerplate.

```ts
export function useIsMounted(): boolean;
```

### `useHeaderAuth.ts`

Derives auth state from `useSessionTokens()`. Both components call this instead of repeating the derivation. Returns only `isAuthenticated` and `displayName` — `role` and `useCosmeticBadges()` are `MobileMenu`-specific and intentionally excluded.

```ts
export function useHeaderAuth(): {
  isAuthenticated: boolean;
  displayName: string | undefined;
};
```

### `useClickOutside.ts`

Replaces the inline `useEffect` in `HeaderInteractive`. Widget-local hook that hard-codes the two `data-*` attribute selectors used by the header (`[data-mobile-menu]` and `[data-mobile-menu-button]`) — no selector parameters are exposed, since this hook has exactly one valid use site. Takes a close callback and an enabled flag. Attaches/removes the `click` listener only when `enabled` is true.

```ts
export function useClickOutside(onClose: () => void, enabled: boolean): void;
```

### `useMobileMenu.ts`

Owns the `isMobileMenuOpen` boolean state. Closes the menu automatically when the pathname changes — implemented as `useEffect(() => { close(); }, [pathname])`, replacing the render-phase `prevPathname` state update in `HeaderInteractive`. This changes from render-phase to post-render timing, which is acceptable here because closing a menu on navigation is not time-critical. Calls `useClickOutside` internally, passing its own `close` callback and `isOpen` as the enabled flag; the `data-*` selectors are hard-coded inside `useClickOutside`.

```ts
export function useMobileMenu(): {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};
```

## Changes to Existing Files

### `HeaderInteractive.tsx`

Remove:

- `useSyncExternalStore` boilerplate → `useIsMounted()`
- `isAuthenticated` / `displayName` derivation → `useHeaderAuth()`
- `isMobileMenuOpen` state, `toggleMobileMenu`, `closeMobileMenu` callbacks → `useMobileMenu()`
- `prevPathname` state and pathname-change reset block → moves into `useMobileMenu`
- Inline click-outside `useEffect` → moves into `useMobileMenu` via `useClickOutside`

Result: `HeaderInteractive` becomes a thin composition shell — hooks + JSX only.

### `MobileMenu.tsx`

Remove:

- `useSyncExternalStore` boilerplate → `useIsMounted()`
- `isAuthenticated` / `displayName` derivation → `useHeaderAuth()`

## Constraints

- No behavior changes — this is a pure structural refactor.
- All hooks stay inside `apps/web/src/widgets/header/ui/` (widget-local, not shared).
- No new tests required beyond what already exists; existing Playwright e2e tests cover the header behavior.
- File size limit (500 lines) is not a concern — all files involved are well under the limit.
