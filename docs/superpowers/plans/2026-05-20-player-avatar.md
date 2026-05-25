# PlayerAvatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-05-20-player-avatar-design.md`](../specs/2026-05-20-player-avatar-design.md)

**Goal:** Ship a reusable `PlayerAvatar` that composites every equipped shop cosmetic (avatar, badge, frame, aura, banner, name color) into one component in four sizes (icon/sm/md/card), backed by a connected wrapper that resolves equipped ids via the catalog, and migrate every player-avatar render site to use it.

**Architecture:** Two-layer split — presentational `PlayerAvatar` in `@arcadeum/ui` consumes resolved URLs and color values; connected `EquippedPlayerAvatar` in `apps/web/src/shared/ui/PlayerAvatar/` calls `useEquippedCosmetics` (extended to resolve frame/aura/banner) and forwards. BE payload builders are widened to surface `equippedFrameId` / `equippedAuraId` / `equippedBannerId` (schema already has them). `ChatMessage` gets an additive `senderAvatar?: ReactNode` slot so the migration is non-breaking.

**Tech Stack:** TypeScript, NestJS (BE), Next.js 16 + React 19 + Tamagui (Web), Vitest, Jest, Playwright, Storybook.

---

## Phase 0 — Pre-flight

### Task 0.1: Verify branch + clean tree

- [ ] **Step 1:** Confirm on branch `ARC-730` based on `develop`

```bash
git status && git log --oneline -3
```

Expected: branch is `ARC-730`, HEAD is the spec commit on top of develop.

- [ ] **Step 2:** Confirm install is good

```bash
pnpm install --frozen-lockfile
```

Expected: completes cleanly.

---

## Phase 1 — BE payload widening

### Task 1.1: Widen `AuthUserProfile`

**Files:**

- Modify: `apps/be/src/auth/lib/types.ts`
- Modify: `apps/be/src/auth/auth.service.ts` (buildAuthUserProfile)
- Modify: `apps/be/src/auth/auth.service.spec.ts` (if assertions cover the profile shape)

- [ ] **Step 1: Extend `AuthUserProfile`**

In `apps/be/src/auth/lib/types.ts` after the existing `equippedNameColorId?` field, add:

```ts
  /** Currently-equipped frame item id, or null. */
  equippedFrameId?: string | null;
  /** Currently-equipped aura item id, or null. */
  equippedAuraId?: string | null;
  /** Currently-equipped banner item id, or null. */
  equippedBannerId?: string | null;
```

- [ ] **Step 2: Populate in `auth.service.ts#buildAuthUserProfile`**

Add three lines next to `equippedNameColorId`:

```ts
      equippedFrameId: user.equippedFrameId ?? null,
      equippedAuraId: user.equippedAuraId ?? null,
      equippedBannerId: user.equippedBannerId ?? null,
```

- [ ] **Step 3: BE typecheck + test**

```bash
pnpm --filter be lint && pnpm --filter be test --runInBand --testPathPattern=auth
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/auth
git commit -m "feat(be): expose equipped frame/aura/banner ids on AuthUserProfile (ARC-730)"
```

### Task 1.2: Widen chat sender payload

**Files:**

- Modify: `apps/be/src/chat/chat-helper.service.ts`
- Modify: existing chat spec files (`chat.controller.spec.ts` or similar) only if they assert the sender shape; if no such assertion exists, no spec update is needed in this task.

- [ ] **Step 1: Widen `equippedLookup` map entry type and the `select` projection**

In `chat-helper.service.ts`, locate the existing `equippedLookup` Map<string, {...}> declaration. Extend its value type and the `.select([...])` projection with the three new fields. Then update the `equippedLookup.set(id, {...})` call to populate them. Finally extend the returned message object with `senderEquippedFrameId` / `senderEquippedAuraId` / `senderEquippedBannerId` (same `?? null` pattern as the existing fields).

- [ ] **Step 2: Update spec**

If the existing test asserts the sender shape, extend the assertion to include the three new optional fields.

- [ ] **Step 3: Verify**

```bash
pnpm --filter be lint && pnpm --filter be test --testPathPattern=chat-helper
```

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/chat
git commit -m "feat(be): chat sender payload exposes equipped frame/aura/banner (ARC-730)"
```

> **Pattern reused in Tasks 1.3–1.5:**
>
> - Types: add three optional `equippedFrameId?: string | null` etc. fields next to the existing equipped ids.
> - Mongoose select strings: append `equippedFrameId equippedAuraId equippedBannerId`.
> - Object projections (`{ equippedAvatarId: 1, ... }`): add three lines.
> - Mappers (`return {...}` / `.set(id, {...})`): add three `?? null` lines.

### Task 1.3: Widen room member payload

**Files:**

- Modify: `apps/be/src/games/rooms/game-rooms.types.ts`
- Modify: `apps/be/src/games/rooms/game-rooms.mapper.ts` (select + map)
- Modify: `apps/be/src/games/rooms/game-rooms.mapper.spec.ts` (if it asserts member shape)

- [ ] **Step 1:** Apply the pattern above to all four locations in these files.
- [ ] **Step 2:** Verify
  ```bash
  pnpm --filter be lint && pnpm --filter be test --testPathPattern=game-rooms
  ```
- [ ] **Step 3:** Commit
  ```bash
  git add apps/be/src/games/rooms
  git commit -m "feat(be): room member payload exposes equipped frame/aura/banner (ARC-730)"
  ```

### Task 1.4: Widen game-history player payload

**Files:**

- Modify: `apps/be/src/games/history/game-history.types.ts`
- Modify: `apps/be/src/games/history/game-history-stats.service.ts` (select string + two map sites at lines 169, 182, 200)
- Modify: `apps/be/src/games/history/game-history-stats.service.spec.ts` (if shape-asserting)

- [ ] **Step 1:** Apply the pattern. Both map sites in the service file (lines 182 and 200) need the three fields.
- [ ] **Step 2:** Verify
  ```bash
  pnpm --filter be lint && pnpm --filter be test --testPathPattern=game-history
  ```
- [ ] **Step 3:** Commit
  ```bash
  git add apps/be/src/games/history
  git commit -m "feat(be): game history player payload exposes equipped frame/aura/banner (ARC-730)"
  ```

### Task 1.5: Widen leaderboard payload

**Files:**

- Modify: `apps/be/src/leaderboards/dtos/leaderboard-snapshot.dto.ts` (both occurrences — see lines 32 and 99)
- Modify: `apps/be/src/leaderboards/leaderboards.hydrate.ts` (the player base type + the hydrate mapper around line 143)
- Modify: `apps/be/src/leaderboards/leaderboards.service.ts` (the projection at line 231 and the return shape at line 251)
- Modify: relevant `.spec.ts` files if they assert shape

- [ ] **Step 1:** Apply the pattern across all sites.
- [ ] **Step 2:** Verify
  ```bash
  pnpm --filter be lint && pnpm --filter be test --testPathPattern=leaderboards
  ```
- [ ] **Step 3:** Commit
  ```bash
  git add apps/be/src/leaderboards
  git commit -m "feat(be): leaderboard payload exposes equipped frame/aura/banner (ARC-730)"
  ```

---

## Phase 2 — FE shared types + hook extension

### Task 2.1: Extend session + leaderboard + game types

**Files:**

- Modify: `apps/web/src/entities/session/model/types.ts`
- Modify: `apps/web/src/entities/session/api/authApi.ts`
- Modify: `apps/web/src/entities/session/store/sessionStore.ts` (defaults + merge)
- Modify: `apps/web/src/entities/leaderboard/model/types.ts`
- Modify: `apps/web/src/shared/types/games.ts` (Player base)
- Modify: `apps/web/src/features/shop/lib/syncEquippedToSession.ts` (sync 3 new fields)

- [ ] **Step 1: Add `equippedFrameId` / `equippedAuraId` / `equippedBannerId` everywhere the existing equipped ids appear in these files.**

Use the same `string | null` (or `string | null | undefined`) pattern as the existing fields. In `sessionStore.ts`, both the default-state object and the merge helper need the three new lines.

In `syncEquippedToSession.ts`, the existing code reads `equipped.avatar` / `equipped.badge` / `equipped.name_color` from the inventory `EquippedView`. Add `equipped.frame` / `equipped.aura` / `equipped.banner` lines.

- [ ] **Step 2: Verify**

```bash
pnpm --filter web type-check
```

Expected: green.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/entities apps/web/src/shared/types apps/web/src/features/shop/lib
git commit -m "feat(web): session + leaderboard + game types carry equipped frame/aura/banner (ARC-730)"
```

### Task 2.2: Extend `useEquippedCosmetics`

**Files:**

- Modify: `apps/web/src/features/shop/hooks/useEquippedCosmetics.ts`
- Create: `apps/web/src/features/shop/hooks/useEquippedCosmetics.test.ts` (no test file exists today)

- [ ] **Step 1: Widen the `EquippedCosmetics` return type**

```ts
export interface EquippedCosmetics {
  avatarUrl: string | null;
  avatarItem: EffectiveShopItem | null;
  badgeUrl: string | null;
  badgeItem: EffectiveShopItem | null;
  nameColor: string | null;
  nameColorItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped frame ring. */
  frameColor: string | null;
  frameItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped aura halo. */
  auraColor: string | null;
  auraItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped banner backdrop. */
  bannerColor: string | null;
  bannerItem: EffectiveShopItem | null;
}
```

- [ ] **Step 2: Widen the args + resolution**

```ts
export function useEquippedCosmetics(args: {
  equippedAvatarId: string | null | undefined;
  equippedBadgeId: string | null | undefined;
  equippedNameColorId?: string | null | undefined;
  equippedFrameId?: string | null | undefined;
  equippedAuraId?: string | null | undefined;
  equippedBannerId?: string | null | undefined;
}): EquippedCosmetics {
  // ... existing avatar/badge/nameColor resolution unchanged
  const frame = args.equippedFrameId
    ? (catalogMap.get(args.equippedFrameId) ?? null)
    : null;
  const aura = args.equippedAuraId
    ? (catalogMap.get(args.equippedAuraId) ?? null)
    : null;
  const banner = args.equippedBannerId
    ? (catalogMap.get(args.equippedBannerId) ?? null)
    : null;
  return {
    // ... existing returns unchanged
    frameItem: frame,
    frameColor: frame?.colorValue ?? null,
    auraItem: aura,
    auraColor: aura?.colorValue ?? null,
    bannerItem: banner,
    bannerColor: banner?.colorValue ?? null,
  };
}
```

Don't forget to add the new ids to the `useMemo` deps.

- [ ] **Step 3: Test**

If no test file exists, create `apps/web/src/features/shop/hooks/useEquippedCosmetics.test.ts`:

```ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEquippedCosmetics } from './useEquippedCosmetics';
import * as catalogCache from '../lib/catalogCache';

vi.mock('../lib/catalogCache');

describe('useEquippedCosmetics', () => {
  beforeEach(() => {
    vi.mocked(catalogCache.loadCatalog).mockResolvedValue([
      {
        id: 'frame-1',
        category: 'frame',
        colorValue: '#abcdef',
        assetUrl: '' /* ...minimal stub */,
      } as never,
      {
        id: 'aura-1',
        category: 'aura',
        colorValue: 'linear-gradient(#1, #2)',
        assetUrl: '' /* ... */,
      } as never,
      {
        id: 'banner-1',
        category: 'banner',
        colorValue: '#0f172a',
        assetUrl: '' /* ... */,
      } as never,
    ]);
  });

  it('resolves frame/aura/banner colors from the catalog', async () => {
    const { result, rerender } = renderHook(() =>
      useEquippedCosmetics({
        equippedAvatarId: null,
        equippedBadgeId: null,
        equippedFrameId: 'frame-1',
        equippedAuraId: 'aura-1',
        equippedBannerId: 'banner-1',
      }),
    );
    // Hook starts with empty map; rerender after async resolve.
    await new Promise((r) => setTimeout(r, 0));
    rerender();
    expect(result.current.frameColor).toBe('#abcdef');
    expect(result.current.auraColor).toContain('linear-gradient');
    expect(result.current.bannerColor).toBe('#0f172a');
  });
});
```

- [ ] **Step 4: Run**

```bash
pnpm --filter web test useEquippedCosmetics
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/shop/hooks
git commit -m "feat(shop): useEquippedCosmetics resolves frame/aura/banner colors (ARC-730)"
```

---

## Phase 3 — Build `PlayerAvatar` (presentational) in `@arcadeum/ui`

### Task 3.1: Skeleton + types

**Files:**

- Create: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx`
- Create: `packages/ui/src/components/PlayerAvatar/index.ts`
- Modify: `packages/ui/src/index.ts` (re-export)

- [ ] **Step 1: Create the file skeleton**

```tsx
'use client';

import { memo } from 'react';
import { Stack, Text, View, YStack, styled } from 'tamagui';
import { Avatar } from '../Avatar/Avatar';

export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'card';

export interface PlayerAvatarProps {
  name: string;
  size?: PlayerAvatarSize;
  avatarUrl?: string | null;
  badgeUrl?: string | null;
  frameColor?: string | null;
  auraColor?: string | null;
  bannerColor?: string | null;
  nameColor?: string | null;
  level?: number | null;
  presenceLine?: string;
  priority?: boolean;
  'data-testid'?: string;
  onPress?: () => void;
}

const DISC_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 28,
  sm: 40,
  md: 72,
  card: 140,
};
const BADGE_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 14,
  md: 24,
  card: 36,
};
const RING_WIDTH: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 2,
  md: 3,
  card: 3,
};

function pickSwatchColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/#[0-9a-fA-F]{3,8}/);
  if (match) return match[0];
  return value.includes('gradient') ? null : value;
}

export const PlayerAvatar = memo(function PlayerAvatar(
  props: PlayerAvatarProps,
) {
  const size = props.size ?? 'sm';
  const disc = DISC_SIZE[size];
  // Implementation in subsequent steps.
  return (
    <Stack data-testid={props['data-testid']} onPress={props.onPress}>
      <Avatar
        name={props.name}
        src={props.avatarUrl ?? undefined}
        size="sm"
        priority={props.priority}
      />
    </Stack>
  );
});
```

- [ ] **Step 2: Wire exports**

`packages/ui/src/components/PlayerAvatar/index.ts`:

```ts
export { PlayerAvatar } from './PlayerAvatar';
export type { PlayerAvatarProps, PlayerAvatarSize } from './PlayerAvatar';
```

In `packages/ui/src/index.ts` add:

```ts
export * from './components/PlayerAvatar';
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @arcadeum/ui type-check
```

Expected: green.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar packages/ui/src/index.ts
git commit -m "feat(ui): PlayerAvatar component skeleton (ARC-730)"
```

### Task 3.2: TDD — composition behavior

**Files:**

- Create: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx`
- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx`

Follow the existing `Avatar.test.tsx` pattern (uses `@testing-library/react` + vitest + the package's Tamagui test setup).

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerAvatar } from './PlayerAvatar';

// Tamagui requires a config provider in package tests — reuse whatever the
// existing Avatar.test.tsx uses. Mirror its setup verbatim.

describe('PlayerAvatar', () => {
  it('renders the player name as initials when no avatar URL', () => {
    render(<PlayerAvatar name="Jane Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders the avatar image when avatarUrl is provided', () => {
    render(<PlayerAvatar name="Jane" avatarUrl="/x.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/x.png');
  });

  it('renders the badge at sm/md/card sizes but not at icon', () => {
    const { rerender } = render(
      <PlayerAvatar name="J" badgeUrl="/b.png" size="icon" data-testid="pa" />,
    );
    expect(screen.queryByTestId('pa-badge')).toBeNull();

    rerender(
      <PlayerAvatar name="J" badgeUrl="/b.png" size="sm" data-testid="pa" />,
    );
    expect(screen.getByTestId('pa-badge')).toBeInTheDocument();

    rerender(
      <PlayerAvatar name="J" badgeUrl="/b.png" size="card" data-testid="pa" />,
    );
    expect(screen.getByTestId('pa-badge')).toBeInTheDocument();
  });

  it('renders the frame ring at sm/md/card but not icon', () => {
    const { rerender } = render(
      <PlayerAvatar
        name="J"
        frameColor="#ff00ff"
        size="icon"
        data-testid="pa"
      />,
    );
    expect(screen.queryByTestId('pa-frame')).toBeNull();

    rerender(
      <PlayerAvatar name="J" frameColor="#ff00ff" size="md" data-testid="pa" />,
    );
    expect(screen.getByTestId('pa-frame')).toBeInTheDocument();
  });

  it('renders the aura halo at md/card only', () => {
    const { rerender } = render(
      <PlayerAvatar name="J" auraColor="#ff0" size="sm" data-testid="pa" />,
    );
    expect(screen.queryByTestId('pa-aura')).toBeNull();

    rerender(
      <PlayerAvatar name="J" auraColor="#ff0" size="md" data-testid="pa" />,
    );
    expect(screen.getByTestId('pa-aura')).toBeInTheDocument();
  });

  it('renders the banner backdrop, name label, and level only at card', () => {
    const { rerender } = render(
      <PlayerAvatar
        name="Jane"
        bannerColor="#0f0"
        level={42}
        size="md"
        data-testid="pa"
      />,
    );
    expect(screen.queryByTestId('pa-banner')).toBeNull();
    expect(screen.queryByTestId('pa-name')).toBeNull();

    rerender(
      <PlayerAvatar
        name="Jane"
        bannerColor="#0f0"
        level={42}
        size="card"
        data-testid="pa"
        presenceLine="Level 42"
      />,
    );
    expect(screen.getByTestId('pa-banner')).toBeInTheDocument();
    expect(screen.getByTestId('pa-name')).toHaveTextContent('Jane');
    expect(screen.getByText('Level 42')).toBeInTheDocument();
  });

  it('applies onPress as click handler', () => {
    const onPress = vi.fn();
    render(<PlayerAvatar name="J" onPress={onPress} data-testid="pa" />);
    screen.getByTestId('pa').click();
    expect(onPress).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar
```

Expected: most assertions fail (component is still the skeleton).

Implementation is split into three sub-steps so each TDD cycle is small:

- [ ] **Step 3a: Inner disc + frame ring** — make the disc-render, frame-ring, and initials-fallback tests pass. Leave badge/aura/banner/name as no-ops.

- [ ] **Step 3b: Badge + aura** — extend the disc with the badge corner and aura halo. Make the badge and aura tests pass.

- [ ] **Step 3c: Card chrome (banner + name + presence)** — make the card-only tests pass. Make `onPress` work.

Below is the full target composition for reference; apply it incrementally across 3a/3b/3c. Mirror the inset/zIndex layering from `ShopMannequinStage.tsx` lines 240-282.

```tsx
export const PlayerAvatar = memo(function PlayerAvatar({
  name,
  size = 'sm',
  avatarUrl,
  badgeUrl,
  frameColor,
  auraColor,
  bannerColor,
  nameColor,
  level,
  presenceLine,
  priority,
  'data-testid': testId,
  onPress,
}: PlayerAvatarProps) {
  const disc = DISC_SIZE[size];
  const badge = BADGE_SIZE[size];
  const ring = RING_WIDTH[size];
  const showBadge = size !== 'icon' && !!badgeUrl;
  const showFrame = size !== 'icon' && !!frameColor;
  const showAura = (size === 'md' || size === 'card') && !!auraColor;
  const showCardChrome = size === 'card';

  const ringStyle: React.CSSProperties = showFrame
    ? frameColor!.includes('gradient')
      ? {
          backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), ${frameColor}`,
          borderColor: pickSwatchColor(frameColor) ?? 'rgba(255,255,255,0.35)',
        }
      : { backgroundColor: `${frameColor}33`, borderColor: frameColor! }
    : {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.18)',
      };

  const auraSwatch = showAura
    ? (pickSwatchColor(auraColor) ?? 'rgba(96,165,250,0.45)')
    : null;

  const bannerStyle: React.CSSProperties | undefined =
    showCardChrome && bannerColor
      ? bannerColor.includes('gradient')
        ? { backgroundImage: bannerColor }
        : { backgroundColor: bannerColor }
      : undefined;

  // The image element should be ~75% of the disc so the ring is visible.
  const innerImage = Math.round(disc * 0.78);

  const inner = (
    <Stack
      width={disc}
      height={disc}
      borderRadius={disc / 2}
      alignItems="center"
      justifyContent="center"
      borderWidth={showFrame ? ring : 0}
      position="relative"
      style={{
        ...(showFrame ? ringStyle : {}),
        ...(auraSwatch
          ? { boxShadow: `0 0 ${disc * 0.4}px ${auraSwatch}` }
          : {}),
      }}
      data-testid={testId ? `${testId}-disc` : undefined}
    >
      {showFrame ? (
        <View
          position="absolute"
          inset={0}
          borderRadius={disc / 2}
          data-testid={testId ? `${testId}-frame` : undefined}
          pointerEvents="none"
        />
      ) : null}
      {showAura ? (
        <View
          position="absolute"
          inset={-Math.round(disc * 0.15)}
          borderRadius={disc}
          data-testid={testId ? `${testId}-aura` : undefined}
          pointerEvents="none"
        />
      ) : null}
      <Avatar
        name={name}
        src={avatarUrl ?? undefined}
        size="sm" // we override visual size with the wrapper
        priority={priority}
        style={{ width: innerImage, height: innerImage }}
      />
      {showBadge ? (
        <View
          position="absolute"
          bottom={-Math.round(badge * 0.2)}
          right={-Math.round(badge * 0.2)}
          width={badge}
          height={badge}
          borderRadius={badge / 2}
          backgroundColor="rgba(2,6,23,0.85)"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.20)"
          alignItems="center"
          justifyContent="center"
          data-testid={testId ? `${testId}-badge` : undefined}
        >
          <img
            src={badgeUrl!}
            alt=""
            width={Math.round(badge * 0.75)}
            height={Math.round(badge * 0.75)}
            style={{ objectFit: 'contain' }}
          />
        </View>
      ) : null}
    </Stack>
  );

  if (!showCardChrome) {
    return (
      <Stack
        data-testid={testId}
        onPress={onPress}
        cursor={onPress ? 'pointer' : 'default'}
      >
        {inner}
      </Stack>
    );
  }

  // Card chrome: banner backdrop, name, presence line.
  return (
    <YStack
      data-testid={testId}
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
      width={220}
      borderRadius="$5"
      paddingHorizontal="$4"
      paddingVertical="$4"
      alignItems="center"
      gap="$3"
      overflow="hidden"
      style={bannerStyle ?? { backgroundColor: 'rgba(15,23,42,0.55)' }}
    >
      {bannerStyle ? (
        <View
          data-testid={testId ? `${testId}-banner` : undefined}
          display="none"
        />
      ) : null}
      {inner}
      <YStack alignItems="center" gap={4}>
        <Text
          fontSize="$6"
          fontWeight="900"
          color={
            nameColor && !nameColor.includes('gradient') ? nameColor : '$white'
          }
          data-testid={testId ? `${testId}-name` : undefined}
          {...(nameColor && nameColor.includes('gradient')
            ? {
                style: {
                  background: nameColor,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                },
              }
            : {})}
        >
          {name}
        </Text>
        {presenceLine ? (
          <Text
            fontSize={10}
            letterSpacing={2}
            textTransform="uppercase"
            color="$gray11"
            fontWeight="700"
          >
            {presenceLine}
          </Text>
        ) : null}
      </YStack>
    </YStack>
  );
});
```

Notes for the implementer:

- Test-id sentinels are guarded by their corresponding prop being set (e.g., `pa-banner` only rendered when `bannerColor` is provided at `card` size). The tests assert presence/absence based on the same condition, so the guarded approach is correct.
- Reuse `Avatar` for the image disc; override its rendered size via the `style` prop (already supported by `Avatar`).
- `pickSwatchColor` mirrors the function in `ShopMannequinStage.tsx`. Phase 7 will deduplicate by importing the version from `PlayerAvatar` — for now, leave both inline.

- [ ] **Step 4: Run tests — expect green**

After each sub-step (3a, 3b, 3c):

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar
```

Expect the corresponding tests to flip from red → green incrementally. Common adjustments:

- If `data-testid="pa-frame"` isn't found, ensure the dedicated `<View data-testid={...}-frame>` renders inside the `showFrame` branch (only rendered when `frameColor` is provided AND size is not `icon`).
- If `data-testid="pa-banner"` isn't found, verify the sentinel `<View>` is inside the `showCardChrome` branch and gated on `bannerColor` being set.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar
git commit -m "feat(ui): PlayerAvatar composes frame/aura/badge/banner/name across 4 sizes (ARC-730)"
```

### Task 3.3: Storybook

**Files:**

- Create: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.stories.tsx`

- [ ] **Step 1: Mirror `Avatar.stories.tsx`**

Read `packages/ui/src/components/Avatar/Avatar.stories.tsx` first to pick up the Meta/StoryObj pattern, decorators, and any required Tamagui provider. Then create the new file with at minimum the following stories:

- `Icon`, `Sm`, `Md`, `Card` — one per size
- `FullyDecked` — card size with frame + aura + badge + banner + nameColor + level
- `LoadingFromCatalog` — no URLs set (initials only) to demo the resolved-null state

Each story should be a 1-2 prop assignment. Keep file under ~120 lines.

- [ ] **Step 2: Verify the package's Storybook builds (if `storybook:build` is wired)**

```bash
pnpm --filter @arcadeum/ui build 2>&1 | tail -20
```

Expected: typecheck passes; Storybook story file does not need to render at build time.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar/PlayerAvatar.stories.tsx
git commit -m "test(ui): PlayerAvatar Storybook stories (ARC-730)"
```

---

## Phase 4 — Build `EquippedPlayerAvatar` (connected) in web

### Task 4.1: Create the connected wrapper

**Files:**

- Create: `apps/web/src/shared/ui/PlayerAvatar/EquippedPlayerAvatar.tsx`
- Create: `apps/web/src/shared/ui/PlayerAvatar/index.ts`
- Create: `apps/web/src/shared/ui/PlayerAvatar/EquippedPlayerAvatar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EquippedPlayerAvatar } from './EquippedPlayerAvatar';
import * as hook from '@/features/shop/hooks/useEquippedCosmetics';

vi.mock('@/features/shop/hooks/useEquippedCosmetics');

describe('EquippedPlayerAvatar', () => {
  it('passes resolved urls/colors to PlayerAvatar', () => {
    vi.mocked(hook.useEquippedCosmetics).mockReturnValue({
      avatarUrl: '/a.png',
      avatarItem: null,
      badgeUrl: '/b.png',
      badgeItem: null,
      nameColor: '#fff',
      nameColorItem: null,
      frameColor: '#ff0',
      frameItem: null,
      auraColor: '#0ff',
      auraItem: null,
      bannerColor: '#f0f',
      bannerItem: null,
    });
    render(
      <EquippedPlayerAvatar
        name="Jane"
        size="card"
        equippedAvatarId="a-1"
        equippedBadgeId="b-1"
        equippedFrameId="f-1"
        equippedAuraId="au-1"
        equippedBannerId="bn-1"
        data-testid="epa"
      />,
    );
    expect(screen.getByTestId('epa-banner')).toBeInTheDocument();
    expect(screen.getByTestId('epa-name')).toHaveTextContent('Jane');
  });

  it('falls back to fallbackAvatarUrl when catalog returns null', () => {
    vi.mocked(hook.useEquippedCosmetics).mockReturnValue({
      avatarUrl: null,
      avatarItem: null,
      badgeUrl: null,
      badgeItem: null,
      nameColor: null,
      nameColorItem: null,
      frameColor: null,
      frameItem: null,
      auraColor: null,
      auraItem: null,
      bannerColor: null,
      bannerItem: null,
    });
    render(
      <EquippedPlayerAvatar
        name="Jane"
        equippedAvatarId={null}
        equippedBadgeId={null}
        fallbackAvatarUrl="/legacy.png"
        data-testid="epa"
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', '/legacy.png');
  });
});
```

- [ ] **Step 2: Implementation**

`EquippedPlayerAvatar.tsx`:

```tsx
'use client';

import { memo } from 'react';
import { PlayerAvatar, type PlayerAvatarSize } from '@arcadeum/ui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';

export interface EquippedPlayerAvatarProps {
  name: string;
  size?: PlayerAvatarSize;
  equippedAvatarId: string | null | undefined;
  equippedBadgeId: string | null | undefined;
  equippedNameColorId?: string | null | undefined;
  equippedFrameId?: string | null | undefined;
  equippedAuraId?: string | null | undefined;
  equippedBannerId?: string | null | undefined;
  fallbackAvatarUrl?: string;
  level?: number | null;
  presenceLine?: string;
  priority?: boolean;
  'data-testid'?: string;
  onPress?: () => void;
}

export const EquippedPlayerAvatar = memo(function EquippedPlayerAvatar(
  props: EquippedPlayerAvatarProps,
) {
  const cosmetics = useEquippedCosmetics({
    equippedAvatarId: props.equippedAvatarId,
    equippedBadgeId: props.equippedBadgeId,
    equippedNameColorId: props.equippedNameColorId,
    equippedFrameId: props.equippedFrameId,
    equippedAuraId: props.equippedAuraId,
    equippedBannerId: props.equippedBannerId,
  });
  return (
    <PlayerAvatar
      name={props.name}
      size={props.size}
      avatarUrl={cosmetics.avatarUrl ?? props.fallbackAvatarUrl ?? null}
      badgeUrl={cosmetics.badgeUrl}
      frameColor={cosmetics.frameColor}
      auraColor={cosmetics.auraColor}
      bannerColor={cosmetics.bannerColor}
      nameColor={cosmetics.nameColor}
      level={props.level}
      presenceLine={props.presenceLine}
      priority={props.priority}
      data-testid={props['data-testid']}
      onPress={props.onPress}
    />
  );
});
```

`index.ts`:

```ts
export { EquippedPlayerAvatar } from './EquippedPlayerAvatar';
export type { EquippedPlayerAvatarProps } from './EquippedPlayerAvatar';
```

- [ ] **Step 3: Run tests**

```bash
pnpm --filter web test EquippedPlayerAvatar
```

Expected: green.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/shared/ui/PlayerAvatar
git commit -m "feat(web): EquippedPlayerAvatar resolves equipped ids and renders PlayerAvatar (ARC-730)"
```

---

## Phase 5 — Additive `senderAvatar` slot on `ChatMessage`

### Task 5.1: Add the slot

**Files:**

- Modify: `packages/ui/src/components/Chat/ChatMessage.tsx`
- Modify: `packages/ui/src/components/Chat/ChatMessage.stories.tsx` (add a story using the slot)

- [ ] **Step 1: Extend `ChatMessageProps`**

Add `senderAvatar?: ReactNode` after the existing `avatarUrl?` / `badgeUrl?` props (keep those for backward compatibility, with a JSDoc note marking them deprecated in favor of `senderAvatar`).

- [ ] **Step 2a: Audit the existing render**

Open `packages/ui/src/components/Chat/ChatMessage.tsx` and read lines 149-200. Note the exact JSX of the inline `<Avatar>` + badge block in both branches. The legacy fallback in step 2b MUST be byte-equivalent (same `<Avatar>` props, same `<View width=16>`, same `<img style={{ objectFit: 'contain' }} />`) so no migrated-yet caller regresses.

- [ ] **Step 2b: Render the slot**

In both the `!isOwn && !isSystem` and `isOwn && !isSystem` branches, wrap the existing inline `<Avatar ...>` + badge `<View>` block in a conditional that prefers `senderAvatar`:

```tsx
{
  senderAvatar ?? (
    <>
      <Avatar name={senderName} size="sm" src={avatarUrl} />
      {badgeUrl ? (
        <View width={16} height={16}>
          <img
            src={badgeUrl}
            alt=""
            width={16}
            height={16}
            style={{ objectFit: 'contain' }}
          />
        </View>
      ) : null}
    </>
  );
}
```

So existing callers that pass `avatarUrl` + `badgeUrl` continue to work; new callers pass a `senderAvatar={<EquippedPlayerAvatar ... />}` and the legacy block is skipped.

- [ ] **Step 3: Add a story**

In `ChatMessage.stories.tsx`, add a `WithSenderAvatarSlot` story that passes a placeholder ReactNode in `senderAvatar`.

- [ ] **Step 4: Verify**

```bash
pnpm --filter @arcadeum/ui test ChatMessage
pnpm --filter @arcadeum/ui type-check
```

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/Chat
git commit -m "feat(ui): ChatMessage adds optional senderAvatar slot (ARC-730)"
```

---

## Phase 6 — Migrate call sites

> Each task in this phase: replace the existing `<Avatar src={avatarUrl}>` + sibling badge `<View>/<Image>` + separate name-color application with a single `<EquippedPlayerAvatar ... />` (or for `ChatMessage` consumers, pass `senderAvatar={<EquippedPlayerAvatar ... />}`). Pass through any new equipped-id fields. Keep the existing `useEquippedCosmetics` calls where they're used to derive things other than what `EquippedPlayerAvatar` handles (e.g., gradient name color for the surrounding `<Text>` — but if the surrounding text is now inside `EquippedPlayerAvatar size="card">`, drop the duplicate hook call).

For every task in this phase, run `pnpm --filter web type-check` after the edit and commit only when green.

### Task 6.1: Locale chat — `ChatPage.tsx`

**Files:** `apps/web/src/app/[locale]/chat/ChatPage.tsx`

- [ ] **Step 1:** In `ChatMessageRow`, build the avatar:
  ```tsx
  const senderAvatar = (
    <EquippedPlayerAvatar
      name={msg.senderUsername}
      size="sm"
      equippedAvatarId={msg.senderEquippedAvatarId}
      equippedBadgeId={msg.senderEquippedBadgeId}
      equippedNameColorId={msg.senderEquippedNameColorId}
      equippedFrameId={msg.senderEquippedFrameId}
      equippedAuraId={msg.senderEquippedAuraId}
      equippedBannerId={msg.senderEquippedBannerId}
    />
  );
  ```
  and pass it to `<ChatMessage senderAvatar={senderAvatar} ... />`. Remove the now-redundant `useEquippedCosmetics` call and `avatarUrl`/`badgeUrl` props (keep `senderColor`/`senderNameStyle` until visible name-color rendering moves into PlayerAvatar at sm size — not done in this PR, so leave them).
  Extend `ChatMessageData` (locate its declaration via `grep` — likely in `features/chat/api.ts` or similar) to include the three new optional fields.
- [ ] **Step 2:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/app/[locale]/chat apps/web/src/features/chat
  git commit -m "refactor(chat): use EquippedPlayerAvatar in locale chat (ARC-730)"
  ```

### Task 6.2: In-game chat — `GameChat.tsx` + `ChatMessageBubble.tsx` + `ChatMessagePopup.tsx`

**Files:**

- Modify: `apps/web/src/widgets/GameChat/ui/GameChat.tsx` (`EquippedResolver` type + `GameChatRow`)
- Modify: `apps/web/src/widgets/GameChat/ui/ChatMessageBubble.tsx`
- Modify: `apps/web/src/widgets/GameChat/ui/ChatMessagePopup.tsx`

- [ ] **Step 1:** Widen `EquippedResolver` to also return frame/aura/banner ids; widen `GamePageLayout.resolveEquipped` (`apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx`) to populate them.
- [ ] **Step 2:** In `GameChatRow`, replace the inline hook + ChatMessage avatar props with `senderAvatar={<EquippedPlayerAvatar ... />}`.
- [ ] **Step 3:** In `ChatMessageBubble`, replace the manual `<View><Image>` avatar disc + badge inline block with `<EquippedPlayerAvatar size="sm" ... />`. Keep the surrounding bubble layout. The sender-name `<Text>` keeps its `nameColorRenderProps` derivation for now (sm doesn't render the name through PlayerAvatar).
- [ ] **Step 4:** In `ChatMessagePopup`, add the three new props and forward them down to `ChatMessageBubble`.
- [ ] **Step 5:** typecheck + run game-chat tests
  ```bash
  pnpm --filter web type-check
  pnpm --filter web test GameChat
  ```
- [ ] **Step 6:** Commit
  ```bash
  git add apps/web/src/widgets/GameChat apps/web/src/app/[locale]/games/rooms
  git commit -m "refactor(games): in-game chat uses EquippedPlayerAvatar (ARC-730)"
  ```

### Task 6.3: Leaderboards — `RankTable.tsx`

**Files:** `apps/web/src/app/[locale]/leaderboards/_components/RankTable.tsx`

- [ ] **Step 1:** Replace the `<Avatar src={avatarUrl ?? p.avatarUrl ?? undefined}>` + separate badge `<Image>` block with:
  ```tsx
  <EquippedPlayerAvatar
    name={p.name}
    size="sm"
    equippedAvatarId={p.equippedAvatarId}
    equippedBadgeId={p.equippedBadgeId}
    equippedNameColorId={p.equippedNameColorId}
    equippedFrameId={p.equippedFrameId}
    equippedAuraId={p.equippedAuraId}
    equippedBannerId={p.equippedBannerId}
    fallbackAvatarUrl={p.avatarUrl ?? undefined}
    priority={priority}
  />
  ```
  Keep the surrounding name `<Text>` with its `nameColorRenderProps` since the name is outside PlayerAvatar at sm. Drop the inline badge `<View>` (PlayerAvatar renders it now).
- [ ] **Step 2:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/app/[locale]/leaderboards
  git commit -m "refactor(leaderboards): use EquippedPlayerAvatar in RankTable (ARC-730)"
  ```

### Task 6.4: Player profile — `PlayerProfileClient.tsx`

**Files:** `apps/web/src/app/[locale]/players/[id]/PlayerProfileClient.tsx`

- [ ] **Step 1:** Replace the `<Avatar size="xl" src={avatarUrl ?? undefined}>` and the inline badge `<View><Image>` with `<EquippedPlayerAvatar size="md" ... />`. (Size `md` is intentionally chosen — the profile hero already has its own surrounding name/level chrome; we don't want to double-render.)
      Pass all six equipped ids and the player's `avatarUrl` as `fallbackAvatarUrl`.
- [ ] **Step 2:** Extend `PlayerProfile` type to include the new ids (the BE payload now carries them).
- [ ] **Step 3:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/app/[locale]/players
  git commit -m "refactor(players): profile hero uses EquippedPlayerAvatar (ARC-730)"
  ```

### Task 6.5: Header menus — `ProfileMenu.tsx` + `MobileMenu.tsx`

**Files:**

- `apps/web/src/widgets/header/ui/ProfileMenu.tsx`
- `apps/web/src/widgets/header/ui/MobileMenu.tsx`

- [ ] **Step 1:** Replace `<Avatar size="md">` with `<EquippedPlayerAvatar size="md" ... />` reading from `useSessionStore` (or whatever snapshot is already used at line ~52 of ProfileMenu). Forward all six new equipped-id fields from the session snapshot.
- [ ] **Step 2:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/widgets/header
  git commit -m "refactor(header): profile + mobile menu use EquippedPlayerAvatar (ARC-730)"
  ```

### Task 6.6: Games — RoomCard + sea-battle lobby

**Files:**

- `apps/web/src/app/[locale]/games/RoomCardComponent.tsx`
- `apps/web/src/features/games/sea-battle/lobby/TeamSlotsBoard.tsx`
- `apps/web/src/features/games/sea-battle/lobby/UnassignedPool.tsx`
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx` (mapper into Player)

- [ ] **Step 1:** Each `<Avatar>` consuming `member` or `player` props swaps to `<EquippedPlayerAvatar>` with all six equipped-id fields read from the source object. Use `size="icon"` for tight tile contexts (RoomCard member row, UnassignedPool) and `size="sm"` for `TeamSlotsBoard` slots. Extend `Player` type in `apps/web/src/shared/types/games.ts` if not already.
- [ ] **Step 2:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/app/[locale]/games apps/web/src/features/games apps/web/src/widgets/SeaBattleGame
  git commit -m "refactor(games): room card + sea-battle lobby use EquippedPlayerAvatar (ARC-730)"
  ```

### Task 6.7: Chat list page

**Files:** `apps/web/src/app/[locale]/chats/ChatListPage.tsx`

- [ ] **Step 1:** Each `<Avatar>` in chat list rows (lines 154 and 231) swaps to `<EquippedPlayerAvatar size="icon" ... />`. The 231 site uses the chat `title` as `name` and may not have equipped ids — pass `equippedAvatarId={null}` etc., and it will fall back to initials.
- [ ] **Step 2:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/app/[locale]/chats
  git commit -m "refactor(chats): chat list uses EquippedPlayerAvatar (ARC-730)"
  ```

### Task 6.8: History modal + stats leaderboard

**Files:**

- `apps/web/src/app/[locale]/history/components/HistoryDetailModal.tsx`
- `apps/web/src/app/[locale]/stats/components/Leaderboard.tsx`

- [ ] **Step 1:** Each `<Avatar>` swap. Use `sm` for the modal player list, `md` for the stats leaderboard's hero row (today `lg` — promote to `md` via PlayerAvatar for parity).
- [ ] **Step 2:** typecheck + commit
  ```bash
  pnpm --filter web type-check
  git add apps/web/src/app/[locale]/history apps/web/src/app/[locale]/stats
  git commit -m "refactor(web): history modal + stats leaderboard use EquippedPlayerAvatar (ARC-730)"
  ```

---

## Phase 7 — Refactor `ShopMannequinStage` to use `PlayerAvatar`

### Task 7.1: Extract composition

**Files:**

- Modify: `apps/web/src/features/shop/ui/ShopMannequinStage.tsx`
- Modify: `apps/web/src/features/shop/ui/ShopMannequinStage.test.tsx` (if exists)

- [ ] **Step 1:** Replace the inline avatar disc + frame ring + aura halo + badge corner + name + level stack (lines 240-307 of the current file) with a single `<PlayerAvatar size="card">` instance. The `TryOnTag`, `SkinChip`, and `RaysLayer` chrome stays. Wire `preview.*` items into `PlayerAvatar` props.
- [ ] **Step 1b:** Delete the local `pickSwatchColor` helper (`ShopMannequinStage.tsx` lines 86-91) — its callers (`accentGlow`, `frameStyle`) move into PlayerAvatar, so the helper becomes dead. If `accentGlow` is still needed for the `RaysLayer` chrome, derive it from `aura?.colorValue` directly using a tiny inline regex match (it doesn't justify a shared helper for one caller).
- [ ] **Step 2:** typecheck + run any existing shop preview test
  ```bash
  pnpm --filter web type-check
  pnpm --filter web test ShopMannequinStage
  ```
- [ ] **Step 3:** Commit
  ```bash
  git add apps/web/src/features/shop/ui/ShopMannequinStage.tsx
  git commit -m "refactor(shop): ShopMannequinStage uses shared PlayerAvatar (ARC-730)"
  ```

---

## Phase 8 — Final verification + PR

### Task 8.1: Whole-repo lint + typecheck + test

- [ ] **Step 1:** Lint + typecheck
  ```bash
  pnpm lint
  pnpm --filter be type-check
  pnpm --filter web type-check
  pnpm --filter @arcadeum/ui type-check
  ```
- [ ] **Step 2:** Unit tests
  ```bash
  pnpm --filter be test
  pnpm --filter web test
  pnpm --filter @arcadeum/ui test
  ```
- [ ] **Step 3:** File-length check
  ```bash
  pnpm check-file-length
  ```
- [ ] **Step 4:** If anything fails, fix and commit as part of the relevant phase. Do not bundle fixes into a single "fix lint" commit unless the issues are trivial formatter results.

### Task 8.2: Manual smoke (web dev server)

- [ ] **Step 1:** Start the dev server
  ```bash
  pnpm dev --filter web
  ```
- [ ] **Step 2:** With a user who has equipped frame/aura/banner items in the shop, visually verify:
  - Locale chat shows the composed avatar in the message header
  - In-game chat (sea battle room) — open the chat panel and confirm composition
  - Leaderboards row shows frame ring on equipped users
  - Profile page hero shows frame + aura + badge
  - Header `ProfileMenu` shows the composed avatar
  - Shop "Try On" still works (regression check on ShopMannequinStage)
- [ ] **Step 3:** Record findings; if anything looks wrong, file under the relevant phase and fix.

### Task 8.3: Playwright e2e (light touch)

- [ ] **Step 1:** Open the canonical chat spec at `apps/web/e2e/chat.spec.ts` (the one stabilized in commit `acaef362`). If that path doesn't exist, `find apps/web -name "chat*.spec.ts"` and pick the most recent.
- [ ] **Step 2:** Inside an existing test that has a user with an equipped frame seeded, add an assertion that the composed avatar's frame sentinel is present:
  ```ts
  await expect(page.locator('[data-testid$="-frame"]').first()).toBeVisible();
  ```
  This verifies actual composition, not just that an avatar element rendered.
- [ ] **Step 3:** Run the spec
  ```bash
  pnpm e2e --filter web -- --grep "chat"
  ```
- [ ] **Step 4:** Commit
  ```bash
  git add apps/web/e2e
  git commit -m "test(e2e): chat avatar composition smoke (ARC-730)"
  ```

### Task 8.4: Open the PR

- [ ] **Step 1:** Push the branch
  ```bash
  git push -u origin ARC-730
  ```
- [ ] **Step 2:** Use the `/pr-description` skill to draft the body, then:

  ```bash
  gh pr create --base develop --title "feat(ui): PlayerAvatar — composed equipped cosmetics across the app (ARC-730)" --body "$(cat <<'EOF'
  ## Summary
  - New `PlayerAvatar` in `@arcadeum/ui` composes avatar + badge + frame + aura + banner + name color in 4 sizes.
  - `EquippedPlayerAvatar` wrapper in `apps/web/src/shared/ui/PlayerAvatar/` resolves equipped ids via the shop catalog.
  - BE payload builders (auth, chat, room members, history, leaderboards) now surface `equippedFrameId` / `equippedAuraId` / `equippedBannerId` (schema already had the fields).
  - Migrated chat, in-game chat, leaderboards, player profile, header menus, sea-battle lobby, history modal, stats leaderboard, and chat list to the new component. `ShopMannequinStage` refactored to consume it.

  ## Test plan
  - [ ] BE unit tests pass (auth, chat-helper, leaderboards, history, room mapper)
  - [ ] Web unit tests pass (PlayerAvatar, EquippedPlayerAvatar, useEquippedCosmetics)
  - [ ] @arcadeum/ui Storybook builds
  - [ ] Manual smoke: equipped frame/aura/banner items render in chat, leaderboards, profile, header menu
  - [ ] Shop "Try On" still works after the ShopMannequinStage refactor

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

- [ ] **Step 3:** Return the PR URL to the user.

---

## Risk notes

- `pnpm --filter web type-check` is the canary throughout phase 6 — any missed equipped-id wiring in BE → FE plumbing surfaces there.
- The presentational `PlayerAvatar` test relies on Tamagui's render configuration. If the new test file fails to render at all (provider-missing), mirror the exact provider used by `Avatar.test.tsx` — same package, same setup, no special tricks.
- The `ChatMessage` slot stays backward compatible; if any callers slip through phase 6 without being migrated, they'll still work via the legacy `avatarUrl`/`badgeUrl` path.
