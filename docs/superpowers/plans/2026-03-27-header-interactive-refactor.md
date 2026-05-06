# HeaderInteractive Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract four widget-local hooks from `HeaderInteractive` and `MobileMenu` to eliminate duplicated mount-detection, auth-derivation, click-outside, and mobile-menu-state logic.

**Architecture:** Four focused hooks live alongside the components in `apps/web/src/widgets/header/ui/`. `HeaderInteractive` becomes a thin composition shell. `MobileMenu` drops its duplicated boilerplate. No behavior changes — existing Playwright e2e tests cover integration.

**Tech Stack:** React (useSyncExternalStore, useState, useEffect, useCallback), Next.js usePathname, Vitest + @testing-library/react for unit tests.

**Spec:** `docs/superpowers/specs/2026-03-27-header-interactive-refactor-design.md`

---

## File Map

| Action | Path                                                     | Responsibility                                                  |
| ------ | -------------------------------------------------------- | --------------------------------------------------------------- |
| Create | `apps/web/src/widgets/header/ui/useIsMounted.ts`         | Wraps useSyncExternalStore mount detection                      |
| Create | `apps/web/src/widgets/header/ui/useIsMounted.test.ts`    | Unit tests for useIsMounted                                     |
| Create | `apps/web/src/widgets/header/ui/useHeaderAuth.ts`        | Derives isAuthenticated + displayName from useSessionTokens     |
| Create | `apps/web/src/widgets/header/ui/useHeaderAuth.test.ts`   | Unit tests for useHeaderAuth                                    |
| Create | `apps/web/src/widgets/header/ui/useClickOutside.ts`      | Attaches/removes click-outside listener for the mobile menu     |
| Create | `apps/web/src/widgets/header/ui/useClickOutside.test.ts` | Unit tests for useClickOutside                                  |
| Create | `apps/web/src/widgets/header/ui/useMobileMenu.ts`        | Owns isOpen state, pathname-close, delegates to useClickOutside |
| Create | `apps/web/src/widgets/header/ui/useMobileMenu.test.ts`   | Unit tests for useMobileMenu                                    |
| Modify | `apps/web/src/widgets/header/ui/HeaderInteractive.tsx`   | Consume the four new hooks, remove all extracted logic          |
| Modify | `apps/web/src/widgets/header/ui/MobileMenu.tsx`          | Consume useIsMounted + useHeaderAuth, remove duplicated logic   |

---

## Task 1: useIsMounted

**Files:**

- Create: `apps/web/src/widgets/header/ui/useIsMounted.ts`
- Create: `apps/web/src/widgets/header/ui/useIsMounted.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/widgets/header/ui/useIsMounted.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted', () => {
  // The SSR path (getServerSnapshot returning false) cannot be tested in jsdom —
  // useSyncExternalStore always uses the client snapshot in a browser-like environment.
  // The SSR behavior is verified implicitly by the Playwright e2e suite.
  it('returns true in a browser (jsdom) environment', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useIsMounted.test.ts
```

Expected: FAIL — `useIsMounted` not found.

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/widgets/header/ui/useIsMounted.ts
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useIsMounted.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/header/ui/useIsMounted.ts apps/web/src/widgets/header/ui/useIsMounted.test.ts
git commit -m "refactor(ARC-425): extract useIsMounted hook for header widget"
```

---

## Task 2: useHeaderAuth

**Files:**

- Create: `apps/web/src/widgets/header/ui/useHeaderAuth.ts`
- Create: `apps/web/src/widgets/header/ui/useHeaderAuth.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/web/src/widgets/header/ui/useHeaderAuth.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHeaderAuth } from './useHeaderAuth';

// vi.mock is hoisted before imports by Vitest, so useSessionTokens is fully
// intercepted before any module-level store code runs. The cast below is safe
// because only `snapshot` is accessed in useHeaderAuth — the rest of the return
// value (clearTokens, setTokens, etc.) is never touched by the hook under test.
vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: vi.fn(),
}));

import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
const mockUseSessionTokens = vi.mocked(useSessionTokens);

describe('useHeaderAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isAuthenticated=false and displayName=undefined when no access token', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: null,
        displayName: null,
        username: null,
        email: null,
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.isAuthenticated).toBe(false);
    // Note: the original code returned `null` here (null || null || null === null).
    // The hook normalises this to `undefined` to match the declared return type.
    // Both are falsy; consumers use `displayName && ...` so behavior is identical.
    expect(result.current.displayName).toBeUndefined();
  });

  it('returns isAuthenticated=true when access token present', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: null,
        username: null,
        email: null,
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('prefers displayName over username over email', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: 'Alice',
        username: 'alice99',
        email: 'a@b.com',
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.displayName).toBe('Alice');
  });

  it('falls back to username when no displayName', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: null,
        username: 'alice99',
        email: 'a@b.com',
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.displayName).toBe('alice99');
  });

  it('falls back to email when no displayName or username', () => {
    mockUseSessionTokens.mockReturnValue({
      snapshot: {
        accessToken: 'tok',
        displayName: null,
        username: null,
        email: 'a@b.com',
      },
    } as ReturnType<typeof useSessionTokens>);

    const { result } = renderHook(() => useHeaderAuth());
    expect(result.current.displayName).toBe('a@b.com');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useHeaderAuth.test.ts
```

Expected: FAIL — `useHeaderAuth` not found.

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/widgets/header/ui/useHeaderAuth.ts
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export function useHeaderAuth(): {
  isAuthenticated: boolean;
  displayName: string | undefined;
} {
  const { snapshot } = useSessionTokens();
  const isAuthenticated = !!snapshot.accessToken;
  // `|| undefined` normalises null (when all three fields are null) to undefined,
  // matching the return type. Both null and undefined are falsy; no behavior change
  // for consumers that use `displayName && ...`.
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email || undefined;
  return { isAuthenticated, displayName };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useHeaderAuth.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/header/ui/useHeaderAuth.ts apps/web/src/widgets/header/ui/useHeaderAuth.test.ts
git commit -m "refactor(ARC-425): extract useHeaderAuth hook for header widget"
```

---

## Task 3: useClickOutside

**Files:**

- Create: `apps/web/src/widgets/header/ui/useClickOutside.ts`
- Create: `apps/web/src/widgets/header/ui/useClickOutside.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/web/src/widgets/header/ui/useClickOutside.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClickOutside } from './useClickOutside';

function fireClick(target: Element) {
  target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('useClickOutside', () => {
  let onClose: ReturnType<typeof vi.fn>;
  // Track appended elements so afterEach can clean up even if a test throws
  const appended: Element[] = [];

  function append<T extends Element>(el: T): T {
    document.body.appendChild(el);
    appended.push(el);
    return el;
  }

  beforeEach(() => {
    onClose = vi.fn();
  });

  afterEach(() => {
    appended.splice(0).forEach((el) => el.parentNode?.removeChild(el));
  });

  it('does not attach a listener when enabled=false', () => {
    const outside = append(document.createElement('div'));
    renderHook(() => useClickOutside(onClose, false));
    fireClick(outside);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking outside the menu and button', () => {
    const outside = append(document.createElement('div'));
    renderHook(() => useClickOutside(onClose, true));
    fireClick(outside);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when clicking inside [data-mobile-menu]', () => {
    const menu = append(document.createElement('div'));
    menu.setAttribute('data-mobile-menu', '');
    const inner = document.createElement('button');
    menu.appendChild(inner);

    renderHook(() => useClickOutside(onClose, true));
    fireClick(inner);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when clicking [data-mobile-menu-button]', () => {
    // This also covers the case where the user clicks the toggle button to open
    // the menu: even if the effect were synchronously registered (it is not —
    // useEffect defers to after paint), the [data-mobile-menu-button] guard
    // prevents onClose from firing on the same click that opened the menu.
    const btn = append(document.createElement('button'));
    btn.setAttribute('data-mobile-menu-button', '');

    renderHook(() => useClickOutside(onClose, true));
    fireClick(btn);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes the listener when enabled changes to false', () => {
    const outside = append(document.createElement('div'));

    const { rerender } = renderHook(
      ({ enabled }) => useClickOutside(onClose, enabled),
      { initialProps: { enabled: true } },
    );
    rerender({ enabled: false });
    fireClick(outside);
    expect(onClose).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useClickOutside.test.ts
```

Expected: FAIL — `useClickOutside` not found.

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/widgets/header/ui/useClickOutside.ts
import { useEffect } from 'react';

export function useClickOutside(onClose: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[data-mobile-menu]') &&
        !target.closest('[data-mobile-menu-button]')
      ) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [enabled, onClose]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useClickOutside.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/header/ui/useClickOutside.ts apps/web/src/widgets/header/ui/useClickOutside.test.ts
git commit -m "refactor(ARC-425): extract useClickOutside hook for header widget"
```

---

## Task 4: useMobileMenu

**Files:**

- Create: `apps/web/src/widgets/header/ui/useMobileMenu.ts`
- Create: `apps/web/src/widgets/header/ui/useMobileMenu.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// apps/web/src/widgets/header/ui/useMobileMenu.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMobileMenu } from './useMobileMenu';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/games'),
}));

// Mock useClickOutside — tested in isolation in its own test file
vi.mock('./useClickOutside', () => ({
  useClickOutside: vi.fn(),
}));

import { usePathname } from 'next/navigation';
const mockUsePathname = vi.mocked(usePathname);

describe('useMobileMenu', () => {
  beforeEach(() => {
    // Reset to a stable pathname before each test to prevent cross-test
    // contamination from the pathname-change effect firing unexpectedly.
    mockUsePathname.mockReturnValue('/games');
  });

  it('starts closed', () => {
    const { result } = renderHook(() => useMobileMenu());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle opens the menu', () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
  });

  it('toggle closes the menu when already open', () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('closes the menu when pathname changes', () => {
    const { result, rerender } = renderHook(() => useMobileMenu());

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    mockUsePathname.mockReturnValue('/stats');
    rerender();

    expect(result.current.isOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useMobileMenu.test.ts
```

Expected: FAIL — `useMobileMenu` not found.

- [ ] **Step 3: Write the implementation**

```ts
// apps/web/src/widgets/header/ui/useMobileMenu.ts
import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useClickOutside } from './useClickOutside';

export function useMobileMenu(): {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
} {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Close the menu on navigation. useEffect (post-render) rather than the
  // render-phase prevPathname pattern from the original HeaderInteractive —
  // the one-tick delay is acceptable for a menu-close on navigation.
  useEffect(() => {
    close();
  }, [pathname, close]);

  useClickOutside(close, isOpen);

  return { isOpen, toggle, close };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter web vitest run src/widgets/header/ui/useMobileMenu.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/widgets/header/ui/useMobileMenu.ts apps/web/src/widgets/header/ui/useMobileMenu.test.ts
git commit -m "refactor(ARC-425): extract useMobileMenu hook for header widget"
```

---

## Task 5: Refactor HeaderInteractive

**Files:**

- Modify: `apps/web/src/widgets/header/ui/HeaderInteractive.tsx`

- [ ] **Step 1: Replace the file contents**

Replace `apps/web/src/widgets/header/ui/HeaderInteractive.tsx` with:

```tsx
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { routes } from '@/shared/config/routes';
import { InstallPWAButton } from '@/features/pwa';
import {
  Button,
  SupportIcon,
  MenuIcon,
  CloseIcon,
  LinkButton,
  MobileLoginIndicator,
} from '@arcadeum/ui';
import { ProfileMenu } from './ProfileMenu';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Nav,
  Actions,
  DesktopOnly,
  MobileMenuContainer,
  NavLinkContainer,
  NavHeaderLink,
  NavLinkIndicator,
} from './styles';
import { useIsMounted } from './useIsMounted';
import { useHeaderAuth } from './useHeaderAuth';
import { useMobileMenu } from './useMobileMenu';

export function HeaderInteractive() {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const { isAuthenticated, displayName } = useHeaderAuth();
  const { t } = useTranslation();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useMobileMenu();

  const navItems = useMemo(
    () => [
      { href: routes.games, label: t('navigation.gamesTab') },
      { href: routes.chats, label: t('navigation.chatsTab') },
      { href: routes.history, label: t('navigation.historyTab') },
      { href: routes.stats, label: t('navigation.statsTab') },
      { href: routes.settings, label: t('navigation.settingsTab') },
    ],
    [t],
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Nav>
        {navItems.map((item) => (
          <NavLinkContainer key={item.href}>
            <NavHeaderLink
              href={item.href}
              variant="ghost"
              size="sm"
              isActive={pathname === item.href}
              data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
            >
              {item.label}
            </NavHeaderLink>
            <NavLinkIndicator
              active={pathname === item.href}
              data-testid="nav-link-indicator"
            />
          </NavLinkContainer>
        ))}
      </Nav>

      <Actions>
        <InstallPWAButton />
        <DesktopOnly>
          <LinkButton
            href={routes.support}
            variant="secondary"
            size="sm"
            gap="$2"
            aria-label={t('common.actions.support')}
          >
            <SupportIcon size={18} />
            {t('common.actions.support')}
          </LinkButton>
        </DesktopOnly>
        <LanguageSwitcher data-testid="header-language-switcher" />
        {isAuthenticated && displayName && <ProfileMenu />}

        {!isAuthenticated && (
          <DesktopOnly>
            <LinkButton
              variant="primary"
              size="sm"
              href="/auth"
              data-testid="desktop-login-button"
            >
              {t('common.actions.login')}
            </LinkButton>
          </DesktopOnly>
        )}

        <MobileLoginIndicator
          href={isAuthenticated ? routes.settings : routes.auth}
          isAuthenticated={isAuthenticated}
          title={isAuthenticated ? displayName || 'Logged in' : 'Not logged in'}
          data-testid="mobile-login-indicator"
        />

        <MobileMenuContainer>
          <Button
            variant="icon"
            size="sm"
            onPress={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            data-mobile-menu-button
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? (
              <CloseIcon size={20} />
            ) : (
              <MenuIcon size={20} />
            )}
          </Button>
        </MobileMenuContainer>
      </Actions>

      <MobileMenu isOpen={isMobileMenuOpen} navItems={navItems} />
    </>
  );
}
```

- [ ] **Step 2: Run the unit test suite to verify nothing broke**

```bash
pnpm --filter web vitest run src/widgets/header/
```

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/header/ui/HeaderInteractive.tsx
git commit -m "refactor(ARC-425): simplify HeaderInteractive using extracted hooks"
```

---

## Task 6: Refactor MobileMenu

**Files:**

- Modify: `apps/web/src/widgets/header/ui/MobileMenu.tsx`

- [ ] **Step 1: Replace the file contents**

Replace `apps/web/src/widgets/header/ui/MobileMenu.tsx` with:

```tsx
'use client';

import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { CosmeticBadge } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import { appConfig } from '@/shared/config/app-config';
import {
  MobileNav,
  MobileUserInfo,
  UserNameEllipsis,
  MobileVersionText,
  NavMobileLink,
} from './styles';
import {
  Button,
  YStack,
  XStack,
  LogoutIcon,
  SupportIcon,
  RoleBadge,
  LinkButton,
  Divider,
} from '@arcadeum/ui';
import { useIsMounted } from './useIsMounted';
import { useHeaderAuth } from './useHeaderAuth';

interface MobileMenuProps {
  isOpen: boolean;
  navItems: Array<{ href: string; label: string }>;
}

export function MobileMenu({ isOpen, navItems }: MobileMenuProps) {
  const pathname = usePathname();
  // clearTokens and snapshot.role are MobileMenu-specific — not in useHeaderAuth
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const mounted = useIsMounted();
  const { isAuthenticated, displayName } = useHeaderAuth();
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();

  const handleLogout = useCallback(async () => {
    await clearTokens();
    window.location.replace('/');
  }, [clearTokens]);

  if (!mounted || !isOpen) return null;

  const content = (
    <MobileNav data-mobile-menu data-testid="mobile-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <XStack
            key={item.href}
            width="100%"
            borderRadius="$4"
            backgroundColor={
              isActive ? 'rgba(87, 195, 255, 0.1)' : 'transparent'
            }
          >
            <NavMobileLink
              href={item.href}
              data-testid={`mobile-nav-${item.href.replace('/', '') || 'home'}`}
              variant="ghost"
              size="sm"
              isActive={isActive}
              fullWidth
            >
              {item.label}
            </NavMobileLink>
          </XStack>
        );
      })}

      {isAuthenticated && displayName && (
        <>
          <MobileUserInfo>
            <UserNameEllipsis>{displayName}</UserNameEllipsis>
            {role !== 'free' && (
              <RoleBadge role={role}>{t(`common.roles.${role}`)}</RoleBadge>
            )}
            {cosmeticBadges?.map((badgeId) => (
              <CosmeticBadge key={badgeId} badgeId={badgeId} />
            ))}
          </MobileUserInfo>
          <Button
            variant="listItem"
            mt="$2"
            data-testid="mobile-logout-button"
            onClick={handleLogout}
            icon={<LogoutIcon size={18} />}
          >
            {t('common.actions.logout')}
          </Button>
        </>
      )}

      {!isAuthenticated && (
        <YStack marginTop="$2" alignItems="center">
          <LinkButton
            href="/auth"
            variant="ghost"
            size="sm"
            data-testid="mobile-login-button"
          >
            {t('common.actions.login')}
          </LinkButton>
        </YStack>
      )}

      <YStack marginTop="$4">
        <Divider spacing="sm" />
      </YStack>

      <LinkButton
        href={routes.support}
        variant="ghost"
        size="sm"
        gap="$2"
        isActive={pathname === routes.support}
        fullWidth
      >
        <SupportIcon size={18} />
        {t('common.actions.support')}
      </LinkButton>

      <MobileVersionText>v{appConfig.appVersion}</MobileVersionText>
    </MobileNav>
  );

  return createPortal(content, document.body);
}
```

- [ ] **Step 2: Run the unit test suite**

```bash
pnpm --filter web vitest run src/widgets/header/
```

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/widgets/header/ui/MobileMenu.tsx
git commit -m "refactor(ARC-425): simplify MobileMenu using extracted hooks"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Run the full web unit test suite**

```bash
pnpm --filter web vitest run
```

Expected: all existing tests PASS, no regressions.

- [ ] **Step 2: Run lint**

```bash
pnpm --filter web lint
```

Expected: no errors or warnings.

- [ ] **Step 3: Build the web app to confirm no TypeScript errors**

```bash
pnpm --filter web build
```

Expected: clean build, no type errors.

- [ ] **Step 4: Run Playwright e2e tests for the header**

```bash
pnpm --filter web exec playwright test --grep "header|nav|mobile"
```

Expected: all PASS — confirms no behavior change.
