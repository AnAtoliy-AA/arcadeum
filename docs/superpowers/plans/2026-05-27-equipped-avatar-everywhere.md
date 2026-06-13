# Equipped Avatar Everywhere — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-05-27-equipped-avatar-everywhere-design.md`](../specs/2026-05-27-equipped-avatar-everywhere-design.md)

**Goal:** A single shared `PlayerAvatar` component that renders all equipped cosmetic layers (frame ring, aura halo with rays, banner backdrop, badge, name color, game-skin chip) at any size, and use it everywhere a player avatar appears — including the shop preview, which becomes a thin wrapper around it.

**Architecture:**

- Add new size `profile` and richer visual layers to `@arcadeum/ui` `PlayerAvatar` (rays halo, skin chip, banner card, gradient frame handling), gated by size + props so the small render path stays cheap.
- Add `equippedGameSkinId` to the BE user schema + auth + chat + shop equip pipeline.
- Thread `equippedGameSkinId` through `useEquippedCosmetics` and `EquippedPlayerAvatar` so the chip surfaces wherever the avatar renders.
- Rewrite `ShopMannequinStage` as a thin adapter around `<PlayerAvatar size="profile" />` with the shop's "TRY-ON" hover tag fed in via a new `topLeftOverlay` prop.

**Tech Stack:** TypeScript, Next.js 15, React 19, Tamagui (`@arcadeum/ui`), Vitest + Testing Library (web/ui), NestJS + Mongoose (BE), Jest (BE).

---

## Branch state

The branch `ARC-755-equipped-avatar-everywhere` is checked out from `develop` and contains the spec commit (`eb044ec1`). All tasks below add to this branch.

Run all commands from the repo root (`/Users/anatoliyaliaksandrau/js/arcadeum_claude`).

---

## File map

### Created

- _(none — every new piece extends an existing file)_

### Modified — `packages/ui`

- `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx` — add `profile` size, `skinChip`, `rarityGlow`, `topLeftOverlay` props; add rays halo + skin chip + gradient frame logic.
- `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx` — new cases for rays, skin chip, profile size, gradient frame, rarity glow.
- `packages/ui/src/components/PlayerAvatar/PlayerAvatar.stories.tsx` — add `Profile` and `WithSkinChip` stories; add `profile` to argTypes.

### Modified — `apps/web` (web FE)

- `apps/web/src/features/shop/hooks/useEquippedCosmetics.ts` — accept `equippedGameSkinId`, return `skinItem` + `skinChip`.
- `apps/web/src/features/shop/hooks/useEquippedCosmetics.test.ts` — add skin resolution case.
- `apps/web/src/shared/ui/PlayerAvatar/EquippedPlayerAvatar.tsx` — accept + pass through `equippedGameSkinId` and `skinChip`.
- `apps/web/src/shared/ui/PlayerAvatar/EquippedPlayerAvatar.test.tsx` — assert skin chip prop propagation.
- `apps/web/src/features/shop/ui/ShopMannequinStage.tsx` — rewrite as a thin adapter over `<PlayerAvatar size="profile" />`.
- `apps/web/src/features/shop/ui/ShopMannequinStage.test.tsx` — update assertions to match the adapter's emitted DOM.
- `apps/web/src/features/shop/ui/ShopMannequinStage.module.css` — delete (no longer imported); rays styling now lives inside `PlayerAvatar`.
- `apps/web/src/widgets/header/ui/ProfileMenu.tsx` — pass `equippedGameSkinId` from session user; switch the expanded panel avatar to `size="card"`.
- `apps/web/src/widgets/header/ui/MobileMenu.tsx` — same: pass `equippedGameSkinId`.
- `apps/web/src/app/[locale]/players/[id]/PlayerProfileClient.tsx` — pass `equippedGameSkinId` (when payload type supports it) and switch header avatar to `size="profile"`.
- `apps/web/src/app/[locale]/players/[id]/types.ts` (or equivalent) — add `equippedGameSkinId?: string | null` to player profile payload type.

### Modified — `apps/be`

- `apps/be/src/auth/schemas/user.schema.ts` — `@Prop equippedGameSkinId?: string | null`.
- `apps/be/src/auth/lib/types.ts` — `equippedGameSkinId?` on `AuthUserProfile`.
- `apps/be/src/auth/auth.service.ts` — include `equippedGameSkinId` in `buildAuthUserProfile`.
- `apps/be/src/shop/services/inventory.service.ts` — add `equippedGameSkinId` to `LeanUser`, projection, and `equippedFromUser` (replace `game_skin: null`).
- `apps/be/src/shop/services/shop.service.ts` — add `equippedGameSkinId` to `LeanUser`, projection, and `equippedFromUser`.
- `apps/be/src/shop/lib/shop-types.ts` — extend `EquipKey` and `equipKeyFor` with `game_skin → equippedGameSkinId`.
- `apps/be/src/chat/chat-helper.service.ts` — include `equippedGameSkinId` in user select + `equippedLookup` + outbound message snapshot field (`senderEquippedGameSkinId`).
- BE tests for any of the above that have existing specs (lookup with grep).

---

## Task 1: Extend `PlayerAvatar` — add `profile` size

**Files:**

- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx`
- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx`

The new `profile` size is the largest variant (disc 200, banner card wrapper) — it's the parity target for the shop preview. We add it first, without the new visual layers, so subsequent tasks have a place to plug them in.

- [ ] **Step 1: Write the failing test**

Append to `PlayerAvatar.test.tsx`:

```tsx
it('renders banner sentinel, name label, and presence line at profile size', () => {
  render(
    <PlayerAvatar
      name="Jane"
      bannerColor="#0f0"
      presenceLine="Level 99"
      size="profile"
      data-testid="pa"
    />,
  );
  expect(screen.getByTestId('pa-banner')).toBeInTheDocument();
  expect(screen.getByTestId('pa-name')).toHaveTextContent('Jane');
  expect(screen.getByText('Level 99')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run
```

Expected: the new test fails (no `profile` size; falls through and renders no banner sentinel).

- [ ] **Step 3: Add `profile` to the type union and size maps**

In `PlayerAvatar.tsx`:

```ts
export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'lg' | 'card' | 'profile';

const DISC_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 28,
  sm: 40,
  md: 72,
  lg: 140,
  card: 140,
  profile: 200,
};
const BADGE_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 14,
  md: 24,
  lg: 36,
  card: 36,
  profile: 52,
};
const RING_WIDTH: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 2,
  md: 3,
  lg: 3,
  card: 3,
  profile: 4,
};
```

Update the `showCardChrome` derived flag so the banner wrapper renders for both `card` and `profile`:

```ts
const showCardChrome = size === 'card' || size === 'profile';
```

And when `size === 'profile'`, set the wrapper width to `'100%'` instead of `220`:

```ts
width={size === 'profile' ? '100%' : 220}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run
```

Expected: all `PlayerAvatar` tests pass (8/8 or 9/9 depending on count).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx
git commit -m "feat(ui): add profile size to PlayerAvatar (ARC-755)"
```

---

## Task 2: Gradient-aware frame ring

**Files:**

- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx`
- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx`

The existing `PlayerAvatar` already accepts `frameColor` and renders the ring, but its gradient handling is minimal. We bring in the same hex/gradient branching the shop preview uses (low-alpha tint on hex, dark-wash composite on gradient).

The existing `ringHexBackground` derivation already does this. **Verify** it matches the shop's `frameStyle` (low-alpha tint at `${value}33` + first-hex border for hex; `linear-gradient(rgba(15,23,42,0.55),...)`composite + first-hex border for gradient). If it differs, align it.

- [ ] **Step 1: Write the failing test**

```tsx
it('uses low-alpha hex tint + full border for solid frame color', () => {
  render(
    <PlayerAvatar name="J" frameColor="#ff00ff" size="md" data-testid="pa" />,
  );
  const disc = screen.getByTestId('pa-disc');
  expect(disc.style.backgroundColor || disc.style.background).toMatch(
    /#ff00ff33|rgba\(255,\s*0,\s*255,\s*0\.2\)/i,
  );
  expect(disc.style.borderColor).toMatch(/#ff00ff/i);
});

it('uses dark wash composite + first-hex border for gradient frame', () => {
  render(
    <PlayerAvatar
      name="J"
      frameColor="linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)"
      size="md"
      data-testid="pa"
    />,
  );
  const disc = screen.getByTestId('pa-disc');
  expect(disc.style.backgroundImage).toContain('rgba(15,23,42,0.55)');
  expect(disc.style.backgroundImage).toContain('linear-gradient(135deg');
  expect(disc.style.borderColor).toMatch(/#22d3ee/i);
});
```

If `pa-disc` testid doesn't currently exist, add it inside the inner `YStack` in `PlayerAvatar.tsx`:

```tsx
data-testid={testId ? `${testId}-disc` : undefined}
```

(It already exists — confirm by grep.)

- [ ] **Step 2: Run the tests, confirm they fail**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run -t "frame"
```

Expected: at least one of the new frame cases fails (existing logic uses `${frameColor}33` for hex; gradient composite path may differ from the shop's exact value).

- [ ] **Step 3: Replace `ringHexBackground` with the shop's exact logic**

Inside `PlayerAvatar.tsx`, find the `ringHexBackground` derivation and replace with:

```ts
const ringHexBackground: React.CSSProperties = showFrame
  ? isGradient(frameColor)
    ? {
        backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), ${frameColor}`,
        borderColor: pickSwatchColor(frameColor) ?? 'rgba(255,255,255,0.35)',
      }
    : {
        backgroundColor: `${frameColor}33`,
        borderColor: frameColor as string,
      }
  : {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderColor: 'rgba(255,255,255,0.18)',
    };
```

(This is already what the component does today — the test exists to lock it in.)

- [ ] **Step 4: Run the tests, confirm they pass**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx
git commit -m "test(ui): lock in gradient-aware frame rendering on PlayerAvatar (ARC-755)"
```

---

## Task 3: Rays halo layer

**Files:**

- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx`
- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx`

Bring the conic-gradient 12-ray halo from the shop into `PlayerAvatar`. The rays render under the disc, above the banner backdrop, at `md`/`lg`/`card`/`profile`. Color comes from `auraColor` (preferred) → `rarityGlow` prop (fallback) → off when both are null.

**Per the spec, the halo is static.** No animation. The shop's existing rotation in `ShopMannequinStage.module.css` is dropped — acceptable per spec non-goal "Animating the rays."

- [ ] **Step 1: Write the failing test**

```tsx
it('renders the rays layer at md+ when aura is set', () => {
  render(<PlayerAvatar name="J" auraColor="#ff0" size="md" data-testid="pa" />);
  expect(screen.getByTestId('pa-rays')).toBeInTheDocument();
});

it('renders the rays layer at md+ using rarityGlow when aura is absent', () => {
  render(
    <PlayerAvatar
      name="J"
      rarityGlow="rgba(168,85,247,0.26)"
      size="md"
      data-testid="pa"
    />,
  );
  expect(screen.getByTestId('pa-rays')).toBeInTheDocument();
});

it('does not render the rays layer at sm', () => {
  render(<PlayerAvatar name="J" auraColor="#ff0" size="sm" data-testid="pa" />);
  expect(screen.queryByTestId('pa-rays')).toBeNull();
});

it('does not render the rays layer when neither aura nor rarityGlow set', () => {
  render(<PlayerAvatar name="J" size="md" data-testid="pa" />);
  expect(screen.queryByTestId('pa-rays')).toBeNull();
});
```

- [ ] **Step 2: Run the tests, confirm they fail**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run -t "rays"
```

Expected: all four new cases fail (no `pa-rays` element exists yet).

- [ ] **Step 3: Add the `rarityGlow` prop and rays subcomponent**

In `PlayerAvatar.tsx`:

(a) Add `rarityGlow` to `PlayerAvatarProps`:

```ts
/** Fallback halo color when no aura is set. Hex/rgba string. */
rarityGlow?: string | null;
```

(b) Add a `showRays` derived flag near the other `show*` flags:

```ts
const showRays =
  (size === 'md' || size === 'lg' || size === 'card' || size === 'profile') &&
  (!!auraColor || !!rarityGlow);
```

(c) Compute the rays color (aura wins over rarityGlow):

```ts
const raysColor = pickSwatchColor(auraColor ?? null) ?? rarityGlow ?? null;
```

(d) Inline the 12-spike conic gradient builder (lifted from `ShopMannequinStage.tsx:155-177`). Note: `PlayerAvatar.tsx` currently imports only `memo` from `react`; add `useMemo` to the same import line.

```ts
const raysBg = useMemo<React.CSSProperties | null>(() => {
  if (!raysColor) return null;
  const stops: string[] = [];
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const peak = (i * 360) / steps;
    const valley = peak + 360 / steps / 2;
    stops.push(`${raysColor} ${peak}deg`);
    stops.push(`transparent ${valley}deg`);
  }
  stops.push(`${raysColor} 360deg`);
  return {
    position: 'absolute',
    inset: 0,
    opacity: 0.5,
    pointerEvents: 'none',
    backgroundImage: `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`,
    WebkitMaskImage:
      'radial-gradient(circle closest-side at 50% 50%, black 0%, black 65%, transparent 100%)',
    maskImage:
      'radial-gradient(circle closest-side at 50% 50%, black 0%, black 65%, transparent 100%)',
  };
}, [raysColor]);
```

Note: anchor is `50% 50%` (not `50% 41%` as in the shop) because in `PlayerAvatar`'s `card`/`profile` wrapper the rays are placed _around the disc_, not in the parent stage box.

(e) Render the rays layer inside the disc `YStack`, BEFORE the avatar image (so the avatar paints on top), and ALSO render it inside the card-chrome wrapper at a higher level when `showCardChrome`:

For non-card sizes (`md`/`lg`) — render rays as a layer just outside the disc:

```tsx
{
  showRays && raysBg ? (
    <View
      position="absolute"
      top={-Math.round(disc * 0.45)}
      right={-Math.round(disc * 0.45)}
      bottom={-Math.round(disc * 0.45)}
      left={-Math.round(disc * 0.45)}
      pointerEvents="none"
      data-testid={testId ? `${testId}-rays` : undefined}
      style={raysBg}
    />
  ) : null;
}
```

For card-chrome (`card`/`profile`) — same layer but inside the wrapper, behind the disc:

```tsx
{
  showRays && raysBg ? (
    <View
      position="absolute"
      inset={0}
      pointerEvents="none"
      data-testid={testId ? `${testId}-rays` : undefined}
      style={raysBg}
    />
  ) : null;
}
```

(Use the first variant inside the `inner` `YStack`; the second inside the outer card wrapper.)

- [ ] **Step 4: Run the tests, confirm they pass**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run
```

Expected: all `PlayerAvatar` tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx
git commit -m "feat(ui): rays halo layer on PlayerAvatar md+ (ARC-755)"
```

---

## Task 4: Skin chip + topLeftOverlay slot

**Files:**

- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx`
- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx`

The skin chip surfaces the equipped game-skin label at `card`/`profile` only. `topLeftOverlay` is a generic slot the shop uses for its "TRY-ON" green tag — keeping it generic avoids the shared component knowing about shop concepts.

- [ ] **Step 1: Write the failing test**

```tsx
it('renders the skin chip at card/profile when skinChip prop set', () => {
  render(
    <PlayerAvatar
      name="J"
      skinChip={{ id: 'skin-1', label: 'Neon' }}
      size="card"
      data-testid="pa"
    />,
  );
  expect(screen.getByTestId('pa-skin')).toHaveTextContent(/NEON/i);
});

it('does not render the skin chip below card', () => {
  render(
    <PlayerAvatar
      name="J"
      skinChip={{ id: 'skin-1', label: 'Neon' }}
      size="md"
      data-testid="pa"
    />,
  );
  expect(screen.queryByTestId('pa-skin')).toBeNull();
});

it('renders topLeftOverlay above the disc', () => {
  render(
    <PlayerAvatar
      name="J"
      size="profile"
      topLeftOverlay={<span data-testid="overlay">TRY-ON</span>}
      data-testid="pa"
    />,
  );
  expect(screen.getByTestId('overlay')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests, confirm they fail**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run -t "skin|overlay"
```

Expected: all three new cases fail.

- [ ] **Step 3: Add `skinChip` and `topLeftOverlay` props**

In `PlayerAvatarProps`:

```ts
/** Resolved skin item label for the SKIN chip. Only rendered at card/profile. */
skinChip?: { id: string; label: string } | null;
/** Overlay rendered top-left (used by shop for the TRY-ON tag). card/profile only. */
topLeftOverlay?: React.ReactNode;
```

In the card-chrome wrapper, near the existing banner sentinel, render both:

```tsx
{
  topLeftOverlay ? (
    <View
      position="absolute"
      top={12}
      left={12}
      zIndex={2}
      pointerEvents="auto"
    >
      {topLeftOverlay}
    </View>
  ) : null;
}

{
  skinChip ? (
    <View
      position="absolute"
      top={12}
      right={12}
      zIndex={2}
      paddingHorizontal={8}
      paddingVertical={4}
      borderRadius={6}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.16)"
      backgroundColor="rgba(0,0,0,0.4)"
      data-testid={testId ? `${testId}-skin` : undefined}
    >
      <Text
        fontSize={9}
        letterSpacing={1}
        textTransform="uppercase"
        color="$gray11"
        fontWeight="800"
      >
        SKIN · {skinChip.label}
      </Text>
    </View>
  ) : null;
}
```

- [ ] **Step 4: Run the tests, confirm they pass**

```bash
pnpm --filter @arcadeum/ui test PlayerAvatar -- --run
```

Expected: all `PlayerAvatar` tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar/PlayerAvatar.tsx packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx
git commit -m "feat(ui): skin chip + topLeftOverlay slot on PlayerAvatar (ARC-755)"
```

---

## Task 5: PlayerAvatar stories — Profile + skin chip

**Files:**

- Modify: `packages/ui/src/components/PlayerAvatar/PlayerAvatar.stories.tsx`

- [ ] **Step 1: Add the `profile` option and new stories**

Update the `argTypes.size.options` array to include `'profile'`. Add stories:

```tsx
export const Profile: Story = {
  args: {
    name: 'Jane Doe',
    size: 'profile',
    avatarUrl: '/shop/avatars/jane.png',
    badgeUrl: '/shop/badges/star.png',
    frameColor: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)',
    auraColor: 'rgba(168, 85, 247, 0.6)',
    bannerColor: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
    nameColor: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    presenceLine: 'Level 42',
    skinChip: { id: 'skin-neon', label: 'Neon' },
  },
};

export const WithSkinChip: Story = {
  args: {
    name: 'Jane Doe',
    size: 'card',
    avatarUrl: '/shop/avatars/jane.png',
    skinChip: { id: 'skin-neon', label: 'Neon' },
    frameColor: '#22d3ee',
    auraColor: '#22d3ee',
  },
};
```

Extend `AllSizes` to include the `profile` size in the row.

- [ ] **Step 2: Verify stories render via the UI build**

```bash
pnpm --filter @arcadeum/ui build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/PlayerAvatar/PlayerAvatar.stories.tsx
git commit -m "docs(ui): stories for PlayerAvatar profile size + skin chip (ARC-755)"
```

---

## Task 6: BE — add `equippedGameSkinId` to user schema + auth profile

**Files:**

- Modify: `apps/be/src/auth/schemas/user.schema.ts`
- Modify: `apps/be/src/auth/lib/types.ts`
- Modify: `apps/be/src/auth/auth.service.ts`
- Modify: any auth test that snapshots `AuthUserProfile` (grep for `equippedAvatarId` in `apps/be/src/auth/*.spec.ts`)

- [ ] **Step 1: Find auth tests that touch the user profile**

```bash
grep -rln "equippedAvatarId" apps/be/src/auth --include="*.spec.ts"
```

Note the list of files; you'll likely need to add `equippedGameSkinId` alongside each existing `equippedAvatarId` reference in fixtures and assertions.

- [ ] **Step 2: Write the failing test (or extend an existing one)**

In `apps/be/src/auth/auth.service.spec.ts` (or the closest existing spec covering `buildAuthUserProfile`), add or extend a case:

```ts
it('includes equippedGameSkinId in the auth user profile', async () => {
  // arrange: build a user document with equippedGameSkinId set
  const user = await userModel.create({
    /* …existing fields…*/
    equippedGameSkinId: 'skin-neon',
  });
  // act
  const profile = (service as any).buildAuthUserProfile(user);
  // assert
  expect(profile.equippedGameSkinId).toBe('skin-neon');
});
```

Adapt to existing patterns in the file (do not introduce new test infrastructure).

- [ ] **Step 3: Run the test, confirm it fails**

```bash
pnpm --filter be test --testPathPattern=auth.service
```

Expected: the new case fails (field missing).

- [ ] **Step 4: Add the schema field**

In `apps/be/src/auth/schemas/user.schema.ts`, after `equippedFrameId`:

```ts
@Prop({ type: String, default: null })
equippedGameSkinId?: string | null;
```

- [ ] **Step 5: Add the field to `AuthUserProfile` type**

In `apps/be/src/auth/lib/types.ts`:

```ts
/** Currently-equipped game-skin item id, or null. */
equippedGameSkinId?: string | null;
```

- [ ] **Step 6: Include it in `buildAuthUserProfile`**

In `apps/be/src/auth/auth.service.ts`, inside the `profile` object literal:

```ts
equippedGameSkinId: user.equippedGameSkinId ?? null,
```

- [ ] **Step 7: Run BE auth tests, confirm pass**

```bash
pnpm --filter be test --testPathPattern=auth
```

Expected: all auth tests pass.

- [ ] **Step 8: Commit**

```bash
git add apps/be/src/auth
git commit -m "feat(be): equippedGameSkinId on user schema + auth profile (ARC-755)"
```

---

## Task 7: BE — game_skin equip slot in shop

**Files:**

- Modify: `apps/be/src/shop/lib/shop-types.ts`
- Modify: `apps/be/src/shop/services/inventory.service.ts`
- Modify: `apps/be/src/shop/services/shop.service.ts`
- Modify: closest existing spec for `inventory.service`/`shop.service` if present.

`game_skin` already exists in `SHOP_CATEGORIES` but `equipKeyFor('game_skin')` returns `null`, meaning the equip endpoint refuses it. We add it now so the user can equip skins like any other cosmetic.

- [ ] **Step 1: Write the failing test**

In `apps/be/src/shop/services/inventory.service.spec.ts` (or the closest existing spec):

```ts
it('listForUser surfaces equippedGameSkinId on the equipped view', async () => {
  // arrange: user with equippedGameSkinId set
  // act: const view = await service.listForUser(userId);
  // assert: expect(view.equipped.game_skin).toBe('skin-neon');
});
```

And in `shop-types.spec.ts` if one exists (or inline in the service spec):

```ts
it('equipKeyFor maps game_skin → equippedGameSkinId', () => {
  expect(equipKeyFor('game_skin')).toBe('equippedGameSkinId');
});
```

- [ ] **Step 2: Run the tests, confirm they fail**

```bash
pnpm --filter be test --testPathPattern="shop|inventory"
```

Expected: new cases fail.

- [ ] **Step 3: Extend `EquipKey` and `equipKeyFor`**

In `apps/be/src/shop/lib/shop-types.ts`:

```ts
export type EquipKey =
  | 'equippedAvatarId'
  | 'equippedBadgeId'
  | 'equippedNameColorId'
  | 'equippedBannerId'
  | 'equippedAuraId'
  | 'equippedFrameId'
  | 'equippedGameSkinId';

export function equipKeyFor(category: ShopCategory): EquipKey | null {
  if (category === 'avatar') return 'equippedAvatarId';
  if (category === 'badge') return 'equippedBadgeId';
  if (category === 'name_color') return 'equippedNameColorId';
  if (category === 'banner') return 'equippedBannerId';
  if (category === 'aura') return 'equippedAuraId';
  if (category === 'frame') return 'equippedFrameId';
  if (category === 'game_skin') return 'equippedGameSkinId';
  return null;
}
```

- [ ] **Step 4: Add `equippedGameSkinId` to `LeanUser` + projections in both services**

In `apps/be/src/shop/services/inventory.service.ts`:

```ts
interface LeanUser {
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedBannerId?: string | null;
  equippedAuraId?: string | null;
  equippedFrameId?: string | null;
  equippedGameSkinId?: string | null; // ← new
}
```

And in `listForUser`'s projection object:

```ts
equippedGameSkinId: 1,
```

In `apps/be/src/shop/services/shop.service.ts`, same `LeanUser` and projection extensions in the two places where they appear (line ~42 type def, lines ~199/430/452 projections).

- [ ] **Step 5: Update `equippedFromUser` to use the new field**

In **both** services:

```ts
private equippedFromUser(user: LeanUser | null | undefined): EquippedView {
  return {
    avatar: user?.equippedAvatarId ?? null,
    badge: user?.equippedBadgeId ?? null,
    name_color: user?.equippedNameColorId ?? null,
    game_skin: user?.equippedGameSkinId ?? null, // ← was `null`
    banner: user?.equippedBannerId ?? null,
    aura: user?.equippedAuraId ?? null,
    frame: user?.equippedFrameId ?? null,
  };
}
```

(Note: `shop.service.ts:468` currently has `frame: user?.equippedFrameId ?? null` — verify the surrounding shape and update the same way.)

- [ ] **Step 6: Run tests, confirm pass**

```bash
pnpm --filter be test --testPathPattern="shop|inventory"
```

Expected: all shop/inventory tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/be/src/shop
git commit -m "feat(be): wire game_skin to equippedGameSkinId equip slot (ARC-755)"
```

---

## Task 8: BE — propagate `equippedGameSkinId` through chat snapshots

**Files:**

- Modify: `apps/be/src/chat/chat-helper.service.ts`
- Modify: `apps/be/src/chat/chat-helper.service.spec.ts` (if exists; otherwise add minimal coverage in `chat.service.spec.ts`)

The chat helper batch-loads sender users for each message page and stamps `senderEquippedFrameId`/etc on the outgoing snapshots. Add the skin field alongside.

- [ ] **Step 1: Extend the test**

In the chat-helper spec, find the assertion(s) that verify equipped IDs flow through. Extend:

```ts
expect(snapshots[0]).toMatchObject({
  senderEquippedAvatarId: 'avatar-1',
  // …
  senderEquippedGameSkinId: 'skin-neon',
});
```

- [ ] **Step 2: Run, confirm fail**

```bash
pnpm --filter be test --testPathPattern=chat-helper
```

- [ ] **Step 3: Extend `chat-helper.service.ts`**

(a) Add `equippedGameSkinId: string | null` to the `equippedLookup` Map value type.

(b) Add `'equippedGameSkinId'` to the `.select([...])` array.

(c) Add `equippedGameSkinId: user.equippedGameSkinId ?? null` to the `equippedLookup.set(...)` call.

(d) Add `senderEquippedGameSkinId: equipped?.equippedGameSkinId ?? null` to the outgoing message snapshot.

(e) Wherever the snapshot type is declared (search for `senderEquippedFrameId:` in `apps/be/src/chat` types/interfaces), add the matching `senderEquippedGameSkinId?: string | null` field.

- [ ] **Step 4: Run, confirm pass**

```bash
pnpm --filter be test --testPathPattern=chat
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/src/chat
git commit -m "feat(be): propagate equippedGameSkinId through chat snapshots (ARC-755)"
```

---

## Task 9: Web — `useEquippedCosmetics` resolves `equippedGameSkinId`

**Files:**

- Modify: `apps/web/src/features/shop/hooks/useEquippedCosmetics.ts`
- Modify: `apps/web/src/features/shop/hooks/useEquippedCosmetics.test.ts`

- [ ] **Step 1: Write the failing test**

In `useEquippedCosmetics.test.ts`, extend the catalog fixture's `beforeEach`:

```ts
item('skin-neon', 'game_skin', '#0ff'),
```

Add a new case:

```ts
it('resolves equippedGameSkinId to skinItem + skinChip label', async () => {
  const { result } = renderHook(() =>
    useEquippedCosmetics({
      equippedAvatarId: null,
      equippedBadgeId: null,
      equippedGameSkinId: 'skin-neon',
    }),
  );
  await waitFor(() => {
    expect(result.current.skinItem?.id).toBe('skin-neon');
  });
  expect(result.current.skinChip).toEqual({
    id: 'skin-neon',
    label: 'items.game_skin.skin-neon.name',
  });
});
```

(The label resolves to the i18n key — consumers call `t()` on it when rendering. The shared component just displays whatever's in `label`. See Task 11 for how the shop wrapper translates this.)

- [ ] **Step 2: Run, confirm fail**

```bash
pnpm --filter web test useEquippedCosmetics -- --run
```

- [ ] **Step 3: Extend the hook**

In `useEquippedCosmetics.ts`:

```ts
export interface EquippedCosmetics {
  // …existing fields
  /** Catalog item for the equipped game skin (used for SKIN chip rendering). */
  skinItem: EffectiveShopItem | null;
  /** Pre-shaped skin chip prop ready for `<PlayerAvatar skinChip={…} />`. */
  skinChip: { id: string; label: string } | null;
}

export function useEquippedCosmetics(args: {
  // …existing
  equippedGameSkinId?: string | null | undefined;
}): EquippedCosmetics {
  const {
    // …existing
    equippedGameSkinId,
  } = args;

  // …existing catalog load logic

  return useMemo<EquippedCosmetics>(() => {
    // …existing avatar/badge/etc resolution
    const skin = equippedGameSkinId
      ? (catalogMap.get(equippedGameSkinId) ?? null)
      : null;
    return {
      // …existing fields
      skinItem: skin,
      skinChip: skin ? { id: skin.id, label: skin.nameKey } : null,
    };
  }, [
    // …existing deps
    equippedGameSkinId,
    catalogMap,
  ]);
}
```

- [ ] **Step 4: Run, confirm pass**

```bash
pnpm --filter web test useEquippedCosmetics -- --run
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/shop/hooks/useEquippedCosmetics.ts apps/web/src/features/shop/hooks/useEquippedCosmetics.test.ts
git commit -m "feat(shop): resolve equippedGameSkinId in useEquippedCosmetics (ARC-755)"
```

---

## Task 10: Web — `EquippedPlayerAvatar` threads skin chip

**Files:**

- Modify: `apps/web/src/shared/ui/PlayerAvatar/EquippedPlayerAvatar.tsx`
- Modify: `apps/web/src/shared/ui/PlayerAvatar/EquippedPlayerAvatar.test.tsx`

The wrapper component now translates the skin chip label (which the hook returns as a raw i18n key) before passing it to `PlayerAvatar`. We accept `equippedGameSkinId` as a new prop.

- [ ] **Step 1: Write the failing test**

In `EquippedPlayerAvatar.test.tsx`:

```tsx
it('passes skinChip from useEquippedCosmetics to PlayerAvatar', async () => {
  vi.mocked(catalogCache.loadCatalog).mockResolvedValue([
    /* …include a 'skin-neon' game_skin item… */
  ]);
  render(
    <EquippedPlayerAvatar
      name="Jane"
      size="card"
      equippedAvatarId={null}
      equippedBadgeId={null}
      equippedGameSkinId="skin-neon"
      data-testid="pa"
    />,
  );
  await screen.findByTestId('pa-skin');
  expect(screen.getByTestId('pa-skin')).toHaveTextContent(/skin/i);
});
```

- [ ] **Step 2: Run, confirm fail**

```bash
pnpm --filter web test EquippedPlayerAvatar -- --run
```

- [ ] **Step 3: Extend `EquippedPlayerAvatar.tsx`**

(a) Add `equippedGameSkinId?: string | null | undefined` to `EquippedPlayerAvatarProps`.

(b) Pass it to `useEquippedCosmetics(...)`.

(c) Translate the chip label via `useTranslation` and pass the resolved chip:

```tsx
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

// inside component:
const { t } = useTranslation();
const skinChip = cosmetics.skinChip
  ? {
      id: cosmetics.skinChip.id,
      label: String(t(cosmetics.skinChip.label as TranslationKey)),
    }
  : null;

return (
  <PlayerAvatar
    // …existing props
    skinChip={skinChip}
  />
);
```

If `useTranslation` adds client-rendering concerns (it shouldn't — `EquippedPlayerAvatar` is already `'use client'`), check `apps/web/src/shared/lib/useTranslation.ts` for the right import.

- [ ] **Step 4: Run, confirm pass**

```bash
pnpm --filter web test EquippedPlayerAvatar -- --run
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/shared/ui/PlayerAvatar
git commit -m "feat(web): EquippedPlayerAvatar threads skin chip + i18n label (ARC-755)"
```

---

## Task 11: Web — rewrite `ShopMannequinStage` as `PlayerAvatar` adapter

**Files:**

- Modify: `apps/web/src/features/shop/ui/ShopMannequinStage.tsx`
- Modify: `apps/web/src/features/shop/ui/ShopMannequinStage.test.tsx`
- Delete: `apps/web/src/features/shop/ui/ShopMannequinStage.module.css`

Convert the stage into a thin wrapper over `<PlayerAvatar size="profile" />`. The shop's "TRY-ON" tag goes through the `topLeftOverlay` prop; the SKIN chip goes through `skinChip`; banner/frame/aura/avatar/badge/nameColor go through their existing props.

Important: the stage receives `preview` (a `Record<ShopCategory, EffectiveShopItem | null>`) plus `hoverItem` separately. `useEquippedCosmetics` is not used here — the shop already has resolved items from its catalog. We map fields directly.

- [ ] **Step 1: Update the test for the new DOM**

In `ShopMannequinStage.test.tsx`, locate the existing assertions and adapt them to the new testid set: `shop-stage` (outer) stays; inner avatar/badge/skin assertions move to `<PlayerAvatar>`'s testids (`shop-stage-avatar`, `shop-stage-avatar-badge`, `shop-stage-avatar-skin`, etc.).

Add (if missing) a case that confirms the `topLeftOverlay` carries the TRY-ON tag during hover:

```tsx
it('renders TRY-ON overlay only when hoverItem is set', () => {
  // re-use existing patterns; expect "TRY · ON" present with hoverItem and absent without
});
```

- [ ] **Step 2: Run, confirm fail**

```bash
pnpm --filter web test ShopMannequinStage -- --run
```

- [ ] **Step 3: Rewrite `ShopMannequinStage.tsx`**

After the rewrite, `nameColorRenderProps` and `stageStyles` imports will be unused — remove them to keep lint clean. The shared `PlayerAvatar` already handles gradient clip-text for `nameColor` internally, so we get parity for free.

Replace the body with an adapter:

```tsx
'use client';

import { useMemo } from 'react';
import { Stack, Text } from 'tamagui';
import { PlayerAvatar } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { RARITY_GLOW } from '../lib/rarity';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

export interface ShopMannequinStageLabels {
  tryOn: string;
  stage: { level: string; online: string };
}

export interface ShopMannequinStageProps {
  preview: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  hoverItem: EffectiveShopItem | null;
  displayName: string;
  level: number | null;
  labels: ShopMannequinStageLabels;
}

export function ShopMannequinStage({
  preview,
  hoverItem,
  displayName,
  level,
  labels,
}: ShopMannequinStageProps) {
  const { t } = useTranslation();
  const avatar = preview.avatar ?? null;
  const badge = preview.badge ?? null;
  const nameColor = preview.name_color ?? null;
  const skin = preview.game_skin ?? null;
  const banner = preview.banner ?? null;
  const aura = preview.aura ?? null;
  const frame = preview.frame ?? null;

  const rarityGlow = useMemo(() => {
    const focus = hoverItem ?? avatar ?? badge ?? skin ?? nameColor;
    return focus ? RARITY_GLOW[focus.rarity] : null;
  }, [hoverItem, avatar, badge, skin, nameColor]);

  const skinChip = skin
    ? {
        id: skin.id,
        label: String(t(`pages.shop.${skin.nameKey}` as TranslationKey)),
      }
    : null;

  const hoverName = hoverItem
    ? String(t(`pages.shop.${hoverItem.nameKey}` as TranslationKey))
    : '';

  const presenceLine =
    level !== null && level !== undefined && Number.isFinite(level)
      ? labels.stage.level.replace('{level}', String(level))
      : labels.stage.online;

  const topLeftOverlay = hoverItem ? (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={6}
      paddingHorizontal={8}
      paddingVertical={4}
      borderRadius={6}
      borderWidth={1}
      borderColor="rgba(34,197,94,0.55)"
      backgroundColor="rgba(16,185,129,0.10)"
    >
      <Stack width={6} height={6} borderRadius={3} backgroundColor="#22c55e" />
      <Text
        fontSize={10}
        letterSpacing={1}
        textTransform="uppercase"
        fontWeight="800"
        color="$green11"
      >
        {labels.tryOn}
      </Text>
      <Text fontSize={11} color="$gray11">
        · {hoverName}
      </Text>
    </Stack>
  ) : null;

  return (
    <PlayerAvatar
      data-testid="shop-stage"
      name={displayName}
      size="profile"
      avatarUrl={avatar?.assetUrl ?? null}
      badgeUrl={badge?.assetUrl ?? null}
      frameColor={frame?.colorValue ?? null}
      auraColor={aura?.colorValue ?? null}
      bannerColor={banner?.colorValue ?? null}
      nameColor={nameColor?.colorValue ?? null}
      rarityGlow={rarityGlow}
      skinChip={skinChip}
      topLeftOverlay={topLeftOverlay}
      presenceLine={presenceLine}
      priority
    />
  );
}
```

- [ ] **Step 4: Delete the obsolete CSS module**

```bash
rm apps/web/src/features/shop/ui/ShopMannequinStage.module.css
```

- [ ] **Step 5: Run, confirm pass**

```bash
pnpm --filter web test ShopMannequinStage -- --run
```

If existing visual-regression-style assertions checked the old DOM structure (e.g. `shop-stage-rays`, anchored conic positions), update them to match the new testid set or drop them if they were checking implementation details.

- [ ] **Step 6: Manual visual check**

Start the web dev server and open `/shop`:

```bash
pnpm --filter web dev
```

Verify:

- Stage shows avatar + frame + aura halo (rays) + banner backdrop.
- Hovering an item swaps the relevant slot in the preview.
- TRY-ON green tag appears top-left on hover; SKIN chip appears top-right when a skin is equipped.
- No visual regression from current `/shop` look.

Stop the dev server (`Ctrl-C`).

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/shop/ui/ShopMannequinStage.tsx apps/web/src/features/shop/ui/ShopMannequinStage.test.tsx
git rm apps/web/src/features/shop/ui/ShopMannequinStage.module.css
git commit -m "refactor(shop): route preview through shared PlayerAvatar (ARC-755)"
```

---

## Task 12: Web — bump ProfileMenu + MobileMenu to use new chrome

**Files:**

- Modify: `apps/web/src/widgets/header/ui/ProfileMenu.tsx`
- Modify: `apps/web/src/widgets/header/ui/MobileMenu.tsx`

Pass `equippedGameSkinId` (from the session user) and switch the expanded panel avatar to `card`. Trigger (collapsed menu) stays small — it shouldn't show banner/skin chip.

- [ ] **Step 1: Read both files**

```bash
grep -n "EquippedPlayerAvatar" apps/web/src/widgets/header/ui/ProfileMenu.tsx apps/web/src/widgets/header/ui/MobileMenu.tsx
```

- [ ] **Step 2: For each `EquippedPlayerAvatar` instance**

(a) If it's the expanded panel/hero variant (size `md` currently), change to `size="card"`.

(b) Add `equippedGameSkinId={user.equippedGameSkinId ?? null}` (or whatever the session user object is called locally).

Trigger avatars (size `sm`/`icon`) stay unchanged — skin chip wouldn't render at those sizes anyway, but pass-through for consistency is fine.

- [ ] **Step 3: Manual visual check**

Open the profile menu in the running app. The expanded panel should show the banner backdrop + name (if name color set) + skin chip (if skin equipped).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/header/ui/ProfileMenu.tsx apps/web/src/widgets/header/ui/MobileMenu.tsx
git commit -m "feat(header): show equipped chrome in profile menu (ARC-755)"
```

---

## Task 13: Web — Player profile page uses `profile` size

**Files:**

- Modify: `apps/web/src/app/[locale]/players/[id]/PlayerProfileClient.tsx`
- Modify: payload type that drives it (likely `apps/web/src/app/[locale]/players/[id]/types.ts` or inline)

- [ ] **Step 1: Locate the payload type**

```bash
grep -rn "equippedFrameId" "apps/web/src/app/[locale]/players/[id]/"
```

(Quote the path — zsh/bash will glob-expand the bracketed segments otherwise.)

- [ ] **Step 2: Add `equippedGameSkinId` to the payload type**

```ts
equippedGameSkinId?: string | null;
```

- [ ] **Step 3: Pass it + bump size to `profile`**

In `PlayerProfileClient.tsx`, where `<EquippedPlayerAvatar` renders the profile header:

- Set `size="profile"` (was `lg`).
- Add `equippedGameSkinId={profile.equippedGameSkinId ?? null}`.

- [ ] **Step 4: Update the BE payload that fills `PlayerProfileClient`**

Find the BE endpoint that returns the player profile payload (`grep -rn "equippedFrameId" apps/be/src/users` or similar). Include `equippedGameSkinId` in its selection / DTO so the FE actually gets the value.

If the endpoint lives in a controller that uses an `inventory.service`/`shop.service` `equippedFromUser` helper, the prior Task 7 change already plumbed it through. Just confirm the controller surfaces the field.

- [ ] **Step 5: Manual visual check**

Open another user's profile and verify the larger profile-size avatar with full chrome (banner backdrop wrapping the avatar card).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/[locale]/players/[id] apps/be
git commit -m "feat(profile): profile-size avatar with full equipped chrome (ARC-755)"
```

---

## Task 14: Verify file-length + lint + type-check

- [ ] **Step 1: Run the workspace checks**

```bash
pnpm check-file-length
pnpm lint
pnpm type-check
```

Expected: all green. If `PlayerAvatar.tsx` is approaching 500 lines, extract subcomponents (`<RaysLayer>`, `<SkinChip>`) into the same file as named function components below the main export — still one file, but smaller chunks.

- [ ] **Step 2: Commit any fixups**

If any clean-up commits are needed:

```bash
git add -p
git commit -m "chore: file-length + lint fixups (ARC-755)"
```

---

## Task 15: Verify full test suite + visual e2e

- [ ] **Step 1: Run all unit/integration tests**

```bash
pnpm test
```

If the BE pre-push hook is flaky on the full vitest suite (per project memory), run web + ui + be separately:

```bash
pnpm --filter @arcadeum/ui test -- --run
pnpm --filter web test -- --run
pnpm --filter be test
```

Expected: all green.

- [ ] **Step 2: Run the affected Playwright e2e**

```bash
pnpm --filter web exec playwright test tests/e2e/shop.spec.ts tests/e2e/profile-settings.spec.ts tests/e2e/profile-menu.spec.ts
```

Expected: green. If shop testid assertions break only because of the rewrite, update them inline (one round of test-fixup is acceptable; deeper failures point to a regression, debug per `superpowers:systematic-debugging`).

- [ ] **Step 3: Commit any fixups**

```bash
git add -p
git commit -m "test(e2e): update shop avatar testids (ARC-755)"
```

---

## Task 16: Push + open PR against `develop`

- [ ] **Step 1: Sync with develop**

```bash
git fetch origin develop
git rebase origin/develop
```

If conflicts, resolve carefully (do not drop other changes).

- [ ] **Step 2: Push**

```bash
git push -u origin ARC-755-equipped-avatar-everywhere
```

- [ ] **Step 3: Open PR via `gh`** — base `develop`, not `main`:

```bash
gh pr create --base develop --title "feat(avatar): equipped avatar everywhere (ARC-755)" --body "$(cat <<'EOF'
## Summary
- Promotes the shop preview's visual treatment (rays halo, gradient frame ring, banner backdrop, skin chip, name color) into the shared `@arcadeum/ui` `PlayerAvatar`.
- Adds a new `profile` size for full-chrome hero renders.
- Rewrites `ShopMannequinStage` as a thin adapter around `<PlayerAvatar size="profile" />` — single visual source of truth.
- Plumbs `equippedGameSkinId` end-to-end (User schema → auth → shop equip → chat snapshots → web payloads).
- Bumps profile page + profile menu expanded panel to render the new chrome.

## Test plan
- [ ] Run unit suites: `pnpm --filter @arcadeum/ui test`, `pnpm --filter web test`, `pnpm --filter be test`.
- [ ] Visit `/shop` in dev — verify rays halo, banner backdrop, frame ring, badge corner, name color, SKIN chip, TRY-ON hover tag all behave like main.
- [ ] Visit `/players/<id>` — verify the larger profile-size avatar with full chrome.
- [ ] Open the profile menu (web + mobile) — expanded panel shows banner backdrop + skin chip.
- [ ] Chat (game + DMs) renders frame + aura halo where the sender has them equipped (no regression).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Confirm PR opened against `develop`**

```bash
gh pr view --json baseRefName,title,url
```

Expected: `"baseRefName": "develop"`.

---

## Done criteria (from spec)

- Shop preview renders via shared `PlayerAvatar` with no visual regression vs `develop`.
- Profile page header shows equipped frame + aura halo (with rays) + banner backdrop + name color + badge.
- `equippedGameSkinId` round-trips through equip → `/me` → BE persistence.
- Chat / leaderboard / history / lobby avatars render frame + aura halo when equipped.
- No changed file exceeds 500 lines.
- All existing avatar tests pass; new tests cover skin chip + profile size + rays.
- No `any` types introduced.
