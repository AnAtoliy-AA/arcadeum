---
ticket: ARC-755
branch: ARC-755-equipped-avatar-everywhere
status: draft
---

# Equipped avatar everywhere (ARC-755)

## Goal

A single shared avatar component that renders **all** equipped cosmetic attributes (avatar image, frame ring, aura halo with rays, banner backdrop, name color, badge, game skin chip) at any size, and use it everywhere a player avatar appears in the app.

Today the shop preview (`ShopMannequinStage`) has the full visual treatment. The shared `PlayerAvatar` component used everywhere else has a strictly lighter treatment: simple ring, simple boxShadow halo, no rays, no skin chip. The two have drifted. ARC-755 closes the gap by promoting the shop preview's visual treatment into the shared component and routing the shop's preview through the same component.

## Non-goals

- Mobile app (`apps/mobile`). Tamagui/RN parity is a separate effort — flag in follow-up.
- Adding new cosmetic categories (no new BE schema work beyond `equippedGameSkinId`, see Backend section).
- Animating the rays. Shop currently keeps them static via CSS module; we match that.
- Changing the shop preview's behaviour (try-on hover overlay, skin chip wording, etc.). We only swap its rendering layer.

## Visual contract

Each layer is independently toggled by props and by size threshold so small renders stay cheap.

| Layer                           | Source                                  | Always-on sizes   | Notes                                                                                               |
| ------------------------------- | --------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| Avatar image / initials         | `avatarUrl`, `name`                     | all               | Falls back to initials when no URL                                                                  |
| Frame ring                      | `frameColor` (hex or `linear-gradient`) | `sm`+             | Hex → low-alpha tint fill + full-strength border. Gradient → dark wash composite + first-hex border |
| Aura halo (12-ray conic)        | `auraColor`                             | `md`+             | Falls back to rarity glow when no aura, off entirely when neither aura nor rarity glow              |
| Aura boxShadow                  | `auraColor`                             | `md`+             | Soft glow under the disc, proportional radius                                                       |
| Badge corner                    | `badgeUrl`                              | `sm`+             | Bottom-right circular chip                                                                          |
| Banner backdrop                 | `bannerColor`                           | `card`, `profile` | Solid → backgroundColor; gradient → backgroundImage                                                 |
| Skin chip                       | `skinItem.nameKey` + `colorValue`       | `card`, `profile` | "SKIN · {name}" top-right, gated on size                                                            |
| Name color (gradient clip-text) | `nameColor`                             | `card`, `profile` | Only when wrapper renders the name                                                                  |

### Sizes

`PlayerAvatar` adds a new `profile` size and extends the layer-derived constants. All visual constants derive from `disc` proportionally.

| Size      | Disc | Ring width | Badge | Halo blur         | Skin chip | Banner card             |
| --------- | ---- | ---------- | ----- | ----------------- | --------- | ----------------------- |
| `icon`    | 28   | 0          | 0     | off               | off       | off                     |
| `sm`      | 40   | 2          | 14    | off               | off       | off                     |
| `md`      | 72   | 3          | 24    | on (proportional) | off       | off                     |
| `lg`      | 140  | 3          | 36    | on                | off       | off                     |
| `card`    | 140  | 3          | 36    | on                | on        | on (220px wrapper)      |
| `profile` | 200  | 4          | 52    | on (large)        | on        | on (full-width wrapper) |

`profile` is the new size that matches the shop preview's visual weight (140 disc + full chrome wrapper, ≈280px stage height).

## Component design

### 1. `PlayerAvatar` (in `@arcadeum/ui`)

Single component, internal subcomponents for each layer. All layers gated by props and size — no extra DOM for the small render path.

Props (additive — existing props kept):

```ts
export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'lg' | 'card' | 'profile';

export interface PlayerAvatarProps {
  // existing
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

  // new
  /** Resolved skin item for the SKIN chip. Only rendered at card/profile sizes. */
  skinChip?: { id: string; label: string; colorValue?: string | null } | null;
  /** Rarity glow fallback for the rays halo when no aura is set. */
  rarityGlow?: string | null;
  /** Optional overlay rendered above the avatar (used by shop for the "TRY-ON" tag). */
  topLeftOverlay?: React.ReactNode;
}
```

Internal layout (sketch):

```
<Wrapper>                          ← card/profile only; otherwise inert
  {bannerStyle backdrop}
  {rays layer}                     ← md+; conic 12-spike, anchored at avatar center
  {topLeftOverlay}                 ← shop "TRY-ON" tag
  {skinChip}                       ← card/profile only
  <Disc>
    {frame ring + aura boxShadow + aura ring layer}
    {avatar img or initials}
    {badge corner}
  </Disc>
  {name + presence}                ← card/profile only
</Wrapper>
```

Each layer extracted into a named subcomponent inside the same file (`<RaysLayer>`, `<SkinChip>`, `<BadgeCorner>`, `<FrameRing>`) so the file stays well under 500 lines and the size-gating is obvious. Subcomponents are not exported.

### 2. `EquippedPlayerAvatar` (in `apps/web/src/shared/ui/PlayerAvatar`)

Bridge stays the same shape — just gains `equippedGameSkinId` and threads `skinItem` through:

```ts
export interface EquippedPlayerAvatarProps {
  // existing equipped ID props
  equippedAvatarId, equippedBadgeId, equippedNameColorId,
  equippedFrameId, equippedAuraId, equippedBannerId,

  // new
  equippedGameSkinId?: string | null | undefined;

  // existing display props
  name, size, level, presenceLine, priority, onPress, ...
}
```

`useEquippedCosmetics` gains `equippedGameSkinId` → returns `skinItem: EffectiveShopItem | null` + builds `skinChip` for the component.

### 3. Shop preview wrapper

`ShopMannequinStage` is rewritten as a thin wrapper around `<PlayerAvatar size="profile" />`. Inputs are still resolved through the existing `preview` map (avatar/badge/frame/aura/banner/name_color/game_skin items). The stage:

- Maps `preview.*` items → component props (`avatarUrl`, `frameColor`, `auraColor`, `bannerColor`, `nameColor`, `badgeUrl`, `skinChip`).
- Passes the existing `hoverItem` try-on indicator as `topLeftOverlay` (the green dot + TRY-ON · {name}).
- Computes `rarityGlow` from the focused item's rarity.

Net effect: shop preview now uses the same code path as profile/chat/lobby. Single source of truth.

## Backend changes

Minimal — add `equippedGameSkinId` to plumbing alongside the other equipped IDs:

1. `User` schema: `equippedGameSkinId?: string | null`.
2. `InventoryService.equippedFromUser` + `LeanUser` interface: include `game_skin`.
3. `auth.service.ts` `/me` payload: include `equippedGameSkinId`.
4. `chat-helper.service.ts`: thread `equippedGameSkinId` through chat message snapshots so chat bubbles show skin chip when applicable.
5. `shop.service.ts` slot-to-field map: `game_skin → equippedGameSkinId` so the existing equip endpoint works for game_skin.

DB migration: not needed — schema field is optional, missing → null reads as unequipped.

## Consumer migration

All consumers that already go through `EquippedPlayerAvatar` automatically get the new visual treatment. We:

1. Add `equippedGameSkinId` prop pass-through wherever the payload type carries it. Initially only `ProfileMenu`/`MobileMenu` (own user from session) + `PlayerProfileClient` (other player's profile).
2. For payload types that don't yet carry equipped IDs (e.g. `ChatListPage` currently passes `equippedAvatarId={null}`), leave as-is — no behaviour change.
3. Bump default size where it makes sense to actually show the new chrome:
   - `PlayerProfileClient` header → `size="profile"` (was `lg`).
   - `ProfileMenu` opened panel → `size="card"` (was `md`) — only the expanded view, the trigger stays `sm`/`icon`.
   - All other consumers: unchanged.

## Tests

Vitest:

- `PlayerAvatar.test.tsx` — gains cases for each layer:
  - Rays layer only rendered at `md`+.
  - Skin chip only rendered at `card`/`profile`.
  - Banner backdrop only rendered at `card`/`profile`.
  - Frame: hex tint vs gradient wash produces expected inline styles.
  - Aura: drives both rays color and boxShadow.
  - Rarity glow fallback when aura is null.
- `EquippedPlayerAvatar.test.tsx` — passing `equippedGameSkinId` resolves to a `skinChip` prop on the underlying `PlayerAvatar`.
- `useEquippedCosmetics.test.ts` — `equippedGameSkinId` resolves to the matching catalog item.
- `ShopMannequinStage.test.tsx` — exists; assertions remain (try-on overlay, banner backdrop, skin chip, badge present). Internal DOM structure changes; assertions update to match `PlayerAvatar`'s testids.

Playwright e2e:

- Existing shop preview e2e (`apps/web/tests/e2e/shop.spec.ts`) — assertions update for testid changes only; no new test.
- `profile-settings.spec.ts` and `profile-menu.spec.ts` — extend to assert frame/aura present when equipped (current tests already cover the basics).

## Risks / open questions

- **CSS module reuse**: `ShopMannequinStage.module.css` carries the static rays styling (`.rays`). The shared component lives in `packages/ui`, which doesn't currently import CSS modules. **Mitigation**: inline the conic-gradient as inline style (already what `ShopMannequinStage` does — the module only adds optional `animation` rules which we keep static for now).
- **`profile` size used outside the profile page**: limited to one consumer initially. If multiple pages want it, that's a follow-up.
- **Skin chip without equipped state**: BE migration ships the field but legacy users have no `equippedGameSkinId` → renders empty (correct; matches current behaviour).
- **Bundle size**: `PlayerAvatar` grows ~50–80 lines. Still well under 500-line limit and the existing 280-line file. No new deps.

## Rollout

Single PR onto `develop`. Behind no feature flag — visual change is additive (small sizes look the same; larger sizes get more chrome).

## Acceptance criteria

- Shop preview (`/shop`) renders via shared `PlayerAvatar` with no visual regression vs current state.
- Profile page header shows equipped frame, aura halo (with rays), banner backdrop, name color, badge — same treatment as shop preview.
- `equippedGameSkinId` round-trips through equip → /me → BE persistence.
- Chat bubble / leaderboard / history / lobby avatars render frame + aura halo when equipped (no regression).
- No file in changed scope exceeds 500 lines.
- All existing avatar tests pass; new tests cover skin chip + profile size.
- No `any` types introduced.
