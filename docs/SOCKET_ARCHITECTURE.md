# Socket Architecture

Central reference for the WebSocket infrastructure in the Arcadeum web app.

## Socket Instances

All sockets are singletons in `apps/web/src/shared/lib/socket.ts`.

| Export              | Namespace       | Purpose                               |
| ------------------- | --------------- | ------------------------------------- |
| `gameSocket`        | `/games`        | Game rooms, matchmaking, game actions |
| `chatSocket`        | `/` (root)      | In-game and global chat               |
| `leaderboardSocket` | `/leaderboards` | Leaderboard live updates              |
| `friendsSocket`     | `/friends`      | Friend list, online status            |
| `walletSocket`      | `/wallet`       | Wallet balance push                   |

All are created with `autoConnect: false`. They must be explicitly connected.

## Authentication

```ts
// Authenticated: pass JWT token
connectSockets(token);

// Anonymous: pass userId only (no token)
connectSocketsAnonymous(userId);
```

- `connectSockets(token)` — connects games, chat, friends sockets. If `token` is falsy, it calls `disconnectSockets()`.
- `connectSocketsAnonymous(userId)` — clears auth, passes `anonId` as a query param, connects games socket only.
- Both are idempotent: calling them when already connected with the same token is a no-op.

## Connection Status

`apps/web/src/shared/lib/socket-status.ts` exposes `useSocketStatus`:

```ts
{
  isConnected: boolean; // false when gamesSocket is disconnected
  hasEverConnected: boolean; // true after first connect (never resets)
  reconnectAttempts: number;
}
```

The red `ConnectionBanner` shows when `!isConnected && hasEverConnected`.

## Lifecycle Rules

### Rule 1: Every page that needs sockets must connect them

```tsx
// Authenticated page
useEffect(() => {
  if (snapshot.accessToken) {
    connectSockets(snapshot.accessToken);
  }
}, [snapshot.accessToken]);

// Anonymous-capable page
useEffect(() => {
  if (snapshot.accessToken) {
    connectSockets(snapshot.accessToken);
  } else if (snapshot.userId) {
    connectSocketsAnonymous(snapshot.userId);
  }
}, [snapshot.accessToken, snapshot.userId]);
```

**Never** rely on another page having connected sockets. Each page must call `connectSockets` / `connectSocketsAnonymous` on mount.

### Rule 2: Never call `disconnectSockets` on page navigation

`disconnectSockets()` destroys all sockets (games, chat, leaderboard, friends, wallet) and clears encryption keys. It is only for:

- Logout
- Token expiry / forced re-auth

Page unmounts must NOT disconnect sockets.

### Rule 3: Page-specific sockets use connect/disconnect pattern

Leaderboard, friends, and wallet sockets are page-scoped. Connect on mount, disconnect on unmount:

```tsx
useEffect(() => {
  const disconnect = connectLeaderboardSocket(token);
  return disconnect; // disconnects on unmount
}, [token]);
```

Games and chat sockets are global — they stay connected across pages.

### Rule 4: Game room connection uses `gameStore.connect()`

The `gameStore.connect()` function is called by the `useGameRoom` hook. It:

1. Registers socket event listeners (`games.room.joined`, `games.room.update`, etc.)
2. Auto-joins the room on connect
3. Cleans up listeners on disconnect

`gameStore.disconnect()` only removes listeners — it does NOT disconnect the socket.

### Rule 5: Anonymous users must use `connectSocketsAnonymous`

Anonymous users have no JWT. Calling `connectSockets(undefined)` triggers `disconnectSockets()` which kills the connection. Always check for anonymous userId:

```tsx
if (snapshot.accessToken) {
  connectSockets(snapshot.accessToken);
} else if (snapshot.userId) {
  connectSocketsAnonymous(snapshot.userId);
}
```

## Common Pitfalls

### "Connection lost" banner after navigating away from a room

**Cause**: Page called `connectSockets(undefined)` which triggers `disconnectSockets()`.

**Fix**: Check for anonymous userId and call `connectSocketsAnonymous` instead.

### Start button does nothing in room

**Cause**: `connectSockets` was never called (anonymous user without auth), so `gameSocket.connected` is false. All emits are silently swallowed by `guardEmit`.

**Fix**: Ensure `GameRoomPage` calls `connectSocketsAnonymous(userId)` for anonymous users.

### Banner shows briefly then disappears on page load

**Normal**: Socket reconnecting. Banner shows during reconnect. If it disappears within a few seconds, this is expected behavior.

### Banner stays permanently

**Cause**: Socket was disconnected and nothing reconnects it.

**Fix**: Check that the current page calls `connectSockets` / `connectSocketsAnonymous` in a `useEffect`.

## File Reference

| File                                  | Role                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `shared/lib/socket.ts`                | Socket singletons, `connectSockets`, `connectSocketsAnonymous`, `disconnectSockets` |
| `shared/lib/socket-status.ts`         | `useSocketStatus` store                                                             |
| `shared/ui/ConnectionBanner.tsx`      | Red banner component                                                                |
| `features/games/store/gameStore.ts`   | `connect()`, `disconnect()`, room listeners                                         |
| `features/games/hooks/useGameRoom.ts` | Hook that calls `gameStore.connect()`                                               |
| `shared/hooks/useIdleReconnect.ts`    | Reconnect logic when idle in a room                                                 |
