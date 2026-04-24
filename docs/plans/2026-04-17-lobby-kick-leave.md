# Lobby Kick & Leave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow hosts to kick players and non-host players to leave rooms, with confirmation dialogs, across all games using ReusableGameLobby.

**Architecture:** Extend existing `leaveRoom` backend flow with an optional `kickedBy` field. A new `games.room.kick` gateway event handles host-initiated kicks. Frontend adds kick buttons to player items, a leave button for non-hosts, and confirmation modals in LobbySidebar.

**Tech Stack:** NestJS (backend gateway + service), Zustand (frontend store), socket.io, Tamagui (UI), class-validator (DTO), i18n (5 locales)

---

## File Structure

### Backend (modify)

- `apps/be/src/games/dtos/leave-game-room.dto.ts` — add `kickedBy` optional field
- `apps/be/src/games/rooms/game-rooms.types.ts:62-66` — add `kicked` to `LeaveGameRoomResult`
- `apps/be/src/games/rooms/game-rooms.service.ts:215-261` — extend `leaveRoom()` authorization for kick flow
- `apps/be/src/games/games.realtime.service.ts:189-207` — add `kicked` param to `emitPlayerLeft()`
- `apps/be/src/games/games.service.ts:129-151` — pass `kicked` flag through to realtime
- `apps/be/src/games/games.gateway.ts:165-207` — add `handleKickPlayer` handler (new event)

### Frontend Store (modify)

- `apps/web/src/features/games/store/gameStore.ts` — add `kickPlayer` action + `games.room.kicked` listener

### Frontend UI (modify)

- `apps/web/src/features/games/ui/SortablePlayerItem.tsx` — add `onKick` prop + kick button
- `apps/web/src/features/games/ui/LobbySidebar.tsx` — add kick/leave props, confirmation modals, leave button
- `apps/web/src/features/games/ui/ReusableGameLobby.tsx` — pass through `onKickPlayer`/`onLeaveRoom` props
- `apps/web/src/widgets/CriticalGame/ui/CriticalLobby.tsx` — accept + forward new props
- `apps/web/src/widgets/CriticalGame/ui/Game.tsx` — wire store actions to lobby
- `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx` — accept + forward new props
- `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx` — wire store actions to lobby

### i18n (modify, all 5 locales)

- `apps/web/src/shared/i18n/messages/games/shared/en.ts`
- `apps/web/src/shared/i18n/messages/games/shared/ru.ts`
- `apps/web/src/shared/i18n/messages/games/shared/es.ts`
- `apps/web/src/shared/i18n/messages/games/shared/fr.ts`
- `apps/web/src/shared/i18n/messages/games/shared/by.ts`

---

### Task 1: Backend DTO & Types

**Files:**

- Modify: `apps/be/src/games/dtos/leave-game-room.dto.ts`
- Modify: `apps/be/src/games/rooms/game-rooms.types.ts:62-66`

- [ ] **Step 1: Add `kickedBy` to LeaveGameRoomDto**

In `apps/be/src/games/dtos/leave-game-room.dto.ts`, add optional `kickedBy` field:

```ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LeaveGameRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsOptional()
  @IsString()
  kickedBy?: string;
}
```

- [ ] **Step 2: Add `kicked` to LeaveGameRoomResult**

In `apps/be/src/games/rooms/game-rooms.types.ts`, add `kicked: boolean` to `LeaveGameRoomResult`:

```ts
export interface LeaveGameRoomResult {
  room: GameRoomSummary | null;
  deleted: boolean;
  removedPlayerId: string;
  kicked: boolean;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/games/dtos/leave-game-room.dto.ts apps/be/src/games/rooms/game-rooms.types.ts
git commit -m "feat(games): add kickedBy to LeaveGameRoomDto and kicked flag to result type"
```

---

### Task 2: Backend Service — Extend `leaveRoom()` Authorization

**Files:**

- Modify: `apps/be/src/games/rooms/game-rooms.service.ts:215-261`

- [ ] **Step 1: Update leaveRoom to handle kick authorization**

In `apps/be/src/games/rooms/game-rooms.service.ts`, modify `leaveRoom()` (starts at line 215). The key change: when `dto.kickedBy` is set, verify the caller is the host and the target is not the host themselves. Otherwise, keep existing self-leave logic.

```ts
async leaveRoom(
  dto: LeaveGameRoomDto,
  userId: string,
): Promise<LeaveGameRoomResult> {
  const room = await this.gameRoomModel.findById(dto.roomId).exec();

  if (!room) {
    throw new NotFoundException(`Room not found: ${dto.roomId}`);
  }

  const kicked = !!dto.kickedBy;

  if (kicked) {
    // Kick flow: verify caller is host
    if (dto.kickedBy !== room.hostId) {
      throw new ForbiddenException('Only the host can kick players');
    }
    // Prevent host from kicking themselves
    if (userId === dto.kickedBy) {
      throw new BadRequestException('Cannot kick yourself');
    }
    // Verify target is a participant
    const isTargetParticipant = room.participants.some(
      (p) => p.userId === userId,
    );
    if (!isTargetParticipant) {
      throw new BadRequestException('Target is not a member of this room');
    }
  } else {
    // Self-leave flow (existing logic)
    const isHost = room.hostId === userId;
    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (!isHost && !isParticipant) {
      throw new BadRequestException('Not a member of this room');
    }
  }

  // If it's the last player, delete the room
  if (room.participants.length === 1) {
    await this.gameRoomModel.findByIdAndDelete(dto.roomId).exec();
    return {
      room: null,
      deleted: true,
      removedPlayerId: userId,
      kicked,
    };
  }

  // Remove participant
  room.participants = room.participants.filter((p) => p.userId !== userId);

  // If host left, assign new host (next player in list)
  if (room.hostId === userId) {
    room.hostId = room.participants[0].userId;
  }

  room.updatedAt = new Date();
  await room.save();

  const summary = await this.gameRoomsMapper.prepareRoomSummary(room, userId);

  return {
    room: summary,
    deleted: false,
    removedPlayerId: userId,
    kicked,
  };
}
```

- [ ] **Step 2: Verify `ForbiddenException` is imported**

Check the imports at the top of `game-rooms.service.ts`. If `ForbiddenException` is not already imported from `@nestjs/common`, add it.

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/games/rooms/game-rooms.service.ts
git commit -m "feat(games): extend leaveRoom authorization for host kick flow"
```

---

### Task 3: Backend — Realtime & Service Layer

**Files:**

- Modify: `apps/be/src/games/games.realtime.service.ts:189-207`
- Modify: `apps/be/src/games/games.service.ts:129-151`

- [ ] **Step 1: Add `kicked` param to `emitPlayerLeft()`**

In `apps/be/src/games/games.realtime.service.ts`, update `emitPlayerLeft` signature and payload (line 189):

```ts
emitPlayerLeft(
  room: GameRoomSummary | null,
  userId: string,
  roomDeleted: boolean,
  kicked = false,
): void {
  if (!this.server || !room) {
    return;
  }
  this.server.to(this.roomChannel(room.id)).emit(
    'games.player.left',
    maybeEncrypt({
      room,
      userId,
      roomDeleted,
      kicked,
    }),
  );
  // Also broadcast global update for lobbies
  this.server.emit('games.room.updated', maybeEncrypt({ room }));
}
```

- [ ] **Step 2: Pass `kicked` flag in `GamesService.leaveRoom()`**

In `apps/be/src/games/games.service.ts`, update `leaveRoom` (line 129) to pass `result.kicked` to `emitPlayerLeft()`:

```ts
async leaveRoom(dto: LeaveGameRoomDto, userId: string) {
  const result = await this.roomsService.leaveRoom(dto, userId);

  // Remove player from session if exists
  if (!result.deleted) {
    const session = await this.sessionsService.findSessionByRoom(dto.roomId);
    if (session) {
      const updatedSession = await this.sessionsService.removePlayer(
        session.id,
        userId,
      );
      // Sync status if game completed via leave/forfeit
      if (updatedSession.status === 'completed') {
        await this.roomsService.updateRoomStatus(dto.roomId, 'completed');
      }
    }
  }

  // Emit real-time event
  this.realtimeService.emitPlayerLeft(
    result.room,
    userId,
    result.deleted,
    result.kicked,
  );

  return result;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/be/src/games/games.realtime.service.ts apps/be/src/games/games.service.ts
git commit -m "feat(games): pass kicked flag through realtime emitPlayerLeft"
```

---

### Task 4: Backend Gateway — `handleKickPlayer` Event

**Files:**

- Modify: `apps/be/src/games/games.gateway.ts`

- [ ] **Step 1: Add `handleKickPlayer` handler**

Add a new handler after `handleLeaveRoom` (after line 207) in `apps/be/src/games/games.gateway.ts`. Follow the same pattern as `handleLeaveRoom`: extract params from payload, try/catch, return `{ success }`.

Note: The existing gateway convention is to extract all identifiers from the message payload (not from socket handshake auth). Follow this pattern — accept `callerId` in the payload alongside `roomId` and `targetUserId`.

```ts
@SubscribeMessage('games.room.kick')
async handleKickPlayer(
  @ConnectedSocket() client: Socket,
  @MessageBody() payload: { roomId?: string; targetUserId?: string; callerId?: string },
): Promise<{ success: boolean }> {
  const roomId = extractString(payload, 'roomId');
  const targetUserId = extractString(payload, 'targetUserId');
  const callerId = extractString(payload, 'callerId');

  if (!roomId) throw new WsException('roomId is required.');
  if (!targetUserId) throw new WsException('targetUserId is required.');
  if (!callerId) throw new WsException('callerId is required.');

  this.logger.log(
    `Host ${callerId} kicking user ${targetUserId} from room ${roomId}`,
  );

  try {
    await this.gamesService.leaveRoom(
      { roomId, kickedBy: callerId },
      targetUserId,
    );

    // Emit kicked event to the room channel — the kicked player is still
    // subscribed to this channel, so they will receive it. The client
    // checks if targetUserId matches their own userId.
    const channel = this.realtime.roomChannel(roomId);
    this.server.to(channel).emit(
      'games.room.kicked',
      maybeEncrypt({ roomId, targetUserId }),
    );

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to kick player';
    this.logger.error(
      `Failed to kick user ${targetUserId} from room ${roomId}: ${message}`,
    );
    return { success: false };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/be/src/games/games.gateway.ts
git commit -m "feat(games): add games.room.kick gateway handler"
```

---

### Task 5: i18n — All 5 Locales

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/games/shared/en.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/shared/ru.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/shared/es.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/shared/fr.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/shared/by.ts`

- [ ] **Step 1: Add English keys**

In `en.ts`, add after the `deleteRoom` block inside `common` (after line 85):

```ts
kickPlayer: {
  button: 'Remove',
  confirmTitle: 'Remove Player',
  confirmMessage:
    'Are you sure you want to remove {{playerName}} from the room?',
  confirmButton: 'Remove',
  cancelButton: 'Cancel',
},
leaveRoom: {
  button: 'Leave Room',
  confirmTitle: 'Leave Room',
  confirmMessage: 'Are you sure you want to leave this room?',
  confirmButton: 'Leave',
  cancelButton: 'Stay',
},
```

- [ ] **Step 2: Add Russian keys**

In `ru.ts`, add after `deleteRoom` block inside `common` (after line 85):

```ts
kickPlayer: {
  button: 'Удалить',
  confirmTitle: 'Удалить игрока',
  confirmMessage:
    'Вы уверены, что хотите удалить {{playerName}} из комнаты?',
  confirmButton: 'Удалить',
  cancelButton: 'Отмена',
},
leaveRoom: {
  button: 'Покинуть комнату',
  confirmTitle: 'Покинуть комнату',
  confirmMessage: 'Вы уверены, что хотите покинуть эту комнату?',
  confirmButton: 'Покинуть',
  cancelButton: 'Остаться',
},
```

- [ ] **Step 3: Add Spanish keys**

In `es.ts`, add after `deleteRoom` block inside `common` (after line 85):

```ts
kickPlayer: {
  button: 'Eliminar',
  confirmTitle: 'Eliminar jugador',
  confirmMessage:
    '¿Estás seguro de que quieres eliminar a {{playerName}} de la sala?',
  confirmButton: 'Eliminar',
  cancelButton: 'Cancelar',
},
leaveRoom: {
  button: 'Salir de la sala',
  confirmTitle: 'Salir de la sala',
  confirmMessage: '¿Estás seguro de que quieres salir de esta sala?',
  confirmButton: 'Salir',
  cancelButton: 'Quedarse',
},
```

- [ ] **Step 4: Add French keys**

In `fr.ts`, add after `deleteRoom` block inside `common` (after line 85):

```ts
kickPlayer: {
  button: 'Retirer',
  confirmTitle: 'Retirer le joueur',
  confirmMessage:
    'Êtes-vous sûr de vouloir retirer {{playerName}} de la salle ?',
  confirmButton: 'Retirer',
  cancelButton: 'Annuler',
},
leaveRoom: {
  button: 'Quitter la salle',
  confirmTitle: 'Quitter la salle',
  confirmMessage: 'Êtes-vous sûr de vouloir quitter cette salle ?',
  confirmButton: 'Quitter',
  cancelButton: 'Rester',
},
```

- [ ] **Step 5: Add Belarusian keys**

In `by.ts`, add after `deleteRoom` block inside `common` (after line 85):

```ts
kickPlayer: {
  button: 'Выдаліць',
  confirmTitle: 'Выдаліць гульца',
  confirmMessage:
    'Вы ўпэўненыя, што хочаце выдаліць {{playerName}} з залы?',
  confirmButton: 'Выдаліць',
  cancelButton: 'Адмена',
},
leaveRoom: {
  button: 'Пакінуць залу',
  confirmTitle: 'Пакінуць залу',
  confirmMessage: 'Вы ўпэўненыя, што хочаце пакінуць гэтую залу?',
  confirmButton: 'Пакінуць',
  cancelButton: 'Застацца',
},
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/shared/i18n/messages/games/shared/en.ts apps/web/src/shared/i18n/messages/games/shared/ru.ts apps/web/src/shared/i18n/messages/games/shared/es.ts apps/web/src/shared/i18n/messages/games/shared/fr.ts apps/web/src/shared/i18n/messages/games/shared/by.ts
git commit -m "feat(games): add kick/leave i18n keys for all 5 locales"
```

---

### Task 6: Frontend Store — `kickPlayer` Action & `games.room.kicked` Listener

**Files:**

- Modify: `apps/web/src/features/games/store/gameStore.ts`

- [ ] **Step 1: Add `kickPlayer` to `GameState` interface**

In `gameStore.ts`, add to the `GameState` interface (after `leaveRoom` on line 37):

```ts
kickPlayer: (roomId: string, targetUserId: string, callerId: string) => void;
```

- [ ] **Step 2: Add `kickPlayer` action implementation**

After the `leaveRoom` action (after line 267), add:

```ts
kickPlayer: (roomId, targetUserId, callerId) => {
  gameSocket.emit('games.room.kick', { roomId, targetUserId, callerId });
},
```

- [ ] **Step 3: Add `games.room.kicked` socket listener**

In the `connect` function where handlers are defined (around line 132-143 area, after `handlePlayerLeft`), add a new handler:

```ts
const handleKicked = (payload: { roomId?: string; targetUserId?: string }) => {
  if (payload?.targetUserId === userId && payload?.roomId === roomId) {
    set({
      room: null,
      session: null,
      error: 'You were kicked from the room by the host',
      idlePlayers: [],
      accessToken: null,
    });
  }
};
```

Then register it with the other socket listeners (look for where `gameSocket.on('games.player.left', ...)` is registered) and add:

```ts
gameSocket.on(
  'games.room.kicked',
  decryptHandler(handleKicked, 'games.room.kicked'),
);
```

Also add it to the cleanup function so it's removed on disconnect:

```ts
gameSocket.off('games.room.kicked', ...);
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/games/store/gameStore.ts
git commit -m "feat(games): add kickPlayer store action and games.room.kicked listener"
```

---

### Task 7: Frontend UI — SortablePlayerItem Kick Button

**Files:**

- Modify: `apps/web/src/features/games/ui/SortablePlayerItem.tsx`

- [ ] **Step 1: Add `onKick` prop to interface and component**

In `SortablePlayerItem.tsx`, add `onKick` to the props interface (line 26-34):

```ts
export interface SortablePlayerItemProps {
  member: GameRoomMemberSummary;
  isHost: boolean;
  isRoomHost: boolean;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onKick?: () => void;
}
```

Add `onKick` to the destructured props in the function signature.

- [ ] **Step 2: Add kick button to the render**

Inside the `<PlayerItem>` component, after the reorder buttons `<XStack>` block (line 84-114), add a kick button that renders when `onKick` is provided and the player is not the room host:

```tsx
{
  onKick && !isRoomHost && (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        onKick();
      }}
      paddingVertical="$1"
      paddingHorizontal="$2"
      minWidth="auto"
      style={{ color: '#ef4444' }}
    >
      ✕
    </Button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/games/ui/SortablePlayerItem.tsx
git commit -m "feat(games): add onKick prop and kick button to SortablePlayerItem"
```

---

### Task 8: Frontend UI — LobbySidebar Kick/Leave

**Files:**

- Modify: `apps/web/src/features/games/ui/LobbySidebar.tsx`

- [ ] **Step 1: Add new props to LobbySidebar interface**

In `LobbySidebar.tsx`, extend `LobbySidebarProps` (line 48-77) to add:

```ts
onKickPlayer?: (userId: string) => void;
onLeaveRoom?: () => void;
```

Add to the `labels` type:

```ts
kickPlayerLabel?: string;
leaveRoomLabel?: string;
```

Destructure the new props in the function.

- [ ] **Step 2: Import ConfirmationModal**

Add import at the top:

```ts
import { ConfirmationModal } from './ConfirmationModal';
```

- [ ] **Step 3: Add confirmation modal state and translations**

Inside the component function, add state and translations:

```ts
const [kickTarget, setKickTarget] = React.useState<{
  id: string;
  name: string;
} | null>(null);
const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);
```

- [ ] **Step 4: Pass `onKick` to SortablePlayerItem in DnD section**

In the DnD host section (line 183-204), add `onKick` to each `SortablePlayerItem`:

```tsx
<SortablePlayerItem
  key={member.id}
  member={member}
  isHost={isHost}
  isRoomHost={member.id === room.hostId}
  index={index}
  totalCount={members.length}
  onMoveUp={...}
  onMoveDown={...}
  onKick={
    onKickPlayer && member.id !== room.hostId
      ? () => setKickTarget({ id: member.id, name: member.displayName })
      : undefined
  }
/>
```

- [ ] **Step 5: Add kick button to non-host player list**

In the non-DnD section (line 208-229), add a kick button for non-host players when `onKickPlayer` is provided. After the `<PlayerInfo>` block for each member:

```tsx
{
  onKickPlayer && !isRoomHost && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setKickTarget({ id: member.id, name: member.displayName })}
      onPress={() => setKickTarget({ id: member.id, name: member.displayName })}
      paddingVertical="$1"
      paddingHorizontal="$2"
      minWidth="auto"
      style={{ color: '#ef4444' }}
    >
      ✕
    </Button>
  );
}
```

- [ ] **Step 6: Add Leave Room button and confirmation modals**

Before the closing `</Sidebar>` tag (line 356), add the Leave Room button for non-host players and the two confirmation modals:

```tsx
{!isHost && onLeaveRoom && (
  <DeleteButton
    onClick={() => setShowLeaveConfirm(true)}
    onPress={() => setShowLeaveConfirm(true)}
    marginTop="$2"
    width="100%"
  >
    {labels.leaveRoomLabel || t('games.common.leaveRoom.button')}
  </DeleteButton>
)}

<ConfirmationModal
  open={!!kickTarget}
  onClose={() => setKickTarget(null)}
  onConfirm={() => {
    if (kickTarget) {
      onKickPlayer?.(kickTarget.id);
      setKickTarget(null);
    }
  }}
  title={t('games.common.kickPlayer.confirmTitle')}
  message={t('games.common.kickPlayer.confirmMessage', {
    playerName: kickTarget?.name ?? '',
  })}
  confirmLabel={t('games.common.kickPlayer.confirmButton')}
  cancelLabel={t('games.common.kickPlayer.cancelButton')}
/>

<ConfirmationModal
  open={showLeaveConfirm}
  onClose={() => setShowLeaveConfirm(false)}
  onConfirm={onLeaveRoom}
  title={t('games.common.leaveRoom.confirmTitle')}
  message={t('games.common.leaveRoom.confirmMessage')}
  confirmLabel={t('games.common.leaveRoom.confirmButton')}
  cancelLabel={t('games.common.leaveRoom.cancelButton')}
/>
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/games/ui/LobbySidebar.tsx
git commit -m "feat(games): add kick/leave UI to LobbySidebar with confirmation modals"
```

---

### Task 9: Frontend UI — ReusableGameLobby Prop Pass-Through

**Files:**

- Modify: `apps/web/src/features/games/ui/ReusableGameLobby.tsx`

- [ ] **Step 1: Add props to ReusableGameLobbyProps interface**

In `ReusableGameLobby.tsx`, add to `ReusableGameLobbyProps` (line 53-116):

```ts
onKickPlayer?: (userId: string) => void;
onLeaveRoom?: () => void;
```

Also add to the `labels` type (line 77-98):

```ts
kickPlayerLabel?: string;
leaveRoomLabel?: string;
```

- [ ] **Step 2: Destructure and pass to LobbySidebar**

Destructure `onKickPlayer` and `onLeaveRoom` in the component function (line 138). Then pass them to `<LobbySidebar>` (line 372-387):

```tsx
<LobbySidebar
  room={room}
  isHost={isHost}
  minPlayers={minPlayers}
  isFastMode={isFastMode}
  showReorderControls={showReorderControls}
  showInvitedPlayers={showInvitedPlayers}
  members={members}
  onReorderPlayers={onReorderPlayers}
  onReinvite={onReinvite}
  onDeleteRoom={isHost ? handleDeleteClick : undefined}
  deleteRoomLabel={deleteRoomLabel || deleteRoomTranslations.button}
  extraPlayersCardSlot={extraPlayersCardSlot}
  onRefresh={onRefresh}
  labels={labels}
  onKickPlayer={isHost ? onKickPlayer : undefined}
  onLeaveRoom={!isHost ? onLeaveRoom : undefined}
/>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/games/ui/ReusableGameLobby.tsx
git commit -m "feat(games): pass onKickPlayer/onLeaveRoom through ReusableGameLobby"
```

---

### Task 10: Game-Specific Lobbies — CriticalGame

**Files:**

- Modify: `apps/web/src/widgets/CriticalGame/ui/CriticalLobby.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/Game.tsx`

- [ ] **Step 1: Add props to CriticalLobbyProps**

In `CriticalLobby.tsx`, add to `CriticalLobbyProps` interface (line 44-57):

```ts
onKickPlayer?: (userId: string) => void;
onLeaveRoom?: () => void;
```

Destructure them in the function (line 59-72).

- [ ] **Step 2: Pass to ReusableGameLobby**

In the `<ReusableGameLobby>` JSX (line 123-176), add:

```tsx
onKickPlayer = { onKickPlayer };
onLeaveRoom = { onLeaveRoom };
```

- [ ] **Step 3: Wire store actions in CriticalGame/Game.tsx**

In `Game.tsx` (line 29-31), add store selectors:

```ts
const storeKickPlayer = useGameStore((s: GameState) => s.kickPlayer);
const storeLeaveRoom = useGameStore((s: GameState) => s.leaveRoom);
```

In the `<CriticalLobby>` JSX (line 65-77), add:

```tsx
onKickPlayer={(targetUserId) => storeKickPlayer(roomId, targetUserId, currentUserId)}
onLeaveRoom={() => storeLeaveRoom(roomId, currentUserId)}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/CriticalGame/ui/CriticalLobby.tsx apps/web/src/widgets/CriticalGame/ui/Game.tsx
git commit -m "feat(games): wire kick/leave to CriticalGame lobby"
```

---

### Task 11: Game-Specific Lobbies — SeaBattleGame

**Files:**

- Modify: `apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx`
- Modify: `apps/web/src/widgets/SeaBattleGame/ui/Game.tsx`

- [ ] **Step 1: Add props to SeaBattleLobbyProps**

In `SeaBattleLobby.tsx`, add to `SeaBattleLobbyProps` interface (line 38-48):

```ts
onKickPlayer?: (userId: string) => void;
onLeaveRoom?: () => void;
```

Destructure them in the function (line 50-60).

- [ ] **Step 2: Pass to ReusableGameLobby**

In the `<ReusableGameLobby>` JSX (line 177-211), add:

```tsx
onKickPlayer = { onKickPlayer };
onLeaveRoom = { onLeaveRoom };
```

- [ ] **Step 3: Wire store actions in SeaBattleGame/Game.tsx**

In `Game.tsx` (line 49-51), add store selectors:

```ts
const storeKickPlayer = useGameStore((s: GameState) => s.kickPlayer);
const storeLeaveRoom = useGameStore((s: GameState) => s.leaveRoom);
```

In the `<SeaBattleLobby>` JSX (line 212-222), add:

```tsx
onKickPlayer={(targetUserId) => storeKickPlayer(roomId, targetUserId, currentUserId)}
onLeaveRoom={() => storeLeaveRoom(roomId, currentUserId)}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/widgets/SeaBattleGame/ui/SeaBattleLobby.tsx apps/web/src/widgets/SeaBattleGame/ui/Game.tsx
git commit -m "feat(games): wire kick/leave to SeaBattleGame lobby"
```

---

### Task 12: Verify Build & Lint

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: No new errors.

- [ ] **Step 2: Run type check**

```bash
pnpm build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 3: Run file length check**

```bash
pnpm check-file-length
```

Expected: No files exceed 500 lines.

- [ ] **Step 4: Fix any issues found**

Address lint, type, or file-length violations.

- [ ] **Step 5: Commit fixes if needed**

```bash
git add -A
git commit -m "fix(games): address lint and type errors for kick/leave feature"
```
