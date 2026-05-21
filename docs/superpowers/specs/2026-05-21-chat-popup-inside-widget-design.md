# Chat message popup inside the game widget (ARC-735)

## Problem

When another player sends a chat message during a game, the popup that flashes the message currently anchors to the top-right of the **viewport** (`position: fixed; top: 24; right: 24`). It's rendered in `GamePageLayout` outside the game widget DOM. This makes the popup feel detached from the game and, in widget-only fullscreen mode, the popup ends up far from the player's focus area.

Goal: anchor the popup to the **top-right of the game widget container**, and suppress it when the chat panel is already visible.

## Scope

- Web app only (`apps/web`). Mobile chat already lives in dedicated screens.
- Sea Battle, Critical, Glimworm, and any future game using `GameWidgetContainer` get the new behavior automatically.
- No backend or shared `@arcadeum/ui` changes.

## Design

### Architecture

The popup moves from `GamePageLayout` into the widget. A new overlay component lives inside `GameWidgetContainer`'s container element (already `position: relative`). The overlay reads everything it needs from the existing `useGameChatStore`, which is extended with three fields. `GamePageLayout` becomes the writer of those fields.

```
GamePageLayout
  ├─ effects: write { currentUserId, resolveEquipped, chatPanelOpen } into store
  ├─ render children() ── game widget ── GameWidgetContainer
  │                                        └─ <GameChatPopupOverlay />  ← reads store
  └─ ChatPanel (GameChat list)
```

### Components

**Extended `useGameChatStore`** (`apps/web/src/widgets/GameChat/store/gameChatStore.ts`):

```ts
type EquippedItems = {
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId: string | null;
  equippedFrameId: string | null;
  equippedAuraId: string | null;
  equippedBannerId: string | null;
};

type ChatEquippedResolver = (id: string | null) => EquippedItems | null;

// New fields and setters:
currentUserId: string | null;
setCurrentUserId: (id: string | null) => void;

resolveEquipped: ChatEquippedResolver | null;
registerResolveEquipped: (fn: ChatEquippedResolver | null) => void;

chatPanelOpen: boolean;
setChatPanelOpen: (open: boolean) => void;
```

The existing `clear()` method must also reset these new fields when a game session ends.

**New `GameChatPopupOverlay`** (`apps/web/src/widgets/GameChat/ui/GameChatPopupOverlay.tsx`):

- Reads from store: `logs`, `resolveDisplayName`, `resolveEquipped`, `currentUserId`, `chatPanelOpen`.
- Calls existing `useLatestChatMessage(logs)`.
- If `chatPanelOpen` is true → returns `null` (no popup needed; user can see the chat).
- Otherwise computes `popupSenderName` (via `resolveDisplayName`) and `popupSender` equipped fields (via `resolveEquipped`), then renders `<ChatMessagePopup />`.

**Modified `ChatMessagePopup`** (`apps/web/src/widgets/GameChat/ui/ChatMessagePopup.tsx`):

- Single line change: `position: 'fixed'` → `position: 'absolute'`.
- Keeps `top: 24; right: 24; z-index: 10000` — now relative to the nearest positioned ancestor (the widget `Container`).

**Modified `GameWidgetContainer`** (`apps/web/src/features/games/ui/GameWidgetContainer.tsx`):

- Import and render `<GameChatPopupOverlay />` once, inside the existing `<Container>`, after `{modals}`. Always present; the overlay handles its own conditional rendering.

**Modified `GamePageLayout`** (`apps/web/src/app/[locale]/games/rooms/[id]/components/GamePageLayout.tsx`):

- Remove `ChatMessagePopup` import, `useLatestChatMessage` call, and the JSX block that renders the popup (currently lines ~82–84, ~121–127, ~181–197).
- Add three `useEffect`s that push `userId`, `resolveEquipped`, and `showChat` into the store via the new setters. `resolveDisplayName` is already registered via `useGameChatStore` patterns (existing `registeredResolver`).

### Data flow on a new message

1. Backend → game session snapshot → game widget calls `useGameChatIntegration(logs, …)` → store `logs` array updates.
2. `GameChatPopupOverlay` (rendered inside `GameWidgetContainer`) re-renders because it subscribes to `logs` (and other fields).
3. `useLatestChatMessage(logs)` returns the newest non-dismissed `type: 'message'` log.
4. If `chatPanelOpen === true`, overlay returns null.
5. Otherwise overlay resolves sender name + equipped items from store-registered resolvers and renders `<ChatMessagePopup position: absolute />`.
6. The popup anchors to the widget's `Container` element. In widget-only fullscreen the container goes `position: fixed; inset: 0` and the popup follows it.

### Error and edge handling

- **Resolver not yet registered**: popup renders with null equipped fields. `ChatMessageBubble` already tolerates this.
- **`currentUserId` not set**: `isOwn` resolves to false. Acceptable while loading.
- **Chat panel opened after popup appears**: popup auto-dismisses via existing CSS animation (`popupAutoDismiss`); no extra teardown needed. Overlay will still return null on next render if `chatPanelOpen` flips true mid-flight, which dismisses early. This is desirable.
- **Multiple new messages while popup visible**: existing behavior — `useLatestChatMessage` re-keys to the latest non-dismissed message; the popup re-animates.

### Testing

- **Existing e2e tests** in `apps/web/e2e/sea-battle-chat-popup.spec.ts` continue to pass unchanged. Selector `[data-testid="chat-message-popup"]` is preserved; popup is still rendered.
- **New e2e test** in the same file: open the chat panel before triggering a message; assert popup is NOT visible.
- **Unit test** for `GameChatPopupOverlay`: assert it returns null when `chatPanelOpen` is true and renders a popup with resolved sender info when false.
- **Visual check (manual)**: confirm popup sits inside the widget at top-right in both normal and fullscreen modes.

## Out of scope

- No change to mobile chat behavior.
- No change to chat message bubble styling.
- No change to `useGameChatIntegration` API surface — existing games keep working unchanged.
- No change to the dismiss/auto-dismiss timing.
