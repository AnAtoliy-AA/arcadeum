# In-Game Share Menu (ARC-732)

## Problem

The in-game control panel's share button (currently in
[GamesControlPanel.tsx:297-317](../../apps/web/src/widgets/GamesControlPanel/ui/GamesControlPanel.tsx#L297-L317))
only copies the invite URL to the clipboard. Players want first-class one-click
sharing through the channels they actually use — Telegram, WhatsApp, Facebook,
X/Twitter, Instagram — without having to paste manually.

## Goal

Replace the single copy-link button with a share menu that:

- On **mobile** (where `navigator.share` is available) opens the OS-native
  share sheet directly. The OS sheet already surfaces every installed app the
  user has, including Instagram, Messages, Mail, Snapchat, etc.
- On **desktop** opens a small popover anchored to the trigger with explicit
  brand buttons:
  1. Telegram
  2. WhatsApp
  3. X / Twitter
  4. Facebook
  5. Copy link
     (Instagram is omitted on desktop — it has no public web URL that accepts an
     arbitrary share link.)

## Non-goals

- No server-side changes. The shared URL is the same one already produced.
- No new dependency. We use the existing custom-popover-with-outside-click
  pattern used elsewhere in this codebase
  (e.g. [MobileHandPopover.tsx](../../apps/web/src/widgets/CriticalGame/ui/MobileHandPopover.tsx)).
- No analytics tracking in this iteration.
- No referral-link integration — the referrals feature has its own card and is
  unrelated.

## UX

### Trigger

- Same button location and visual treatment as today (`🔗` glass-variant
  button in `GamesControlPanel`).
- Tooltip becomes "Share game".
- `aria-haspopup="menu"`, `aria-expanded` reflects popover state.

### Mobile path

- On click, if `typeof navigator !== 'undefined' && typeof navigator.share === 'function'`,
  call:
  ```ts
  navigator.share({ title, text, url }).catch(() => {
    /* user cancelled */
  });
  ```
- Do not open the popover in that case.

### Desktop popover

- Anchored under the trigger; closes on outside-click and `Escape`.
- 5 menu items, each: brand SVG icon (`width=18 height=18`) + label.
- Channel actions open `window.open(href, '_blank', 'noopener,noreferrer')`
  except Copy link which writes to `navigator.clipboard` and shows a
  "Copied!" indicator (reuses the existing `useTimedTrue` hook for the
  2-second confirmation).
- Focus returns to the trigger on close.

### Channel URLs

Given `url` = invite URL and `text` = localized share message:

| Channel  | URL template                                        |
| -------- | --------------------------------------------------- |
| Telegram | `https://t.me/share/url?url=<u>&text=<t>`           |
| WhatsApp | `https://wa.me/?text=<t>%20<u>`                     |
| X        | `https://twitter.com/intent/tweet?url=<u>&text=<t>` |
| Facebook | `https://www.facebook.com/sharer/sharer.php?u=<u>`  |

All values pass through `encodeURIComponent`.

### Shared URL / text

- URL: unchanged from current behavior —
  `${origin}/games/rooms/${roomId}${inviteCode ? '?inviteCode='+inviteCode : ''}`.
- Text: new i18n key `games.common.shareMessage` — default `"Join my game on Arcadeum!"`.
- Title (used by `navigator.share` only): `games.common.shareTitle` — default `"Arcadeum game invite"`.

## Components

```
apps/web/src/widgets/GamesControlPanel/ui/
├── GamesControlPanel.tsx         # edit: replace inline share button with <ShareGameMenu />
├── ShareGameMenu.tsx             # new: trigger + popover + native share fallback
└── ShareGameMenu.test.tsx        # new: unit tests
```

`ShareGameMenu` props:

```ts
interface ShareGameMenuProps {
  roomId: string;
  inviteCode?: string;
}
```

Building the URL stays inside `ShareGameMenu` (it needs `window.location.origin`,
so it must be client-only — the parent is already `'use client'`).

## i18n

Add to all 5 locale files
(`apps/web/src/shared/i18n/messages/games/shared/{en,ru,es,fr,by}.ts`)
under `common`:

```ts
share: 'Share',
shareTooltip: 'Share game',
shareTitle: 'Arcadeum game invite',
shareMessage: 'Join my game on Arcadeum!',
shareVia: {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  twitter: 'X',
  facebook: 'Facebook',
  copyLink: 'Copy link',
  copied: 'Copied!',
},
```

The existing `copyInviteLink*` keys remain (they may be referenced elsewhere)
and the trigger button keeps using `copyInviteLink` as `aria-label` fallback
until they are formally deprecated.

## Accessibility

- Trigger: `aria-label`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- Popover: `role="menu"`, items `role="menuitem"`.
- Esc closes; focus returns to trigger.

## Tests

`ShareGameMenu.test.tsx` (Vitest + Testing Library):

1. Renders trigger button with correct `aria-label`.
2. On desktop (no `navigator.share`): clicking trigger opens the popover with
   all 5 items.
3. Telegram / WhatsApp / X / Facebook items have an `href` containing the
   encoded invite URL and message.
4. Clicking Copy link writes the invite URL to the clipboard and shows the
   "Copied!" state.
5. On mobile (`navigator.share` mocked): clicking trigger calls
   `navigator.share` with `{ title, text, url }` and does NOT open the popover.
6. Esc / outside-click closes the popover.

## Out of scope (future)

- Open Graph image tuned for in-game invites (already covered by the
  per-game `/games/rooms/[id]` OG metadata).
- Share-event analytics.
- Instagram desktop integration if Meta exposes a usable share endpoint.
