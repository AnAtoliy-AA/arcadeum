# PlayerAvatar — design

**Ticket:** ARC-730 — feat: avatar in games
**Status:** Draft

## Problem

The current `Avatar` in `@arcadeum/ui` only renders an image + initials. Every place that wants to show a player with their equipped cosmetics duplicates a pattern: call `useEquippedCosmetics(...)`, render `<Avatar src={avatarUrl}>`, render the badge image inline, apply name‑color separately. That pattern is repeated in chat lists, chat messages, the chat popup, leaderboards, the player profile, the room card, the sea‑battle lobby, header menus, history, and stats. It is divergent (some sites show the badge, some don't; some are rendered with `next/image`, others with `<img>`), and it doesn't compose the rest of the catalog (frame, aura, banner) at all — only the shop preview does.

The intent of ARC‑730 is: **one component that renders a player with all of their equipped cosmetics**, available in small, inline, medium, and large‑card sizes, and used everywhere a user avatar appears.

## Scope

### In scope

- New presentational `PlayerAvatar` in `@arcadeum/ui` (sizes: `icon` / `sm` / `md` / `card`)
- New connected `EquippedPlayerAvatar` in `apps/web/src/shared/ui/PlayerAvatar/` that resolves equipped IDs → URLs and renders `PlayerAvatar`. (Not under `features/shop/` — it's consumed by chat / leaderboards / games / header, none of which should reach into a feature folder for shared UI.)
- Extend `useEquippedCosmetics` to also resolve `equippedFrameId`, `equippedAuraId`, `equippedBannerId`
- BE payload widening: surface `equippedFrameId`, `equippedAuraId`, `equippedBannerId` on
  - `AuthUserProfile` (lib/types.ts) + `auth.service.ts#buildAuthUserProfile`
  - chat message sender shape (`chat-helper.service.ts`)
  - room member shape (games rooms payload)
  - leaderboard player shape
  - player profile API response
- Migrate call sites to `EquippedPlayerAvatar`:

  1. `apps/web/src/app/[locale]/chat/ChatPage.tsx` (ChatMessageRow)
  2. `apps/web/src/app/[locale]/chats/ChatListPage.tsx`
  3. `apps/web/src/app/[locale]/players/[id]/PlayerProfileClient.tsx`
  4. `apps/web/src/app/[locale]/leaderboards/_components/RankTable.tsx`
  5. `apps/web/src/app/[locale]/games/RoomCardComponent.tsx`
  6. `apps/web/src/widgets/GameChat/ui/GameChat.tsx` (the in-game chat panel — its inline `GameChatRow` calls `useEquippedCosmetics` and renders `ChatMessage`)
  7. `apps/web/src/widgets/GameChat/ui/ChatMessageBubble.tsx` (parallel in-game chat row used by the popup; same migration as GameChatRow)
  8. `apps/web/src/widgets/GameChat/ui/ChatMessagePopup.tsx` (just propagates the new equipped-id props down to ChatMessageBubble)
  9. `apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx` (the `resolveEquipped` callback feeding the popup — extend it with frame/aura/banner ids)
  10. `apps/web/src/app/[locale]/history/components/HistoryDetailModal.tsx`
  11. `apps/web/src/app/[locale]/stats/components/Leaderboard.tsx`
  12. `apps/web/src/features/games/sea-battle/lobby/TeamSlotsBoard.tsx`
  13. `apps/web/src/features/games/sea-battle/lobby/UnassignedPool.tsx`
  14. `apps/web/src/widgets/header/ui/ProfileMenu.tsx`
  15. `apps/web/src/widgets/header/ui/MobileMenu.tsx`
  16. `packages/ui/src/components/Chat/ChatMessage.tsx` — additive prop change (see "ChatMessage migration" below); does NOT break existing callers in a separate commit.

  Skipped intentionally:

  - `apps/web/src/features/games/ui/PlayerList.tsx` — file is dead sample data (hardcoded `player1`/`player2`); a separate ticket should delete it or wire it to real data. Out of scope here.
  - `apps/web/src/features/pwa/InstallPWAModalContent.tsx`, `apps/web/src/features/admin-users/ui/UsersTableRow.tsx` — not player avatars (app icon / admin thumbnails). Keep base `Avatar`.

- Stories + tests for `PlayerAvatar` (Vitest + Storybook); unit test for `EquippedPlayerAvatar` resolution; smoke Playwright e2e for chat + game lobby cards.

### Out of scope

- `game_skin` does not have a user equip slot (it's a session‑level cosmetic per `equipKeyFor`) — not rendered on the avatar.
- DB migration / schema changes — schema already has the fields.
- Mobile integration. `apps/mobile` is left alone. The presentational `PlayerAvatar` lives in `@arcadeum/ui` so mobile can adopt it later with its own resolver.
- The PWA install modal and admin users table — they show non‑player avatars (app icon, admin user thumbnails). Keep the base `Avatar`.
- Removing the base `Avatar` from `@arcadeum/ui`. It stays for the non‑player use cases above and as the building block inside `PlayerAvatar`.

## Architecture

Two‑layer split:

```
@arcadeum/ui
  PlayerAvatar  ← presentational, takes resolved URLs / colors
    └── uses Avatar internally for the image disc

apps/web/src/shared/ui/PlayerAvatar
  EquippedPlayerAvatar  ← connected, takes equipped IDs
    └── useEquippedCosmetics() to resolve IDs → URLs
    └── renders <PlayerAvatar />
```

Why the split:

- The shop catalog cache (`useEquippedCosmetics`) is web‑only and depends on a Next.js fetch path. Keeping the catalog read out of `@arcadeum/ui` lets mobile reuse the presentational layer later with its own resolver.
- The catalog is loaded lazily; consumers that render lists of avatars (chat history, leaderboard) want a single hook call per row, not per cosmetic — `useEquippedCosmetics` already does that and stays the single resolver.

### `PlayerAvatar` (presentational) — `packages/ui/src/components/PlayerAvatar/`

```ts
export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'card';

export interface PlayerAvatarProps {
  name: string;
  size?: PlayerAvatarSize; // default 'sm'
  avatarUrl?: string | null;
  badgeUrl?: string | null;
  frameColor?: string | null; // hex or linear-gradient
  auraColor?: string | null; // hex or linear-gradient
  bannerColor?: string | null; // hex or linear-gradient — card size only
  nameColor?: string | null; // applied to name label — card size only
  level?: number | null; // rendered in the chip on card size
  presenceLine?: string; // localized 'Online' / 'Level {n}' — card only
  priority?: boolean; // forwarded to the image
  'data-testid'?: string;
  onPress?: () => void; // optional click-through (e.g. ProfileMenu)
}
```

### Size tiers (visual contract)

| Size |  Disc | Composes                                                        | Use cases                                                 |
| ---- | ----: | --------------------------------------------------------------- | --------------------------------------------------------- |
| icon |  28px | avatar image only                                               | chat list rows, room card member tiles, lobby slot pool   |
| sm   |  40px | avatar + badge corner (≈14px) + frame ring (2px)                | chat message sender, leaderboard rows                     |
| md   |  72px | avatar + badge corner (≈24px) + frame ring (3px) + aura halo    | player profile inline, ProfileMenu / MobileMenu           |
| card | 200px | everything + banner backdrop + name label + optional level chip | player profile hero, game waiting screens, profile modals |

Frame and aura are skipped at `icon` because a 28px circle can't carry the additional ring weight legibly. Banner only renders at `card` because it needs surrounding chrome.

The composition logic (frame ring style, aura glow conic gradient, banner backdrop) is lifted from the existing `ShopMannequinStage` (`apps/web/src/features/shop/ui/ShopMannequinStage.tsx`) — the shop preview today already does this composition; we extract the reusable parts into `PlayerAvatar` and keep the shop‑specific chrome (TryOn tag, skin chip, t() copy) in `ShopMannequinStage`. After the extraction, `ShopMannequinStage` renders `<PlayerAvatar size="card">` plus its own shop chrome on top.

### ChatMessage migration (additive, non-breaking)

`ChatMessage` in `@arcadeum/ui` is consumed by `ChatPage` (locale chat) and `ChatMessageBubble` (in-game chat, which is also re-exported through `ChatMessagePopup`). Changing the prop shape on `ChatMessage` is a cross-cutting break that would force three sites to be edited in the same commit.

Instead, the migration is additive:

- Add a new optional `senderAvatar?: ReactNode` slot to `ChatMessageProps`. When present, `ChatMessage` renders it where the inline `<Avatar>` + badge span currently sits.
- Keep the existing `avatarUrl` / `badgeUrl` / `senderColor` / `senderNameStyle` props intact for backward compatibility; they're used only when `senderAvatar` is not supplied.
- Migrate `ChatPage.ChatMessageRow` and `ChatMessageBubble` to pass `senderAvatar={<EquippedPlayerAvatar size="sm" ... />}`. Once both call sites use the slot, the deprecated props can be cleaned up in a follow-up — but they don't have to be removed in this PR.

This decouples the `@arcadeum/ui` change from the call-site migrations.

### `EquippedPlayerAvatar` (connected) — `apps/web/src/shared/ui/PlayerAvatar/`

```ts
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
}
```

Resolution rules (extended `useEquippedCosmetics`):

- Each id resolves via the cached catalog to an `EffectiveShopItem`.
- `avatarUrl` ← `avatarItem.assetUrl` (or `fallbackAvatarUrl`)
- `badgeUrl` ← `badgeItem.assetUrl`
- `frameColor` ← `frameItem.colorValue`
- `auraColor` ← `auraItem.colorValue`
- `bannerColor` ← `bannerItem.colorValue`
- `nameColor` ← `nameColorItem.colorValue`

Unresolved (catalog still loading) → all `null`. The component then renders the same fallback the base `Avatar` does today (initials + plain disc).

## Data flow / BE changes

The user schema already has `equippedBannerId`, `equippedAuraId`, `equippedFrameId` and `equipKeyFor` returns the right field for each category. Three things need updating:

1. **`AuthUserProfile`** (`apps/be/src/auth/lib/types.ts`) — add the three optional fields. `auth.service.ts#buildAuthUserProfile` populates them.
2. **Chat sender payload** (`apps/be/src/chat/chat-helper.service.ts`) — extend the `select(...)` projection and the per‑message return shape with `senderEquippedFrameId`, `senderEquippedAuraId`, `senderEquippedBannerId`. Web `ChatMessageData` type widens to match.
3. **Room members + leaderboard + player profile** — same three fields added to whatever shape feeds them today. (Will be enumerated in the implementation plan.)

No DB migration. No new endpoints. No new shop categories.

## Error / empty / loading states

- Catalog still loading → `PlayerAvatar` renders disc with initials, no frame/aura/banner/badge yet. The hook re‑renders when catalog resolves.
- Equipped id points at a missing/unavailable item → that slot resolves to `null`; the component renders without it. Matches the existing `useEquippedCosmetics` behavior.
- Image src 404 → `<img onError>` hides itself, initials fall back. Matches current `Avatar`.
- No id at all → identical to "loading then resolved to null" — initials disc.

## Testing

- **Vitest unit tests** (in `packages/ui/src/components/PlayerAvatar/PlayerAvatar.test.tsx`)
  - renders initials when no avatarUrl
  - renders badge corner at sm/md/card (not at icon)
  - renders frame ring at sm/md/card (not at icon)
  - renders aura halo at md/card (not at icon/sm)
  - renders banner + name + level only at card
  - applies hex name color and gradient name color correctly
  - clickable when onPress provided
- **Vitest unit tests** for `EquippedPlayerAvatar` — uses a mocked catalog map and asserts the right URLs/colors are passed through.
- **Storybook** stories for each size + a "fully decked out" combo + a loading state.
- **Playwright e2e** — one happy‑path test that visits the chat after stubbing an equipped frame/aura/banner and asserts the composited avatar renders. Extends an existing chat e2e rather than adding a new spec.

## File size

Both `PlayerAvatar.tsx` and `EquippedPlayerAvatar.tsx` are well under the 500‑line limit. The existing `ShopMannequinStage.tsx` (~310 lines) shrinks after extraction.

## Migration strategy

A single PR. Land in this order so review can be incremental:

1. BE payload widening + schema‑side type updates.
2. `PlayerAvatar` in `@arcadeum/ui` + stories + tests.
3. `useEquippedCosmetics` extension + `EquippedPlayerAvatar` wrapper.
4. Swap call sites one feature at a time (chat first → games → profile/leaderboards/menus).
5. `ShopMannequinStage` refactor to use `PlayerAvatar` underneath.

Each step is independently reviewable and leaves the app working.

## Risks

- **Catalog cache miss on first paint** — already a known UX (avatar pops in after the catalog loads). Not regressing.
- **Frame/aura/banner color values** — verified during design: every banner/aura/frame entry in `apps/be/src/shop/lib/shop-catalog.ts` already has a populated `colorValue` (hex or linear-gradient). If a future catalog entry is added without one, the corresponding slot will silently no-op — acceptable.
- **`ChatMessage` prop change** — mitigated by the additive `senderAvatar` slot described above. No atomic cross-package commit required.
- **Playwright e2e selection** — extend `e2e/chat.spec.ts` (or whichever chat spec is currently green per the most recent run) rather than adding a new file, given recent flake-stabilization work on the chat specs.
