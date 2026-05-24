# PWA Notifications — Design (ARC-740)

## 1. Motivation

The web app is a PWA but has no push notifications. Users who leave the tab don't find out when their daily reward is ready, a tournament is about to start, or a new announcement drops. We want push to bring users back, and an in-app inbox so a missed push isn't a lost notification.

This spec covers the **foundation** plus **wave 1: re-engagement triggers**. Later waves (gameplay alerts, chat, social) will reuse the foundation by calling the same dispatcher.

## 2. Scope

### In scope (this spec)

- Self-hosted web push using the `web-push` library on the backend with VAPID keys.
- New `notifications` NestJS module: REST controller, persistence service, in-process `NotificationDispatcher` callable from any other module.
- Three Mongo collections: `push_subscriptions`, `notifications`, `notification_preferences`.
- New service worker at `apps/web/public/sw.js` handling `push` and `notificationclick`.
- Per-category opt-in toggles in the settings page; **all categories default OFF** — nothing is sent until the user enables it.
- Notification bell in the header with unread badge and dropdown list of recent items.
- iOS Safari install hint surfaced when the user enables notifications on a not-yet-installed PWA.
- Wave-1 triggers wired into existing modules: daily reward ready, tournament starting soon, tournament registration opened, new public announcement.
- i18n for all user-facing copy across `en`, `ru`, `es`, `fr`, `by`.
- Unit tests (Vitest web, Jest BE) and one Playwright e2e smoke test for enabling notifications.

### Out of scope (deferred to later waves)

- Native mobile app push (Expo / FCM / APNs) — `apps/mobile` not touched.
- Gameplay alerts (your-turn, game invites, rematch).
- Chat / DM / friend-request notifications.
- Quiet hours / DND windows.
- Per-event granularity below category level.
- Vendor analytics integration.
- Notification grouping/coalescing beyond what the OS does natively.

## 3. Architecture overview

One BE module + one web feature + one service worker. The dispatcher is the single chokepoint: every other module calls `NotificationDispatcher.dispatch(userId, category, payload)` and the module handles preference check, inbox persistence, live-tab socket emit, and OS push.

```
apps/be/src/notifications/                          [NEW]
  notifications.module.ts
  notifications.controller.ts                       REST: prefs, inbox, subscribe, unsubscribe, vapid-public-key
  notifications.service.ts                          inbox + prefs CRUD
  notifications.dispatcher.ts                       public API used by other modules
  push-sender.ts                                    web-push wrapper, cleans 404/410 subscriptions
  notification-categories.ts                        enum + display metadata
  schemas/
    push-subscription.schema.ts
    notification.schema.ts
    notification-preference.schema.ts
  dtos/
    create-subscription.dto.ts
    update-preferences.dto.ts
    mark-read.dto.ts
  notifications.gateway.ts                          socket: emits 'notification:new' to user room
  notifications.service.spec.ts
  notifications.dispatcher.spec.ts
  push-sender.spec.ts

apps/web/public/sw.js                               [NEW] vanilla service worker
apps/web/src/features/notifications/                [NEW]
  NotificationBell.tsx                              header bell + dropdown
  NotificationBellPopover.tsx                       list of recent items
  NotificationSettingsSection.tsx                   per-category toggles (rendered in /settings)
  IOSInstallHint.tsx                                shown on iOS Safari when not installed
  useNotificationPermission.ts                      hook: browser perm + SW registration + subscribe
  useNotificationInbox.ts                           hook: fetch + subscribe to socket
  notifications.api.ts                              typed fetch helpers
  notifications.store.ts                            Zustand store (unreadCount, items, prefs, perm)
  notifications.types.ts
  index.ts

apps/web/src/shared/i18n/messages/notifications.ts  [NEW] i18n bundle (5 locales)
```

### Data flow — trigger

1. Domain module (e.g. `DailyRewardsService`) calls `dispatcher.dispatch({ userId, category, title, body, url, data })`.
2. Dispatcher looks up `NotificationPreference` for `userId` + `category`. If disabled, write nothing and return.
3. Dispatcher writes a `Notification` row to Mongo (the inbox entry).
4. Dispatcher emits `notification:new` socket event to the user's room → any live tab updates its badge and prepends the item.
5. Dispatcher loads all `PushSubscription` rows for the user and hands them to `push-sender.sendAll(...)`. Failures with HTTP 404/410 cause the offending subscription to be deleted (Web Push spec — "subscription has expired or been unsubscribed").

### Data flow — click

1. SW receives `push` event → `event.waitUntil(self.registration.showNotification(title, { body, icon, data: { url, notificationId } }))`.
2. User clicks → SW receives `notificationclick` → `clients.matchAll(...)` to focus an existing tab on `data.url`, else `clients.openWindow(data.url)`. POST to `/notifications/{id}/read` is fire-and-forget via `event.waitUntil(fetch(...))`.

## 4. Data model (Mongo)

### `push_subscriptions`

```ts
{
  _id: ObjectId,
  userId: ObjectId,                                 indexed
  endpoint: string,                                 unique
  keys: { p256dh: string, auth: string },
  userAgent: string,                                for debugging
  createdAt: Date,
  lastUsedAt: Date,
}
```

Compound index `{ userId: 1, endpoint: 1 }`. Cleanup runs when push-sender hits 404/410.

### `notifications`

```ts
{
  _id: ObjectId,
  userId: ObjectId,                                 indexed
  category: NotificationCategory,                   enum
  titleKey: string,                                 i18n key, NOT the rendered string
  bodyKey: string,
  i18nParams: Record<string, string | number>,      interpolated client-side
  url: string,                                      deep link
  data: Record<string, unknown>,                    free-form, e.g. tournamentId
  read: boolean,                                    default false
  createdAt: Date,                                  TTL index → 30 days
}
```

Storing i18n **keys** (not rendered strings) means a user can change their locale and the inbox re-renders correctly. Push payloads do get rendered server-side using the user's stored locale — the OS notification can't be retranslated after delivery.

Compound index `{ userId: 1, createdAt: -1 }`. TTL on `createdAt` (30 days) keeps the collection bounded.

### `notification_preferences`

```ts
{
  _id: ObjectId,
  userId: ObjectId,                                 unique
  categories: {
    daily_reward_ready: boolean,                    default false
    tournament_starting_soon: boolean,              default false
    tournament_registration_opened: boolean,        default false
    announcement_new: boolean,                      default false
  },
  updatedAt: Date,
}
```

`NotificationCategory` enum lives in `notification-categories.ts` so it can be extended for waves 2/3 without breaking the schema. A missing preference doc is treated as "all off."

## 5. Backend API surface

All routes under `/notifications` are behind `@UseGuards(JwtAuthGuard)` per CLAUDE.md, **except** `GET /notifications/vapid-public-key`, which is intentionally public — the SW needs it before the user is necessarily logged in.

| Method   | Path                              | Body / Query                                        | Returns                  | Notes                                   |
| -------- | --------------------------------- | --------------------------------------------------- | ------------------------ | --------------------------------------- |
| `GET`    | `/notifications/vapid-public-key` | —                                                   | `{ publicKey: string }`  | Auth optional — needed before subscribe |
| `POST`   | `/notifications/subscriptions`    | `CreateSubscriptionDto` (endpoint, keys, userAgent) | `204`                    | Upsert by endpoint                      |
| `DELETE` | `/notifications/subscriptions`    | `{ endpoint: string }`                              | `204`                    | Called when user revokes browser perm   |
| `GET`    | `/notifications/preferences`      | —                                                   | `NotificationPreference` | Returns defaults if no doc              |
| `PUT`    | `/notifications/preferences`      | `UpdatePreferencesDto` (partial categories map)     | `NotificationPreference` | Validated with `class-validator`        |
| `GET`    | `/notifications`                  | `?limit=20&before=ISO`                              | `NotificationDto[]`      | Cursor by `createdAt`                   |
| `GET`    | `/notifications/unread-count`     | —                                                   | `{ count: number }`      | Cheap, no body needed                   |
| `POST`   | `/notifications/read`             | `MarkReadDto` (`{ ids?: string[], all?: boolean }`) | `204`                    | Bulk                                    |

VAPID keys read via `ConfigService` from env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto). Documented in `apps/be/.env.example`.

### `NotificationDispatcher.dispatch(params)`

```ts
type DispatchParams = {
  userId: string;
  category: NotificationCategory;
  titleKey: string; // i18n key, e.g. 'notifications.daily_reward_ready.title'
  bodyKey: string;
  i18nParams?: Record<string, string | number>;
  url: string; // absolute path, e.g. '/daily-rewards'
  data?: Record<string, unknown>;
};
```

Returns `Promise<void>`, never throws — all errors logged via `LoggerService`. Internal-only; not exposed over HTTP.

### Socket gateway

`NotificationsGateway` joins authenticated sockets to a room named `user:{userId}` on connect, emits `notification:new` (payload = `NotificationDto`) and `notification:unread-count` (`{ count }`) when something changes. Reuses the existing socket auth pattern from `chat.gateway.ts`.

## 6. Frontend

### Service worker (`apps/web/public/sw.js`)

Hand-rolled, ~80 lines, **vanilla JS** (no bundler). Two handlers: `push` and `notificationclick`. Idempotent registration in `useNotificationPermission` — calls `navigator.serviceWorker.register('/sw.js', { scope: '/' })` only after the user opts in.

We deliberately **don't** adopt `next-pwa` / `serwist` for this work — they add a precaching/runtime-caching layer that's out of scope and a known source of stale-bundle bugs. The bare SW only does push.

### Settings UI

`NotificationSettingsSection.tsx` rendered inside the existing `/settings` page. Layout:

- Header row: master "Browser permission" status (granted / denied / default) + a primary CTA that triggers `Notification.requestPermission()` when default.
- One row per category with a `Switch` from `@arcadeum/ui` (must run `/check-ui-components` first).
- When a category is toggled on for the first time and permission is `default`, the permission prompt fires automatically.
- iOS Safari + not-installed → show `IOSInstallHint` instead of the perm CTA, with a link to the existing PWA install flow.

### Notification bell

`NotificationBell.tsx` lives in the header (already-being-reworked per [2026-05-20-app-header-rework-design](2026-05-20-app-header-rework-design.md) — the bell slots into the header at the agreed position). Shows an unread badge when `unreadCount > 0`. Click opens `NotificationBellPopover` which renders the last 20 items. Each item renders by interpolating its `titleKey`/`bodyKey` from the i18n bundle with `i18nParams`. Clicking an item navigates to `item.url` and marks it read.

### State

`notifications.store.ts` (Zustand, per CLAUDE.md) holds:

```ts
{
  permission: NotificationPermission;
  subscribed: boolean;
  unreadCount: number;
  items: NotificationDto[];
  prefs: NotificationPreferences;
  // actions
  initialize(): Promise<void>;        // called once on mount; fetches prefs + unread count
  enableCategory(c: NotificationCategory): Promise<void>;
  disableCategory(c: NotificationCategory): Promise<void>;
  markAllRead(): Promise<void>;
  markRead(id: string): Promise<void>;
  onSocketEvent(...): void;
}
```

The store subscribes to the existing `@/shared/lib/socket` infrastructure for `notification:new` / `notification:unread-count` events — no ad-hoc `socket.io-client` per CLAUDE.md.

## 7. Wave 1 trigger wiring

Each trigger requires (a) injecting `NotificationDispatcher` into the source module, (b) calling `dispatch` at the right point. The dispatcher's preference check means we don't need any opt-in logic at the call site.

### 7.1 Daily reward ready

`DailyRewardsService` does not currently emit anything when the streak window opens. We add a scheduled job using `@nestjs/schedule` (new dep). Hourly cron: find users whose last `claim` is between 23h and 24h ago (so we notify once per cycle, not every hour after eligibility opens) **and** whose preference for `daily_reward_ready` is enabled (preference check inlined into the query as an optimization to avoid scanning the whole user table). Dispatch:

```ts
dispatcher.dispatch({
  userId,
  category: 'daily_reward_ready',
  titleKey: 'notifications.daily_reward_ready.title',
  bodyKey: 'notifications.daily_reward_ready.body',
  url: '/daily-rewards',
});
```

### 7.2 Tournament starting soon

Scheduled job, every 5 minutes. Finds tournaments with `startsAt` between now+10min and now+15min and status `published`. For each, fan out to registered participants. `data: { tournamentId }`, `url: '/tournaments/{id}'`. We add a `notifiedStartingSoonAt` field to the tournament schema to prevent re-firing on the next tick.

### 7.3 Tournament registration opened

Event-driven: when `AdminTournamentsController.publish(...)` (or whatever the publish endpoint is — verified during implementation) flips a tournament from draft to published, dispatch to all users with `tournament_registration_opened` enabled. Single Mongo query: stream user IDs in batches of 500 to avoid loading everyone into memory.

### 7.4 New announcement

`AnnouncementsService.create(...)` (admin path) → after save, if `publishedAt <= now` and `audience === 'public'`, dispatch to all users with `announcement_new` enabled. Same batched stream as above.

For 7.3 and 7.4, the dispatcher's per-user persistence + per-user push fan-out is acceptable up to ~10k users — beyond that we'd want a queue (BullMQ) but that's deferred (YAGNI).

## 8. Error handling & edge cases

- **Push send failure with 404/410**: `push-sender` catches per-recipient errors. On 404/410, deletes the offending `push_subscription` row. Other failures (network, 5xx) are logged but the subscription is kept — we'll retry on the next dispatch.
- **VAPID keys missing**: app boots fine, `push-sender.sendAll` becomes a no-op with a warning. Inbox + socket still work. CI requires the env vars to be set in `.env.example` (no values).
- **User disables notifications mid-session**: `NotificationBell` still works for the inbox (inbox is independent of OS push). The dispatcher continues to write inbox rows; only `push-sender` is skipped when there are no subscriptions.
- **User revokes browser permission**: detected by `permission` watcher in the store. We DELETE the subscription server-side and flip the categories to `false` (so the user has to opt back in deliberately).
- **Multiple devices**: each device gets its own `push_subscription` row. All receive the push. OS-level dedupe is the user's problem (standard web push behavior).
- **iOS Safari not installed**: feature-detected via `'standalone' in navigator || matchMedia('(display-mode: standalone)').matches`. If not standalone, we don't even attempt to register the SW for push — we show `IOSInstallHint` instead. Avoids the silent-failure case where iOS rejects push.
- **TTL of 30 days on inbox**: makes the bell list bounded. Documented in the schema comment.
- **Anonymous / guest users**: not eligible. All endpoints behind `JwtAuthGuard`. The bell renders nothing for guests.
- **i18n fallback**: if the user's locale lacks a key, fall back to `en`. Push send-time rendering uses the user's stored `locale` field (already on the user model — verified during implementation).

## 9. i18n

New bundle file `apps/web/src/shared/i18n/messages/notifications.ts`. Keys:

```
notifications.bell.aria
notifications.bell.empty
notifications.bell.markAllRead
notifications.bell.title
notifications.settings.title
notifications.settings.description
notifications.settings.permission.granted
notifications.settings.permission.denied
notifications.settings.permission.enable
notifications.settings.iosInstallHint
notifications.categories.daily_reward_ready.label
notifications.categories.daily_reward_ready.description
notifications.categories.tournament_starting_soon.label
notifications.categories.tournament_starting_soon.description
notifications.categories.tournament_registration_opened.label
notifications.categories.tournament_registration_opened.description
notifications.categories.announcement_new.label
notifications.categories.announcement_new.description
notifications.daily_reward_ready.title
notifications.daily_reward_ready.body
notifications.tournament_starting_soon.title
notifications.tournament_starting_soon.body                       (params: name, minutes)
notifications.tournament_registration_opened.title
notifications.tournament_registration_opened.body                 (params: name)
notifications.announcement_new.title                              (params: title)
notifications.announcement_new.body                               (params: excerpt)
```

All five locales: `en`, `ru`, `es`, `fr`, `by`. The existing `completeness.test.ts` will enforce parity.

The BE-side render (for push payloads) reads the same bundle. We copy the bundle to a BE-readable location or expose a tiny render helper — implementation chooses, but the **source of truth is the web messages file** to avoid drift.

## 10. Testing

### Unit

- `notifications.dispatcher.spec.ts`: pref-disabled short-circuits; pref-enabled writes inbox + emits socket + calls push-sender; errors in push-sender don't fail the dispatch.
- `push-sender.spec.ts`: 404/410 deletes the subscription; other errors keep it; VAPID-missing is a logged no-op.
- `notifications.service.spec.ts`: inbox cursor pagination; mark-read sets flag; unread count excludes read.
- `notifications.controller.spec.ts`: DTOs validated, guards present, auth required.
- Web: `notifications.store.test.ts` (state transitions), `NotificationBell.test.tsx` (badge visibility), `useNotificationPermission.test.ts` (denied / granted / default branches).

### Integration

- `notifications.integration-spec.ts` (BE): subscribe → dispatch → assert inbox row + (mocked) push call.
- Reuse the announcements test pattern.

### E2E

- One Playwright smoke test: log in, open settings, enable "daily reward ready," see the permission prompt accept, see the subscription POST, observe the bell appear empty. We mock the actual push delivery — Playwright cannot test the OS notification layer.

### Manual verification (per CLAUDE.md)

Run dev server, walk through: enable category in settings → trigger a test dispatch via an admin endpoint → see OS notification → click → land on deep link. iOS Safari path tested manually on a real device.

## 11. Rollout / future waves

- Ship behind no feature flag — opt-in default-off already gates exposure.
- Wave 2 (gameplay): adds categories `your_turn`, `game_invite`, `rematch_offered`. Triggers from `games.gateway.ts` and friends. No schema migration — just enum extensions and new prefs default to false.
- Wave 3 (chat/social): adds `chat_message`, `friend_request`. Trigger from `chat.gateway.ts`. May need coalescing (collapse 5 messages into "5 new messages") — out of scope for v1.
- If push opt-in rates are healthy (>10%), consider quiet hours + per-event granularity as wave 4.

## 12. Open questions resolved during brainstorming

1. **Platforms**: web only (desktop, Android Chrome, iOS Safari PWA). No native mobile app touched.
2. **First wave**: re-engagement (all four triggers listed).
3. **Preferences**: per-category toggles.
4. **Default state**: all categories OFF — opt-in only.
5. **Inbox vs push only**: both (push + in-app bell with unread badge).
6. **Approach**: self-hosted `web-push` + Mongo (Approach A).
