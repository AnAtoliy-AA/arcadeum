# PWA Notifications Implementation Plan (ARC-740)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add self-hosted web push notifications (foundation + wave-1 re-engagement triggers) with per-category opt-in (default off), an in-app inbox bell, and i18n in five locales.

**Architecture:** New `notifications` NestJS module exposes a single `NotificationDispatcher` that domain modules call. Dispatcher persists an inbox row, emits a socket event to live tabs, and fans out web-push to all stored subscriptions. A vanilla service worker handles `push` + `notificationclick`. A Zustand store backs the bell and settings UI. Wave-1 triggers wire daily-rewards, tournaments, and announcements into the dispatcher.

**Tech Stack:** NestJS 11, `web-push` (BE), `@nestjs/schedule` (cron), Mongoose, Next.js 15 App Router, vanilla service worker, Zustand, Vitest (web), Jest (BE), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-24-pwa-notifications-design.md](../specs/2026-05-24-pwa-notifications-design.md)

---

## Conventions

- Branch: `ARC-740` (already created off `develop`).
- Commit prefix: `feat(notifications): …` or `feat(<scope>): …` per Conventional Commits. Footer: `(ARC-740)`.
- TDD: write the failing test first, watch it fail, write the minimum to make it pass.
- After every Task: run `pnpm lint` + the relevant test command, then commit.
- Files must stay under 500 lines (CLAUDE.md). Split before they grow.
- No `any`. All DTOs validated with `class-validator`. JWT-guarded routes by default.
- i18n: add keys to **all five** locale exports (`en`, `ru`, `es`, `fr`, `by`) in the same file. The `completeness.test.ts` will fail otherwise.

---

## Task 0: Setup — dependencies, env, branch hygiene

**Files:**

- Modify: `apps/be/package.json`
- Modify: `apps/be/.env.example` (or create if missing)
- Modify: `apps/web/.env.example` (or create if missing)
- Create: `apps/be/scripts/generate-vapid-keys.ts`

**Steps:**

- [ ] **Step 1: Pull develop, rebase ARC-740 if needed**

```bash
git fetch origin develop
git rebase origin/develop
```

Expected: "Current branch ARC-740 is up to date" or a clean rebase. If conflicts, stop and ask.

- [ ] **Step 2: Install BE deps from repo root**

```bash
pnpm --filter @arcadeum/be add web-push @nestjs/schedule
pnpm --filter @arcadeum/be add -D @types/web-push
```

Expected: deps appear in `apps/be/package.json`. No errors.

- [ ] **Step 3: Add VAPID key-gen helper script**

Create `apps/be/scripts/generate-vapid-keys.ts`:

```ts
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:support@arcadeum.com');
```

- [ ] **Step 4: Add env var docs**

Append to `apps/be/.env.example` (create the file if it doesn't exist by copying any `apps/be/.env.local.example` first, otherwise create fresh):

```
# Web Push (ARC-740). Generate with: pnpm --filter @arcadeum/be exec tsx scripts/generate-vapid-keys.ts
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:support@arcadeum.com
```

Append to `apps/web/.env.example` (same caveat):

```
# Public VAPID key for push subscription (ARC-740). Must match BE VAPID_PUBLIC_KEY.
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

- [ ] **Step 5: Commit**

```bash
git add apps/be/package.json apps/be/scripts/generate-vapid-keys.ts apps/be/.env.example apps/web/.env.example pnpm-lock.yaml
git commit -m "chore(notifications): add web-push, schedule, VAPID env scaffolding (ARC-740)"
```

---

## Task 1: BE — `NotificationCategory` enum + types

**Files:**

- Create: `apps/be/src/notifications/notification-categories.ts`
- Create: `apps/be/src/notifications/notification-categories.spec.ts`

**Steps:**

- [ ] **Step 1: Write failing test**

```ts
// notification-categories.spec.ts
import {
  NOTIFICATION_CATEGORIES,
  isNotificationCategory,
} from './notification-categories';

describe('NotificationCategory', () => {
  it('contains the four wave-1 categories', () => {
    expect(NOTIFICATION_CATEGORIES).toEqual([
      'daily_reward_ready',
      'tournament_starting_soon',
      'tournament_registration_opened',
      'announcement_new',
    ]);
  });

  it('isNotificationCategory accepts known values', () => {
    expect(isNotificationCategory('daily_reward_ready')).toBe(true);
  });

  it('isNotificationCategory rejects unknown values', () => {
    expect(isNotificationCategory('made_up')).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @arcadeum/be test -- notification-categories.spec.ts`

- [ ] **Step 3: Implement**

```ts
// notification-categories.ts
export const NOTIFICATION_CATEGORIES = [
  'daily_reward_ready',
  'tournament_starting_soon',
  'tournament_registration_opened',
  'announcement_new',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export function isNotificationCategory(
  value: unknown,
): value is NotificationCategory {
  return (
    typeof value === 'string' &&
    (NOTIFICATION_CATEGORIES as readonly string[]).includes(value)
  );
}
```

- [ ] **Step 4: Run, expect PASS**.

- [ ] **Step 5: Commit** — `feat(notifications): add notification category enum (ARC-740)`

---

## Task 2: BE — Mongoose schemas

**Files:**

- Create: `apps/be/src/notifications/schemas/push-subscription.schema.ts`
- Create: `apps/be/src/notifications/schemas/notification.schema.ts`
- Create: `apps/be/src/notifications/schemas/notification-preference.schema.ts`

**Steps:**

- [ ] **Step 1: Write `push-subscription.schema.ts`** — class-based, `@Schema({ timestamps: true })`, fields: `userId: Types.ObjectId` (indexed), `endpoint: string` (unique), `keys: { p256dh: string; auth: string }`, `userAgent?: string`, `lastUsedAt: Date` (default now). Export schema and `PushSubscriptionDocument` type. Add `PushSubscriptionSchema.index({ userId: 1, endpoint: 1 })`.

- [ ] **Step 2: Write `notification.schema.ts`** — fields: `userId: Types.ObjectId` (indexed), `category: string` (validated against `NOTIFICATION_CATEGORIES` via enum), `titleKey: string`, `bodyKey: string`, `i18nParams: Record<string, unknown>` (default `{}`), `url: string`, `data: Record<string, unknown>` (default `{}`), `read: boolean` (default false), `createdAt: Date` (timestamps). Add `NotificationSchema.index({ userId: 1, createdAt: -1 })` and `NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })`.

- [ ] **Step 3: Write `notification-preference.schema.ts`** — fields: `userId: Types.ObjectId` (unique), `categories: Record<NotificationCategory, boolean>` (default: all false). Use a nested subdoc class so each category is explicit and validated.

- [ ] **Step 4: Lint** — `pnpm --filter @arcadeum/be lint`

- [ ] **Step 5: Commit** — `feat(notifications): add Mongoose schemas (ARC-740)`

---

## Task 3: BE — `push-sender.ts` (web-push wrapper)

**Files:**

- Create: `apps/be/src/notifications/push-sender.ts`
- Create: `apps/be/src/notifications/push-sender.spec.ts`

**Behavior:**

- Injectable service. Constructor loads VAPID keys via `ConfigService`. If any are missing, logs once and stays in "no-op" mode.
- `sendOne(subscription, payload)`: calls `webpush.sendNotification(...)`. On 404 or 410, throws `SubscriptionGoneError` (custom). Other errors logged and rethrown.
- `sendAll(subscriptions, payload, onGone)`: iterates, swallows individual errors, calls `onGone(endpoint)` for each 404/410. Returns count of successful sends.

**Steps:**

- [ ] **Step 1: Write failing tests** covering: VAPID-missing → no-op + warning; successful send returns 1; 404 calls onGone; 410 calls onGone; 500 logs but does not call onGone.

Mock `web-push` with `vi.mock` style (Jest in BE). Stub `ConfigService.get`.

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement** `push-sender.ts`. Use the official `web-push` lib. Payload is `JSON.stringify({ title, body, url, notificationId, icon: '/icon-192x192.png' })`. Truncate body to 3 KB if needed (web push spec 4 KB cap, leave headroom).

- [ ] **Step 4: Run, expect PASS.**

- [ ] **Step 5: Commit** — `feat(notifications): add push-sender with subscription cleanup (ARC-740)`

---

## Task 4: BE — `notifications.service.ts` (inbox + prefs)

**Files:**

- Create: `apps/be/src/notifications/notifications.service.ts`
- Create: `apps/be/src/notifications/notifications.service.spec.ts`

**Behavior (public methods):**

- `getPreferences(userId)` → returns the doc or defaults-all-false.
- `updatePreferences(userId, partial)` → upsert, returns updated doc.
- `addSubscription(userId, dto)` → upsert by endpoint, set `userId` + `lastUsedAt`.
- `removeSubscription(userId, endpoint)` → delete (only if owned).
- `listInbox(userId, { limit, before })` → cursor by `createdAt` desc.
- `unreadCount(userId)` → `count({ userId, read: false })`.
- `markRead(userId, { ids?, all? })` → bulk update.
- `createInboxRow(params)` → insert new `Notification` row, return id.
- `getSubscriptions(userId)` → all subs for user.
- `deleteSubscriptionByEndpoint(endpoint)` → unconditional, for the push-sender cleanup callback.

**Steps:**

- [ ] **Step 1: Write failing tests** for each method using `@nestjs/testing` + `mongoose-memory-server` (check if already a project dep; otherwise stub the models). Cover: defaults-on-missing-pref, upsert preserves untouched categories, cursor pagination correctness, mark-all-read filters by userId only.

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement.** Follow the announcements.service.ts pattern for `InjectModel` and `Model<X>` usage.

- [ ] **Step 4: Run, expect PASS.**

- [ ] **Step 5: Commit** — `feat(notifications): add inbox + preferences service (ARC-740)`

---

## Task 5: BE — `notifications.gateway.ts` (socket)

**Files:**

- Create: `apps/be/src/notifications/notifications.gateway.ts`
- Create: `apps/be/src/notifications/notifications.gateway.spec.ts`

**Behavior:**

- `@WebSocketGateway` with same CORS pattern as `chat.gateway.ts`.
- On connect: authenticate via JWT in handshake auth (same helper used elsewhere — check `chat.gateway.ts` for the pattern). Join the socket to room `user:{userId}`.
- Expose `emitNew(userId, payload)` and `emitUnreadCount(userId, count)` for use by the dispatcher.

**Steps:**

- [ ] **Step 1: Write failing tests** for room joining and the two emit methods (mock `Server`).
- [ ] **Step 2: Run, FAIL.**
- [ ] **Step 3: Implement.** Reuse auth logic from `chat.gateway.ts`. Add `socket-encryption` if that's the standing pattern; check 2 other gateways and follow the majority pattern.
- [ ] **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): add socket gateway for live inbox updates (ARC-740)`

---

## Task 6: BE — `NotificationDispatcher`

**Files:**

- Create: `apps/be/src/notifications/notifications.dispatcher.ts`
- Create: `apps/be/src/notifications/notifications.dispatcher.spec.ts`

**Behavior:**

- Constructor injects `NotificationsService`, `NotificationsGateway`, `PushSender`, `Logger`.
- Public `dispatch(params: DispatchParams)`:
  1. Look up pref; if category disabled → return.
  2. Insert inbox row via service; capture id.
  3. Call `gateway.emitNew(userId, row)` and `emitUnreadCount(userId, newCount)`.
  4. Load subscriptions; call `pushSender.sendAll(subs, { title, body, url, notificationId }, endpoint => service.deleteSubscriptionByEndpoint(endpoint))`.
  5. Never throws. All errors logged at `warn`.
- For push payload: render `titleKey`/`bodyKey` to strings using a small BE-side i18n helper (created in Task 7) using the user's stored locale (fetched once via injected `UserModel`; falls back to `en`).

**Steps:**

- [ ] **Step 1: Write failing tests** for: pref-disabled short-circuits (no service.createInboxRow call), pref-enabled writes + emits + pushes, push failure doesn't throw, missing-locale falls back to en.
- [ ] **Step 2: Run, FAIL.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): add dispatcher orchestrating inbox + socket + push (ARC-740)`

---

## Task 7: BE — i18n helper for push render

**Files:**

- Create: `apps/be/src/notifications/i18n/notifications-messages.ts`
- Create: `apps/be/src/notifications/i18n/render.ts`
- Create: `apps/be/src/notifications/i18n/render.spec.ts`

**Decision:** copy the bundle into the BE source tree. The web messages bundle uses TS module exports — we duplicate just the `notifications.*` keys so BE has no cross-app import. The duplication is acceptable for v1 because the keys are namespaced (`notifications.*`) and only added in one PR. **Add a comment at the top of both files pointing to the other as the source of truth.**

**Steps:**

- [ ] **Step 1: Write failing test** for `renderNotification('notifications.tournament_starting_soon.body', { name: 'Cup', minutes: 10 }, 'en')` returns the interpolated English string; `'ru'` returns Russian; unknown locale falls back to `en`.
- [ ] **Step 2: Run, FAIL.**
- [ ] **Step 3: Implement** `notifications-messages.ts` (the five-locale bundle) and `render.ts` (key lookup with dotted-path resolution + simple `{{var}}` interpolation). NO new lib — handwritten ~30 lines.
- [ ] **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): add BE-side i18n render helper (ARC-740)`

---

## Task 8: BE — DTOs + controller

**Files:**

- Create: `apps/be/src/notifications/dtos/create-subscription.dto.ts`
- Create: `apps/be/src/notifications/dtos/update-preferences.dto.ts`
- Create: `apps/be/src/notifications/dtos/mark-read.dto.ts`
- Create: `apps/be/src/notifications/dtos/list-inbox.dto.ts`
- Create: `apps/be/src/notifications/notifications.controller.ts`
- Create: `apps/be/src/notifications/notifications.controller.spec.ts`

**DTOs** — `class-validator` decorators on every field. `CreateSubscriptionDto` validates endpoint (URL), keys (object with `p256dh` and `auth` strings), userAgent (optional string). `UpdatePreferencesDto` accepts a partial categories object — validate each key is in `NOTIFICATION_CATEGORIES`. `MarkReadDto` allows either `ids: string[]` or `all: true`.

**Controller endpoints** — exactly as in spec §5. All behind `@UseGuards(JwtAuthGuard)` except `GET /vapid-public-key` (public, returns `process.env.VAPID_PUBLIC_KEY` via `ConfigService`).

**Steps:**

- [ ] **Step 1: Write failing tests** — controller spec covers happy paths for every endpoint plus 401 without auth (use the `JwtAuthGuard` override pattern from `announcements` controller spec).
- [ ] **Step 2: Run, FAIL.**
- [ ] **Step 3: Implement DTOs + controller.**
- [ ] **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): add REST controller for prefs, inbox, subscriptions (ARC-740)`

---

## Task 9: BE — `notifications.module.ts` + wire into `AppModule`

**Files:**

- Create: `apps/be/src/notifications/notifications.module.ts`
- Modify: `apps/be/src/app.module.ts` (add to imports)
- Modify: `apps/be/src/app.module.ts` (add `ScheduleModule.forRoot()` for crons)

**Steps:**

- [ ] **Step 1: Write `notifications.module.ts`** — imports `AuthModule` (for guard) + `MongooseModule.forFeature(...)` for the three schemas + `User` schema for locale lookup. Providers: service, gateway, dispatcher, push-sender. Exports: `NotificationDispatcher` so other modules can inject it.
- [ ] **Step 2: Modify `app.module.ts`** — add `ScheduleModule.forRoot()` and `NotificationsModule` to imports array. Verify the dot-comma-style import grouping matches the existing file.
- [ ] **Step 3: Smoke** — `pnpm --filter @arcadeum/be start` boots without errors. Stop with Ctrl+C.
- [ ] **Step 4: Commit** — `feat(notifications): wire module + enable scheduler (ARC-740)`

---

## Task 10: Frontend — i18n bundle

**Files:**

- Create: `apps/web/src/shared/i18n/messages/notifications.ts`
- Modify: `apps/web/src/shared/i18n/messages/index.ts` (register new bundle for all locales)
- Modify: `apps/web/src/shared/i18n/messages/__snapshots__/*` if completeness test snapshots exist

**Steps:**

- [ ] **Step 1: Write `notifications.ts`** — export `en, ru, es, fr, by` constants with the full key list from spec §9. Mirror the file shape of `pwa.ts`.
- [ ] **Step 2: Register in `index.ts`** — import each locale's bundle, add to the translations object under `notifications:` for every locale. Use the existing dynamic import pattern for non-default locales.
- [ ] **Step 3: Run completeness test** — `pnpm --filter @arcadeum/web test -- completeness`. Expect PASS.
- [ ] **Step 4: Commit** — `feat(notifications): add i18n bundle in en/ru/es/fr/by (ARC-740)`

---

## Task 11: Frontend — service worker

**Files:**

- Create: `apps/web/public/sw.js`

**Behavior:**

```js
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { title, body, url, notificationId, icon } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: { url: url || '/', notificationId },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const c of all) {
        if (c.url.endsWith(url) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })(),
  );
});
```

**Steps:**

- [ ] **Step 1: Create `apps/web/public/sw.js`** with the code above.
- [ ] **Step 2: Manual smoke** — `pnpm --filter @arcadeum/web dev`, visit the app, open DevTools → Application → Service Workers, verify the URL `http://localhost:3000/sw.js` returns 200 with `Content-Type: application/javascript`.
- [ ] **Step 3: Commit** — `feat(notifications): add service worker for push events (ARC-740)`

---

## Task 12: Frontend — API client + types

**Files:**

- Create: `apps/web/src/features/notifications/notifications.types.ts`
- Create: `apps/web/src/features/notifications/notifications.api.ts`
- Create: `apps/web/src/features/notifications/notifications.api.test.ts`

**Steps:**

- [ ] **Step 1: Write `notifications.types.ts`** — `NotificationCategory` (mirror BE constant; do NOT cross-import), `NotificationDto`, `NotificationPreferences`, `CreateSubscriptionPayload`.
- [ ] **Step 2: Write failing test** for `notifications.api.ts` — mock `fetch`, assert GET/POST/PUT/DELETE paths and that the request body is JSON-encoded.
- [ ] **Step 3: Implement `notifications.api.ts`** — thin typed helpers around `fetch`. Use the existing `apps/web/src/shared/api/...` patterns (check `apps/web/src/features/daily-rewards/...` for a model).
- [ ] **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): add typed API client (ARC-740)`

---

## Task 13: Frontend — Zustand store

**Files:**

- Create: `apps/web/src/features/notifications/notifications.store.ts`
- Create: `apps/web/src/features/notifications/notifications.store.test.ts`

**Behavior:** shape per spec §6 (`permission`, `subscribed`, `unreadCount`, `items`, `prefs`, plus actions). `initialize()` fetches prefs + unread count + listens for socket events. `enableCategory` / `disableCategory` PUTs prefs and (on first enable) requests browser permission + registers SW + subscribes + POSTs subscription.

**Steps:**

- [ ] **Step 1: Write failing tests** for: initial state, `markRead` decrements unreadCount, `onSocketEvent('notification:new', dto)` prepends + increments, `enableCategory` triggers permission flow when permission is `default`.
- [ ] **Step 2: Run, FAIL.**
- [ ] **Step 3: Implement.** Keep the SW registration + subscription logic in a small internal helper inside the store file (fewer abstractions than a separate `useNotificationPermission.ts`). Convert VAPID public key from base64 to Uint8Array per the standard recipe.
- [ ] **Step 4: Run, PASS.**
- [ ] **Step 5: Commit** — `feat(notifications): add Zustand store with permission + subscription flow (ARC-740)`

---

## Task 14: Frontend — `NotificationBell` + `NotificationBellPopover`

**Files:**

- Run `/check-ui-components` first to identify Bell / Badge / Popover primitives in `@arcadeum/ui` that we should reuse.
- Create: `apps/web/src/features/notifications/NotificationBell.tsx`
- Create: `apps/web/src/features/notifications/NotificationBellPopover.tsx`
- Create: `apps/web/src/features/notifications/NotificationBell.test.tsx`
- Modify: header component (path TBD by step 1 of this task) to render the bell.

**Steps:**

- [ ] **Step 1: Run `/check-ui-components`.** Document which existing UI primitives (Badge, Popover, IconButton, etc.) the bell will reuse. If a primitive is missing and ergonomic to add, add it to `packages/ui` per `/new-ui-component`. Otherwise compose locally with Tamagui.
- [ ] **Step 2: Write failing test** — render `<NotificationBell />` with `unreadCount=0` → no badge; with `unreadCount=3` → badge shows `3`; click → popover opens with items.
- [ ] **Step 3: Implement.** Subscribe to store with shallow selectors. Empty state uses the i18n key `notifications.bell.empty`.
- [ ] **Step 4: Wire into header.** Find the header component (search `apps/web/src/widgets` for "Header" or whatever the app-header-rework PR produced). Render `<NotificationBell />` in the user-menu area; gate on authenticated user.
- [ ] **Step 5: Run, PASS** + manual smoke in dev.
- [ ] **Step 6: Commit** — `feat(notifications): add header notification bell (ARC-740)`

---

## Task 15: Frontend — `NotificationSettingsSection` + `IOSInstallHint`

**Files:**

- Create: `apps/web/src/features/notifications/NotificationSettingsSection.tsx`
- Create: `apps/web/src/features/notifications/IOSInstallHint.tsx`
- Create: `apps/web/src/features/notifications/NotificationSettingsSection.test.tsx`
- Modify: `apps/web/src/app/[locale]/settings/SettingsContent.tsx` (render the new section)

**Steps:**

- [ ] **Step 1: Write failing test** — section renders one ToggleRow per category, flipping a toggle calls `enableCategory`/`disableCategory`. iOS + not-installed: renders `IOSInstallHint` instead of the permission CTA.
- [ ] **Step 2: Implement.** Reuse existing `ToggleRow` + `ToggleInput` from `apps/web/src/app/[locale]/settings/styles.ts`. Detection helper for iOS standalone: `typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches`.
- [ ] **Step 3: Render** the new `Section` inside `SettingsContent.tsx` between existing sections (place after the Sound/Haptics section).
- [ ] **Step 4: Run, PASS** + manual smoke in dev (toggle persists across reload).
- [ ] **Step 5: Commit** — `feat(notifications): add per-category settings UI + iOS install hint (ARC-740)`

---

## Task 16: Trigger — daily reward ready (cron)

**Files:**

- Modify: `apps/be/src/daily-rewards/daily-rewards.module.ts` (import NotificationsModule)
- Create: `apps/be/src/daily-rewards/daily-rewards.notification.cron.ts`
- Create: `apps/be/src/daily-rewards/daily-rewards.notification.cron.spec.ts`

**Behavior:** `@Cron('0 * * * *')` (hourly). Query: users whose last claim was between 23h and 24h ago and who have `preferences.categories.daily_reward_ready === true`. Aggregate-join `daily_rewards` ↔ `notification_preferences` by `userId` (two queries: first pull eligible userIds from the preferences collection, then filter daily-rewards by those userIds; keeps each query cheap and indexable).

**Steps:**

- [ ] **Step 1: Write failing tests** for the cron service — opted-in eligible user dispatches once; opted-out user gets no dispatch; user already notified within the last 24h does not get re-dispatched.
- [ ] **Step 2: Implement** — inject `NotificationDispatcher`. Cron calls `dispatcher.dispatch({ userId, category: 'daily_reward_ready', titleKey: 'notifications.daily_reward_ready.title', bodyKey: 'notifications.daily_reward_ready.body', url: '/daily-rewards' })`.
- [ ] **Step 3: Add to `daily-rewards.module.ts` providers + imports.**
- [ ] **Step 4: Run tests, PASS.**
- [ ] **Step 5: Commit** — `feat(daily-rewards): notify users when streak window opens (ARC-740)`

---

## Task 17: Trigger — tournament starting soon (cron) + registration opened (event)

**Files:**

- Modify: `apps/be/src/tournaments/tournaments.module.ts`
- Modify: `apps/be/src/tournaments/tournaments.service.ts`
- Modify: `apps/be/src/tournaments/schemas/tournament.schema.ts` (add `notifiedStartingSoonAt?: Date`)
- Create: `apps/be/src/tournaments/tournaments.notification.cron.ts`
- Create: `apps/be/src/tournaments/tournaments.notification.cron.spec.ts`
- Extend: existing `tournaments.service.spec.ts` with publish-notify test.

**Behavior — starting soon:** `@Cron('*/5 * * * *')`. Find tournaments with `status: 'published'`, `startsAt` in `[now+10min, now+15min]`, `notifiedStartingSoonAt` is null. Dispatch to each participant filtered by preference. Set `notifiedStartingSoonAt = now`.

**Behavior — registration opened:** in the existing `publish` (or equivalent) tournament service method, after the doc transitions to `published`, stream all users with `tournament_registration_opened` enabled in batches of 500 → dispatch.

**Steps:**

- [ ] **Step 1: Locate the tournament publish method.** Grep `apps/be/src/tournaments/` for the place where status flips to `published`. Note: if no explicit method, use the update path that controls status.
- [ ] **Step 2: Add `notifiedStartingSoonAt` schema field** (Date, optional, default null).
- [ ] **Step 3: Write failing tests** for both flows.
- [ ] **Step 4: Implement** the cron + the publish hook. Both call the dispatcher.
- [ ] **Step 5: Run tests, PASS.**
- [ ] **Step 6: Commit** — `feat(tournaments): notify on starting soon + registration opened (ARC-740)`

---

## Task 18: Trigger — new announcement (event)

**Files:**

- Modify: `apps/be/src/announcements/announcements.module.ts` (import NotificationsModule)
- Modify: `apps/be/src/announcements/announcements.service.ts` (post-create hook)
- Extend: `apps/be/src/announcements/announcements.service.admin.spec.ts` with notify test.

**Behavior:** in `AnnouncementsService.create(...)`, after the doc is saved, if `audience === 'public'` and (`publishedAt` is null OR `publishedAt <= now`), stream all users with `announcement_new` enabled and dispatch. `data: { announcementId }`, `url: '/announcements/{id}'` (verify the public path during implementation).

**Steps:**

- [ ] **Step 1: Verify the public announcement URL.** Grep `apps/web/src/app/[locale]` for the route.
- [ ] **Step 2: Write failing test** in the existing admin service spec: creating a public announcement triggers dispatch for opted-in users only.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run tests, PASS.**
- [ ] **Step 5: Commit** — `feat(announcements): notify subscribers of new public announcement (ARC-740)`

---

## Task 19: Integration tests

**Files:**

- Create: `apps/be/src/notifications/notifications.integration-spec.ts`

**Steps:**

- [ ] **Step 1: Write integration test** — boot a Nest test module with real Mongoose (in-memory or the existing pattern from `tournaments.service.integration-spec.ts`), seed a user + a subscription + prefs ON for `daily_reward_ready`. Call `dispatcher.dispatch(...)`. Assert: inbox row exists, push-sender was called (mock at the web-push lib layer), socket gateway `emitNew` was called.
- [ ] **Step 2: Run, PASS.**
- [ ] **Step 3: Commit** — `test(notifications): integration spec for dispatch end-to-end (ARC-740)`

---

## Task 20: E2E Playwright smoke test

**Files:**

- Create: `apps/web/e2e/notifications.spec.ts` (or wherever the project keeps e2e — verify path before creating)

**Steps:**

- [ ] **Step 1: Verify the e2e directory.** `find apps/web -name "*.spec.ts" -path "*e2e*"` or `find apps/web -name "playwright*"`.
- [ ] **Step 2: Write the test** — log in (reuse existing helper), navigate to settings, find the notifications section, click the toggle for `daily_reward_ready`. Stub `Notification.requestPermission` to return `'granted'`. Stub `serviceWorker.register` + the push subscribe API at the page level. Assert POST `/notifications/subscriptions` was made.
- [ ] **Step 3: Run, PASS.**
- [ ] **Step 4: Commit** — `test(notifications): playwright e2e for opt-in flow (ARC-740)`

---

## Task 21: Verification — full local pass

**Steps:**

- [ ] **Step 1: Lint everything** — `pnpm lint`.
- [ ] **Step 2: Run all tests** — `pnpm test`.
- [ ] **Step 3: Build** — `pnpm build`. Must succeed for both BE and web.
- [ ] **Step 4: Check file lengths** — `pnpm check-file-length`. Must succeed.
- [ ] **Step 5: Manual smoke (per CLAUDE.md):**
  - Start BE + web dev servers.
  - Generate VAPID keypair, fill `.env.local` for both apps.
  - In a desktop Chrome window: log in, go to settings, enable a category, observe the permission prompt accept, see the subscription POST in network tab.
  - Trigger a manual dispatch — easiest path: open a Nest REPL or temporarily add a `POST /notifications/_debug-dispatch` route guarded behind `NODE_ENV !== 'production'` (remove before commit) OR just create a public announcement via the admin API.
  - Observe OS notification appears. Click → land on deep link. Inbox bell shows badge.
  - Toggle off, repeat — confirm nothing fires.
- [ ] **Step 6: If a debug route was added, delete it before commit.**

---

## Task 22: Open PR

**Steps:**

- [ ] **Step 1: Push branch** — `git push -u origin ARC-740`.
- [ ] **Step 2: Generate PR description** via the `/pr-description` skill or by following the project's What/Why/Changes format.
- [ ] **Step 3: Open PR** — `gh pr create --base main --title "feat(notifications): PWA push notifications + in-app inbox (ARC-740)" --body "$(cat <<'EOF'`…`EOF\n)"`. Body must list: features shipped, env vars required, screenshots if available, manual verification checklist completed.
- [ ] **Step 4: Comment on PR** with the URL printed by `gh pr create`.

---

## Stop conditions

Stop and ask the user if:

- Step 0.1 rebase produces conflicts.
- Any existing test that wasn't touched by this plan starts failing.
- A trigger module's schema needs structural changes beyond a single new field.
- `pnpm check-file-length` fails — split the offending file before continuing.
- A required env var has no sensible default and you can't verify the implementation without it.

---

## What this plan deliberately does NOT do

- No native mobile push (Expo). `apps/mobile` untouched.
- No quiet hours / DND. Default opt-out is the only privacy control in v1.
- No per-event toggles, only per-category.
- No vendor (OneSignal, FCM, Pusher).
- No BullMQ. Fan-out to all users is a streamed Mongo cursor. Acceptable up to ~10k users; we'll revisit when it stops being.
- No precaching/runtime-caching service worker. The SW only handles `push` + `notificationclick`.
