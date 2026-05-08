# Lobby Kick & Leave — Design Spec

## Summary

Add the ability for the host to remove (kick) players from a lobby/game, and for non-host players to leave a room via a UI button. Both actions require confirmation dialogs.

## Requirements

- Host can kick any non-host player from the room (lobby or in-progress)
- Non-host players see a "Leave Room" button to exit voluntarily
- Both actions show a confirmation dialog before executing
- Kicked players receive a notification and are redirected out of the room
- Works for all games that use `ReusableGameLobby` (Critical, Sea Battle, etc.)

## Approach

Reuse the existing `leaveRoom` backend method with an optional `kickedBy` parameter. A new `games.room.kick` socket event handles the host-initiated flow. The frontend adds kick buttons to player items and a leave button for non-host players.

---

## Backend

### DTO Changes

**`LeaveGameRoomDto`** — add optional field:

```ts
@IsOptional()
@IsString()
kickedBy?: string;
```

### `GameRoomsService.leaveRoom()`

Extend authorization logic:

- If `dto.kickedBy` is set: verify `dto.kickedBy === room.hostId`. The `userId` parameter is the target player being removed.
- If `dto.kickedBy` is not set: existing self-leave logic (user must be a participant).

No other changes to the removal logic (participant filtering, host reassignment, last-player deletion).

### `LeaveGameRoomResult`

Add field:

```ts
kicked: boolean; // true when kickedBy was set
```

### `GamesRealtimeService.emitPlayerLeft()`

Add `kicked: boolean` parameter. Include it in the `games.player.left` event payload:

```ts
emitPlayerLeft(
  room: GameRoomSummary | null,
  userId: string,
  roomDeleted: boolean,
  kicked: boolean,
): void
```

### `GamesService.leaveRoom()`

Pass the `kicked` flag from the result through to `emitPlayerLeft()`.

### New Gateway Event: `games.room.kick`

```ts
@SubscribeMessage('games.room.kick')
async handleKickPlayer(
  @ConnectedSocket() client: Socket,
  @MessageBody() payload: { roomId?: string; targetUserId?: string },
): Promise<{ success: boolean }>
```

- Extract `roomId` and `targetUserId` from payload
- Get `callerId` from socket auth (same pattern as other handlers)
- Call `gamesService.leaveRoom({ roomId, kickedBy: callerId }, targetUserId)`
- Emit `games.player.left` with `kicked: true` to the room channel
- Emit `games.room.kicked` directly to the kicked player's socket (find their socket by userId)
- Return `{ success: true }`

---

## Frontend — Store & Socket

### `gameStore.ts`

Add action to `GameState` interface:

```ts
kickPlayer: (roomId: string, targetUserId: string) => void;
```

Implementation emits `games.room.kick` via the game socket:

```ts
kickPlayer: (roomId, targetUserId) => {
  gameSocket.emit('games.room.kick', { roomId, targetUserId });
},
```

### Socket Listener: `games.room.kicked`

When the current user receives this event:

- Clear room state (same cleanup as `leaveRoom`)
- Set error: "You were kicked from the room by the host"

This triggers the existing error UI / redirect flow.

### Socket Listener: `games.player.left`

Already exists and updates the room state. The added `kicked` field is informational (no additional UI needed for v1).

---

## Frontend — UI Components

### `SortablePlayerItem`

Add optional prop:

```ts
onKick?: () => void;
```

When provided (host viewing a non-host player), render a small "X" button. Clicking calls `onKick`.

### `LobbySidebar`

Add props:

```ts
onKickPlayer?: (userId: string) => void;
onLeaveRoom?: () => void;
```

- Pass `onKickPlayer` as `onKick` to each `SortablePlayerItem` (for non-host members only)
- In the non-sortable player list (non-host view), also render a kick button for each non-host player when `onKickPlayer` is provided
- Render a "Leave Room" button at the bottom for non-host players (similar position to "Delete Room")
- Add two `ConfirmationModal` instances:
  - **Kick**: "Remove {playerName} from the room?"
  - **Leave**: "Are you sure you want to leave this room?"

### `ReusableGameLobby`

Add props:

```ts
onKickPlayer?: (userId: string) => void;
onLeaveRoom?: () => void;
```

Pass through to `LobbySidebar`. Add label props:

```ts
labels?: {
  // ... existing labels ...
  kickPlayerLabel?: string;
  leaveRoomLabel?: string;
};
```

### Game-Specific Lobbies

**`CriticalLobby`** and **`SeaBattleLobby`** — add `onKickPlayer` and `onLeaveRoom` props, pass them to `ReusableGameLobby`.

**`CriticalGame/Game.tsx`** and **`SeaBattleGame/Game.tsx`** — wire up:

- `onKickPlayer` from `gameStore.kickPlayer`
- `onLeaveRoom` from `gameStore.leaveRoom`

---

## i18n

Add keys to all 5 locales (`en`, `ru`, `es`, `fr`, `by`) under `games.common`:

| Key | English |
|-----|---------|
| `kickPlayer.button` | Remove |
| `kickPlayer.confirmTitle` | Remove Player |
| `kickPlayer.confirmMessage` | Are you sure you want to remove {{playerName}} from the room? |
| `kickPlayer.confirmButton` | Remove |
| `kickPlayer.cancelButton` | Cancel |
| `leaveRoom.button` | Leave Room |
| `leaveRoom.confirmTitle` | Leave Room |
| `leaveRoom.confirmMessage` | Are you sure you want to leave this room? |
| `leaveRoom.confirmButton` | Leave |
| `leaveRoom.cancelButton` | Stay |

---

## Files to Modify

### Backend
- `apps/be/src/games/dtos/leave-game-room.dto.ts` — add `kickedBy` field
- `apps/be/src/games/rooms/game-rooms.service.ts` — extend `leaveRoom()` authorization
- `apps/be/src/games/rooms/game-rooms.types.ts` — add `kicked` to `LeaveGameRoomResult`
- `apps/be/src/games/games.service.ts` — pass `kicked` to realtime
- `apps/be/src/games/games.realtime.service.ts` — add `kicked` param to `emitPlayerLeft()`
- `apps/be/src/games/games.gateway.ts` — add `handleKickPlayer` handler

### Frontend — Store
- `apps/web/src/features/games/store/gameStore.ts` — add `kickPlayer` action, `games.room.kicked` listener

### Frontend — UI
- `apps/web/src/features/games/ui/SortablePlayerItem.tsx` — add `onKick` prop & button
- `apps/web/src/features/games/ui/LobbySidebar.tsx` — add kick/leave props, confirmation modals
- `apps/web/src/features/games/ui/ReusableGameLobby.tsx` — add `onKickPlayer`/`onLeaveRoom` props
- `apps/web/src/widgets/CriticalGame/ui/CriticalLobby.tsx` — pass new props
- `apps/web/src/widgets/CriticalGame/ui/Game.tsx` — wire store actions
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx` — pass new props
- `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx` — wire store actions

### i18n (all 5 locales)
- `apps/web/src/shared/i18n/messages/games/shared/en.ts`
- `apps/web/src/shared/i18n/messages/games/shared/ru.ts`
- `apps/web/src/shared/i18n/messages/games/shared/es.ts`
- `apps/web/src/shared/i18n/messages/games/shared/fr.ts`
- `apps/web/src/shared/i18n/messages/games/shared/by.ts`

---

## Out of Scope

- Mobile app changes (can follow later using the same backend)
- Toast notifications for kicked events (v2)
- Kick reason / ban functionality
- Spectator kick
