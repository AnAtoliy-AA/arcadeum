# Handoff: Contact Us page rework — Variation 2 "Neon Arcade"

**Ticket:** ARC-575
**Target branch:** `feat/ARC-575-contact-rework`
**Scope:** `apps/web` + `packages/ui` (+ optional `apps/be` for activity/stats endpoints)

---

## Overview

The current `apps/web/src/app/contact/page.tsx` route renders a generic contact page (form + 3 info cards + 3 FAQ items). This rework replaces it with a more on-brand, gaming-forward direction ("Neon Arcade") that:

- improves form UX (floating labels, character counter, animated launch CTA, clear success state)
- surfaces multiple support channels (Discord, Twitter, Telegram, GitHub, plus existing email)
- shows live response-time SLA, "team online" indicator, and an HQ activity ticker
- adds a 5-item collapsible FAQ accordion
- supports the existing theme system (`neonDark` is the recommended default; works in all 8 themes)

---

## About the design files

The `design/` folder contains the HTML prototype that was built to validate this direction. **It is a design reference, not production code.** Do not copy the HTML/CSS verbatim. The task is to recreate the visuals and behaviors using:

- **Tamagui** primitives + `@arcadeum/ui` components (run `/check-ui-components` first)
- **TanStack Query** for any data fetching
- **i18n keys** (`getTranslations` server / `useTranslation` client) — never hardcoded strings
- **TypeScript**, no `any`
- The shared `socket.io` infra in `@/shared/lib/socket` (only if real-time activity feed is in scope)
- File length ≤ 500 lines (split if needed)

Open `design/Contact Us.html` in any browser to see the live design (the canvas shows 4 variations — **Variation 2** is what we're shipping; ignore 1, 3, 4 except as fallback inspiration). Use the Tweaks panel to flip layout / hero / theme.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, transitions, and interaction states are all final. Pixel-target the form, hero, channel tiles, stat strip, ticker, and accordion against `design/Contact Us.html` (Variation 2 artboard).

---

## Files to change / add

### `apps/web/src/app/contact/`

- **`ContactView.tsx`** — full rewrite. Server-renderable shell + a `'use client'` form section. Composition described below.
- **`ContactClient.tsx`** — keep as-is, just re-exports the dynamic import.
- **`page.tsx`** — keep as-is. Optionally pass new props (`channels`, `stats`) fetched server-side.

### `packages/ui/src/components/` (new shared components — run `/check-ui-components` first; only add if no existing component fits)

- **`ActivityTicker/`** — `<ActivityTicker items={[…]} interval={3200} />` rotating feed. Stories + tests.
- **`FloatingLabelInput/`** — extends existing `Input` with floating label + optional `maxLength` counter. Stories + tests.
- **`FloatingLabelTextArea/`** — same for `TextArea`.
- **`ChannelTile/`** — `<ChannelTile icon title sub gradient href />` branded gradient tile with sweep glow.
- **`StatTile/`** — `<StatTile label value sparkline? />` with optional sparkline accent.
- **`LaunchButton/`** — animated submit variant of `Button` (gradient bg, rocket icon, launching state with flash).

### `packages/ui/src/tamagui.config.ts`

Add (optional, only if useful elsewhere):

```ts
accentGlow: 'rgba(56, 189, 248, 0.40)', // for drop-shadow on gradient text in neonDark
```

### i18n — add keys to all 5 locale files (`en`, `ru`, `es`, `fr`, `by`)

Under `legal.contact.sections`:

```json
{
  "hero": {
    "eyebrow": "Player support",
    "title": "We're on the same team.",
    "tagline": "Drop a question, report a bug, hand us a feature idea — we read every message and the whole team plays the games we ship.",
    "statusOk": "All systems operational",
    "medianReply": "~ {{hours}} hr median reply",
    "humansOnline": "{{count}} humans online",
    "languages": "{{count}} languages"
  },
  "stats": {
    "ticketsResolved": "Tickets resolved this month",
    "avgRating": "Avg. support rating",
    "languagesSupported": "Languages supported",
    "slaHit": "SLA hit rate"
  },
  "channels": {
    "discord": { "title": "Discord", "sub": "Live chat · {{count}} members" },
    "twitter": { "title": "@arcadeum", "sub": "DMs are open" },
    "telegram": { "title": "Telegram", "sub": "t.me/arcadeum" },
    "github": { "title": "GitHub Issues", "sub": "Bugs & feature requests" }
  },
  "form": {
    "title": "Send the team a message",
    "subtitle": "Direct message",
    "repliesNote": "Replies hit your email",
    "name": "Your name",
    "email": "Email",
    "subject": "Subject",
    "message": "Message",
    "privacy": "Private — we never share your email.",
    "submit": "Launch message",
    "submitting": "Sending…",
    "successTitle": "Message away.",
    "successBody": "Expect a reply within 4 hours. We sent a copy to your email.",
    "sendAnother": "Send another"
  },
  "side": {
    "onCall": "On call right now",
    "medianFirstReply": "Median first reply",
    "workingHours": "Working hours",
    "coverage": "Coverage",
    "devsTitle": "Bugs & integration",
    "devsBody": "Reproducible bugs, API issues, and SDK questions are tracked in GitHub. We triage within 24 hours.",
    "openIssue": "Open an issue",
    "press": "Press & partnerships",
    "pressEmail": "hello@arcadeum.games",
    "pressBody": "For media, creators, and partner studios."
  },
  "ticker": { "label": "HQ live feed" },
  "faq": {
    "title": "Maybe we already answered this",
    "browse": "Browse help center"
  }
}
```

Also add to `docs/` if your translation-type-safety pipeline needs regeneration — see `docs/TRANSLATION_TYPE_SAFETY.md`.

---

## Layout (Variation 2)

Single-column page, max-width ~1100px, centered. Vertical rhythm: 32px gaps between sections.

```
┌─ HERO (full-bleed gradient) ─────────────────────────────┐
│  eyebrow chip + url breadcrumb                            │
│  H1 (54–64px) with last-word gradient                     │
│  tagline (18px, max 60ch)                                 │
│  pills row: status / SLA / online / languages             │
│  ── ActivityTicker (rotating live feed) ──                │
└──────────────────────────────────────────────────────────┘
┌─ STAT STRIP (4 columns, sparkline accent) ───────────────┐
│  2,840  │  4.9 ★  │  5  │  98%                            │
└──────────────────────────────────────────────────────────┘
┌─ CHANNEL TILES (auto-fill, minmax 220px) ────────────────┐
│  Discord │ Twitter │ Telegram │ GitHub                    │
└──────────────────────────────────────────────────────────┘
┌─ FORM (left, 1.6fr) ──────┬─ SIDE (right, 1fr) ──────────┐
│  Floating-label inputs:   │  On-call card (avatars+SLA)  │
│   name, email             │  Devs card (GitHub CTA)      │
│   subject (full)          │  Press card (email link)     │
│   message + counter       │                              │
│  Privacy + LaunchButton   │                              │
└───────────────────────────┴──────────────────────────────┘
┌─ FAQ ACCORDION (5 items) ────────────────────────────────┐
└──────────────────────────────────────────────────────────┘
```

Single-column at ≤ 800px (form below side panels).

---

## Components — implementation notes

### Hero

- Background: layered radials `radial-gradient(80% 80% at 50% 100%, accent@18%, transparent 70%)` + `radial-gradient(60% 60% at 0% 0%, primary@22%, transparent 65%)` over `bg-elev`.
- Two animated glow orbs (360px / 320px), `filter: blur(60px)`, slow sinusoidal `translate` keyframes (14s + 18s, alternate).
- Decorative starfield (multi-layer 1px radial gradients) + 48px grid masked by radial gradient — **decorative only**, mark `aria-hidden`.
- Headline: last word wrapped in `<span>` with `linear-gradient(120deg, var(--accent), color-mix(...,#f472b6))`, `background-clip: text`, plus `drop-shadow(0 0 24px accent@40%)`.
- Eyebrow chip: small dot with `box-shadow: 0 0 8px accent` (the "lit" effect).

### ActivityTicker (`packages/ui/components/ActivityTicker`)

Props: `{ items: { tag, who, what, when, color }[]; interval?: number; label?: string }`

- Renders fixed-height row that cross-fades + 8px upward translate every `interval` ms.
- `aria-live="polite"`. Pause on `prefers-reduced-motion: reduce`.
- Data source for the contact page: `useQuery({ queryKey: ['support', 'activity'], queryFn, staleTime: 30_000 })`. If BE endpoint isn't ready, ship with a static fallback array; mark with a TODO referencing the BE ticket.

### Stat strip

- 4-column grid joined by `1px` gap with `grid-template-columns: repeat(4, 1fr)` over a `var(--glass-border)` background (creates dividers without per-cell borders).
- Each cell: number (28px, `Space Grotesk` 600), uppercase tracked label, then a stylized `::after` sparkline shape. Sparklines are decorative — if real data is wired up later, swap for a real `<svg>` polyline.

### ChannelTile (`packages/ui/components/ChannelTile`)

Props: `{ icon: ReactNode; title: string; sub: string; gradient: string; href: string }`

- Card with `background: bg-elev` + a `::before` that paints the prop gradient at `opacity: 0.16` (rises to `0.32` on hover).
- 44×44 icon container with translucent dark backplate.
- Right arrow that nudges 4px on hover.
- A `::after` sweep glow animates `background-position` over 0.8s on hover.
- Light themes need explicit overrides (icon color + sub color) — see `design/styles/variation2-deep.css` `[data-theme$="Light"]` rules.

### FloatingLabelInput / FloatingLabelTextArea

- Wraps Tamagui `Input` / `TextArea` with `position: relative`.
- Label absolutely positioned over the input; on focus or filled (length > 0), translate up 22px, shrink to 11px, uppercase + tracked, color = `accent`, with a `bg-elev` chip behind it so it punches through the input border.
- Required indicator: `*` in `accent`.
- `maxLength` prop (textarea only) shows a tabular-numeric counter pinned bottom-right; turns warning color past 85%.

### LaunchButton

- Primary submit. Gradient bg `linear-gradient(120deg, primary, color-mix(accent 80%, primary))`.
- Two glow shadows that intensify on hover.
- Rocket icon translates+rotates slightly on hover (cubic-bezier playful overshoot).
- On `isLaunching` true: rocket icon translates `(120px, -80px) rotate(-30deg)` over 0.7s and fades; button paints a radial flash (`v2-flash` keyframes). After 0.7s, swap to success state.

### FAQ

- Existing 3 items + 2 new ones (multiplayer lag, report a player). Copy in `design/variation2.jsx` → `FAQ_ITEMS` const.
- Single-open accordion (only one item open at a time).
- Use existing `CollapsibleSection` from `@arcadeum/ui` if its API fits — otherwise a thin local wrapper. The smooth height animation in the design uses CSS `grid-template-rows: 0fr → 1fr` trick — swap for whatever the existing component does.

---

## Interactions & behavior

| Element         | Behavior                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form submit     | Validate required; on valid, set `isLaunching=true` → 700ms animation → set `submitted=true`. Show success card with "Send another" button that resets form + state. |
| Channel tiles   | External links: open in new tab with `rel="noopener noreferrer"`. Telemetry event `contact_channel_clicked` with `{channel}`.                                        |
| Activity ticker | Cross-fade every 3.2s. Pauses on hover (optional).                                                                                                                   |
| Status pill     | Reads from `useStatusSubscription()` (your shared socket infra). Falls back to "All systems operational" if disconnected.                                            |
| FAQ items       | Click header to expand; only one open at a time; chevron rotates 180°.                                                                                               |
| Launch button   | Disabled during `isLaunching`. ARIA: `aria-busy={isLaunching}`.                                                                                                      |

### Reduced motion

Wrap the orb floats, ticker fades, and rocket flight in `@media (prefers-reduced-motion: no-preference)`. The page must be fully usable without animation.

### Keyboard / a11y

- All interactive elements must reach via tab in document order.
- Floating labels remain accessible — the `<label>` is a real label tied to the input by `for`/`id`. Don't break this.
- Glow orbs and starfield are `aria-hidden`.
- Color contrast: verified against `neonDark` token values; if you change the gradient stops, re-verify ≥ 4.5:1 for the gradient text against hero bg.

### Responsive

- ≤ 800px: stack form/side, tiles → 2 columns, hero padding shrinks, headline → 40px, ticker drops "HQ live feed" label and "when" timestamp.
- ≤ 540px: tiles → 1 column.

---

## State management

Local component state (form value, `isSubmitting`, `submitted`) — no Zustand needed.

Server state (TanStack Query):

- `useSupportActivity()` → ticker items (poll 30s; or socket subscription if BE supports)
- `useSupportStats()` → `{ ticketsResolved, avgRating, languages, slaPercent }` (5 min stale)
- `useSupportPresence()` → `{ onlineNames: string[], coverage: string }`

Submit:

- `useMutation` against existing `POST /api/contact` (or new endpoint). Optimistic UI: show launching state immediately; rollback to form with toast on error.

---

## Backend (optional, separate sub-task)

If activity / stats / presence endpoints don't exist, scaffold a `support` module per `/new-be-module`:

```
apps/be/src/modules/support/
  support.module.ts
  support.controller.ts   GET /activity, GET /stats, GET /presence
  support.service.ts
  dto/                    activity-item.dto.ts, stats.dto.ts (class-validator)
  schemas/                support-event.schema.ts (Mongoose, if persisted)
```

All routes guarded by `@UseGuards(JwtAuthGuard)` only if you want to scope to authed users. Public endpoints are fine for activity/stats; consider a small in-memory cache.

---

## Design tokens used

All values resolve from existing `packages/ui/src/tamagui.config.ts`. The design CSS (`design/styles/tokens.css`) maps them to CSS vars 1:1 — use it as a quick lookup. Theme used by default: `neonDark`.

| Purpose                       | Token                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Page bg                       | `themes.neonDark.background` (`#06011b`)                                          |
| Card bg                       | `themes.neonDark.glassBg`                                                         |
| Primary                       | `themes.neonDark.primary` (`#0369a1`)                                             |
| Accent (glow + gradient text) | `themes.neonDark.accent` (`#38bdf8`)                                              |
| Body text                     | `themes.dark.color` (`#ecefee`)                                                   |
| Muted text                    | `themes.dark.textSecondary` (`#8e9196`)                                           |
| Border                        | `themes.dark.borderColor` (`#32353d`)                                             |
| Spacing scale                 | `tokens.space.$1..$12` (4px → 48px)                                               |
| Radii                         | `tokens.radius.$3` (12px) for inputs, `$4` (16px) for cards, `$5` (20px) for hero |

Type:

- Body: `Inter` 400/500/600/700 (already loaded via global)
- Heading: `Space Grotesk` 500/600/700 (add to `apps/web/src/shared/fonts` if not present)
- Headline scale: 64 / 24 / 16. Letter-spacing: -0.035em on H1.

---

## Assets

No new image assets. All visuals are CSS / inline SVG icons (Discord, Twitter/X, Telegram, GitHub, mail, send, clock, globe, doc, status, search, chev). Icon SVGs are in `design/shared.jsx` → `Icon` const — copy paths into your existing icon component or use `lucide-react` equivalents:

| Custom                                             | Lucide equivalent                     |
| -------------------------------------------------- | ------------------------------------- |
| `Icon.mail`                                        | `Mail`                                |
| `Icon.send`                                        | `Send`                                |
| `Icon.clock`                                       | `Clock`                               |
| `Icon.globe`                                       | `Globe`                               |
| `Icon.chev`                                        | `ChevronDown`                         |
| `Icon.search`                                      | `Search`                              |
| `Icon.spark`                                       | `Sparkles`                            |
| `Icon.discord` / `twitter` / `telegram` / `github` | `simple-icons` or copy the inline SVG |

---

## API contract (future)

The form currently simulates submission with a 700 ms launch
animation and `setSubmitted(true)` — there is no `/api/contact`
endpoint today. When the optional `support` BE module from this
handoff lands, mirror these limits in the DTO with
`class-validator` decorators so the client and server agree:

- `POST /api/contact` body: `{ name, email, subject, message }`
  - `name` — 1..120 chars
  - `email` — RFC 5322
  - `subject` — 1..200 chars
  - `message` — 1..1200 chars _(matches the `FloatingLabelTextArea` `maxLength` on the contact page)_

The frontend's `FloatingLabelTextArea` enforces the 1200-char cap
client-side via the native `maxLength` attribute and surfaces a
counter that turns warning at 85 % of the limit. The BE DTO must
hard-cap at the same number — never trust client-side validation
alone.

---

## Acceptance checklist

- [ ] Existing e2e `apps/web/e2e/contact.spec.ts` still passes (test IDs preserved: `contact-name-input`, `contact-email-input`, `contact-subject-input`, `contact-message-textarea`, `contact-submit-button`, `contact-success-message`).
- [ ] Form validates on empty submit and bad email.
- [ ] Success state appears after valid submit; form is no longer rendered.
- [ ] All copy goes through i18n; no hardcoded user-facing strings.
- [ ] No `any` types.
- [ ] Server Components used where possible (client only where needed: form + ticker).
- [ ] All new shared components have stories + tests.
- [ ] File length ≤ 500 lines.
- [ ] `pnpm lint && pnpm test && pnpm --filter web test && pnpm --filter web e2e` clean.
- [ ] Lighthouse a11y ≥ 95 on `/contact`.
- [ ] Works in all 8 themes (light, dark, neonLight, neonDark, violetLight, violetDark, tealLight, tealDark) — check via your existing theme toggle.

---

## Commit + PR plan

Conventional commits per CLAUDE.md, scope `ARC-575`:

1. `feat(ui): add ActivityTicker component (ARC-575)`
2. `feat(ui): add FloatingLabelInput / FloatingLabelTextArea (ARC-575)`
3. `feat(ui): add ChannelTile and StatTile components (ARC-575)`
4. `feat(ui): add LaunchButton variant (ARC-575)`
5. `feat(web): rework /contact page with new components (ARC-575)`
6. `feat(i18n): add contact rework keys for en/ru/es/fr/by (ARC-575)`
7. _(optional)_ `feat(be): scaffold support module for activity/stats/presence (ARC-575)`

PR body — use `/pr-description`. Include screenshots from the design canvas.

---

## Files in this handoff

```
design_handoff_contact_rework_ARC-575/
├── README.md                              ← you are here
└── design/
    ├── Contact Us.html                    ← open in browser; pannable canvas with all 4 variations
    ├── shared.jsx                         ← Icon set, FAQ_ITEMS, CHANNELS, Avatars, StatusPill, Accordion
    ├── variation2.jsx                     ← THE direction to ship
    ├── variation1.jsx                     ← reference; "Refined" fallback
    ├── variation3.jsx                     ← reference; "Channel-First" fallback
    ├── variation4.jsx                     ← reference; "Concierge" fallback
    ├── design-canvas.jsx                  ← canvas chrome (not for production)
    ├── tweaks-panel.jsx                   ← canvas chrome (not for production)
    └── styles/
        ├── tokens.css                     ← CSS-var mapping of every Tamagui token used
        ├── variations.css                 ← shared form / accordion / channel / pill styles
        └── variation2-deep.css            ← V2-specific: hero, ticker, tiles, floating labels, CTA
```

Open `Contact Us.html` and focus the **02 · Neon Arcade** artboard.
