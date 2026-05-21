# ARC-728 — In-Game Player Avatars

## Goal

Show each player's avatar **inside an active game**, not only in the lobby:

- **Critical** (multiplayer card game): real avatar on every player's table card (desktop ring + mobile opponent strip), replacing the current initials/skull bubble.
- **Sea-Battle**: a small avatar disc anchored to the **top-left corner of each player's grid**, so the corner of the field identifies whose board the viewer is looking at.

The avatars must come from each player's equipped cosmetics (`equippedAvatarId`, `equippedBadgeId`) — the same source already used in the lobby, leaderboards, and chat.

## Non-Goals

- No new server payload. `GameRoomSummary.members[]` already carries every `equipped*` id; we only need to read it client-side.
- No avatar editor inside the field.
- No cosmetic frame / aura / banner inside the field — those compete visually with the game's own state rings (turn / seat color / eliminated). They keep working everywhere else.

## Approach

### Shared component

Add `apps/web/src/features/games/ui/InGameAvatar.tsx`:

```tsx
interface InGameAvatarProps {
  playerId: string;
  name: string;
  size?: PlayerAvatarSize; // 'icon' | 'sm' | 'md' | 'lg' | 'card'
  priority?: boolean;
  'data-testid'?: string;
}
```

Behavior:

1. Reads `room` from `useGameStore` (already the source of truth across both widgets).
2. Looks up `room.members.find(m => m.id === playerId)` to get `equippedAvatarId` and `equippedBadgeId`.
3. Pipes those through `useEquippedCosmetics` (existing hook, module-cached catalog).
4. Renders `<PlayerAvatar />` from `@arcadeum/ui` with `avatarUrl` + `badgeUrl` resolved, and `frameColor`/`auraColor`/`bannerColor`/`nameColor` explicitly `null` so the in-field rendering doesn't fight the game's state rings.
5. Bots (`bot-*`) and unknown ids → no member, no cosmetics → `PlayerAvatar` falls back to `Avatar` initials. Zero special-casing needed.

This keeps a single seam for both games and makes future tweaks (e.g. lazy avatar reveal, animation on turn change) a one-file change.

### Critical wiring

- `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx` — replace the `<PlayerAvatar>{initials}</PlayerAvatar>` block inside the decoration `<div>` (which hosts the turn / seat / eliminated rings) with `<InGameAvatar size={isMobile ? 'icon' : 'sm'} />`. Existing rings stay on the outer `<div>` and remain the state cue.
- `apps/web/src/widgets/CriticalGame/ui/opponents/OpponentTile.tsx` — replace the `initialsOf(displayName)` bubble (the alive branch) with `<InGameAvatar size="icon" />`. The skull on the eliminated branch is unchanged.

### Sea-Battle wiring

`apps/web/src/widgets/SeaBattleGame/ui/AttackBoard/AttackPlayerBoard.tsx` — overlay an `<InGameAvatar size="icon" />` absolutely-positioned at the **top-left** of the `PlayerSection`, for both the `isMe` branch and the opponent branch.

The corner is the natural identification anchor: the existing badge (`🎯 ATTACKING`, `🛡️ DEFENDING`, `🤝 TEAMMATE`) already lives at top-center, so top-left keeps the two pieces of state from overlapping. Avatar gets `pointer-events: none` so it never blocks board clicks.

## Test plan

- Unit (Vitest): `InGameAvatar.test.tsx` — resolves member from store, suppresses cosmetic frame/aura, returns initials fallback for bots and missing members.
- Adjust existing critical/sea-battle tests if (and only if) they assert on the initials text that the avatar replaces; the assertion becomes the new `data-testid` on the avatar.
- Manual: lobby → start critical → see real avatars on the table; lobby → start sea-battle → see avatars at the corner of every grid; bots still render as initials.

## File map

| Action | Path                                                                      |
| ------ | ------------------------------------------------------------------------- |
| add    | `apps/web/src/features/games/ui/InGameAvatar.tsx`                         |
| add    | `apps/web/src/features/games/ui/InGameAvatar.test.tsx`                    |
| edit   | `apps/web/src/features/games/ui/index.ts` (export)                        |
| edit   | `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx`                    |
| edit   | `apps/web/src/widgets/CriticalGame/ui/opponents/OpponentTile.tsx`         |
| edit   | `apps/web/src/widgets/SeaBattleGame/ui/AttackBoard/AttackPlayerBoard.tsx` |
