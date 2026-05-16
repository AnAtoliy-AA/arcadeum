# In-Game Chat: Show Sender Identity (ARC-645)

## Problem

The in-game chat panel (`GameChat`) and the floating `ChatMessagePopup` do not
make it clear who sent each message:

- `GameChat` hardcodes `isOwn={false}` for every log
  ([apps/web/src/widgets/GameChat/ui/GameChat.tsx:147](../../apps/web/src/widgets/GameChat/ui/GameChat.tsx#L147)),
  so your own messages aren't differentiated and the alignment/styling never
  flips.
- The consumer mounts `<GameChat>` without `resolveDisplayName`
  ([apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx:125](../../apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx#L125)).
- The backend writes `senderName: null` when appending a history note
  ([apps/be/src/games/history/game-history.service.ts:426](../../apps/be/src/games/history/game-history.service.ts#L426)).
- The popup hook falls back to the literal string `"Player"`
  ([apps/web/src/widgets/GameChat/hooks/useLatestChatMessage.ts:33](../../apps/web/src/widgets/GameChat/hooks/useLatestChatMessage.ts#L33)).

Net result: messages render anonymously and own/foreign messages look the same.

## Goal

For every chat message in the in-game panel and the popup, the user can tell
**whose message it is** at a glance.

## Approach (selected)

Frontend-only fix at the mount point. `GamePageLayout` already has `userId` and
`room.members` — exactly the data needed to resolve `senderId` → display name
and compute `isOwn`. Mirrors the pattern the popup already uses for `isOwn`.

Rejected alternatives:

- Resolving inside `useGameChatIntegration`: would mutate store shape and add
  a second resolution path that competes with the popup.
- Filling `senderName` on the BE: cross-cuts BE/state/bandwidth, and still
  doesn't address `isOwn` (a per-viewer concept).

## Design

### 1. Resolver shared between panel and popup

In `GamePageLayout.tsx`, build a stable resolver:

```ts
const resolveDisplayName = useCallback(
  (id?: string | null, fallback?: string | null) => {
    if (id && userId && id === userId) return t('games.chat.you');
    const member = room.members?.find((m) => m.id === id);
    return member?.displayName ?? fallback ?? 'Player';
  },
  [room.members, userId, t],
);
```

Pass it to:

- `<GameChat resolveDisplayName={resolveDisplayName} currentUserId={userId} />`
- The popup path: resolve `senderName` from the latest message before
  rendering `<ChatMessagePopup>`.

### 2. `GameChat` props and per-log rendering

Add `currentUserId?: string | null` to `GameChatProps`. For each log:

```ts
const isOwn = !!currentUserId && log.senderId === currentUserId;
const resolvedName = resolveDisplayName
  ? resolveDisplayName(log.senderId ?? undefined, log.senderName ?? undefined)
  : (log.senderName ?? undefined);
```

Pass `isOwn` and `senderName={resolvedName}` to `<ChatMessage>`.

### 3. `ChatMessage`: own-message label

Today `ChatMessage` only renders the avatar+name strip when `!isOwn`. Add a
symmetric, minimal label for own messages so the user can scan whose-is-whose
without relying solely on alignment/color:

```tsx
{
  isOwn && !isSystem && senderName && (
    <XStack ai="center" gap="$2" mb="$1" px="$2" alignSelf="flex-end">
      <Typography
        uiSize="xs"
        weight="600"
        alpha="medium"
        letterSpacing={0.5}
        textTransform="uppercase"
      >
        {senderName}
      </Typography>
      <Avatar name={senderName} size="sm" src={avatarUrl} />
    </XStack>
  );
}
```

(Avatar on the right edge for own messages, on the left for others — already
how the bubbles are aligned via the existing `isOwn` variant.)

### 4. i18n

Add a single key `games.chat.you` ("You" / "Вы" / "Tú" / "Toi" / "Вы") to all
locale files. The Sea Battle resolver already has its own "You" key; we don't
share it because the chat resolver runs in non-Sea-Battle contexts too.

## Testing

- Unit (`packages/ui` or `widgets/GameChat`):
  - `ChatMessage` renders own-label when `isOwn && senderName`.
  - `GameChat` renders resolved names and computes `isOwn` from
    `currentUserId === log.senderId`.
- Existing e2e (`chat-interactions.spec.ts` includes a "show sender names in
  messages" case) — extend to assert that own messages also show a label.

## Out of scope

- Avatars sourced from user profile (the existing `<Avatar name=>` uses the
  initials gradient; that's fine for ARC-645).
- BE filling `senderName` — tracked separately if we ever want this for
  history export.

## Files touched

- `apps/web/src/widgets/GameChat/ui/GameChat.tsx`
- `apps/web/src/app/games/rooms/[id]/components/GamePageLayout.tsx`
- `apps/web/src/widgets/GameChat/hooks/useLatestChatMessage.ts` (optional —
  resolve at the call site instead)
- `packages/ui/src/components/Chat/ChatMessage.tsx`
- Locale files under `apps/web/src/shared/i18n/locales/` (add
  `games.chat.you`).
