# App Header Rework (ARC-726)

## Problem

The app header is visually overloaded on desktop. The right-side cluster currently packs **eight independent controls**: wallet chip, Install-PWA button, Support button, Language switcher (separate globe icon + select), Profile chip (avatar + name + role badge + cosmetic badges + chevron), Login button (when logged out), MobileLoginIndicator, and Menu toggle. The middle nav carries **six links** including `Settings`, which is also duplicated inside the profile dropdown. A glowing animated border line and 24px logo text add further visual weight.

## Goals

- Reduce the desktop right cluster to **three primary controls** (Language, Profile, Login-when-logged-out).
- Reduce desktop primary nav to **three engagement-driver entries**: `Games · Leaderboards · Shop`. Communication/review entries (`Chats`, `History`, `Stats`, `Settings`) collapse into the profile dropdown.
- Surface Install-PWA and Support without losing functionality, by moving them inside the profile dropdown (where they belong as utility/help actions).
- Modernize visuals: tighter spacing, calmer border, single active-nav treatment.
- Mobile drawer keeps the full nav list (Games, Leaderboards, Shop, Chats, History, Stats) — mobile has space and users reach everything via one tap on the hamburger.

## Non-goals

- Restructuring routing, wallet chip, or backend payloads.
- Touching `apps/mobile` — this is desktop/web-only.
- Reworking the profile dropdown's information architecture beyond adding two items and a compact identity card.

## Design

### Desktop primary nav (HeaderInteractive)

From: `Games · Shop · Chats · History · Stats · Settings`
To: `Games · Leaderboards · Shop`

Rationale: these three are the _engagement-driver_ surfaces — play, compete, monetize. Communication (`Chats`), review (`History`, `Stats`), and configuration (`Settings`) are all _secondary_ surfaces that collapse into the profile dropdown. The mobile drawer (opened via hamburger) still shows the full six-item nav, because mobile has space.

Routes used: `routes.games`, `routes.leaderboards`, `routes.shop`. Mobile-only additions in the drawer: `routes.chats`, `routes.history`, `routes.stats`.

### Desktop right cluster (HeaderInteractive)

Remove from header:

- `InstallPWAButton` (HeaderMobileHidden wrapper)
- Support `LinkButton` (DesktopOnly wrapper)

Keep in header:

- `LanguageSwitcher` (compact form, see below)
- `ProfileMenu` (compact chip, see below)
- `Login` LinkButton (when not authenticated)
- `MobileLoginIndicator` + `MobileMenu` toggle (unchanged)

### LanguageSwitcher (compact)

Drop the standalone `GlobeIcon` that sits next to the `Select`. The select itself shows `EN ▾` — that's enough signal. The mobile drawer uses `LanguagePills` (which keeps its globe icon as the row's header) so the affordance for "this is the language picker" is preserved on mobile.

### ProfileMenu chip (compact)

From: `Avatar + Name + RoleBadge(if !free) + CosmeticBadges + Chevron`
To: `Avatar + Name + RoleBadge(if !free) + Chevron`

`CosmeticBadges` move into a new identity card rendered at the top of the dropdown. This keeps the chip itself narrow (the badge row is the variable-width offender) without losing the badge signal — it's now in the dropdown header where users land after one click.

### ProfileMenu dropdown additions

Add a compact identity card at the top:

```
┌───────────────────────────────┐
│ [Avatar] DisplayName [Role]   │
│          [Badge][Badge][...]  │
└───────────────────────────────┘
[Admin link if admin]
[Wallet]
[Settings]
[Chats]      ← moved from top nav
[History]    ← moved from top nav
[Stats]
[Referrals]
─────────────
[Install app]  ← new (only if pwa.canInstall)
[Support]      ← moved from header
─────────────
[Terms]
[Privacy]
[Contact]
─────────────
[Logout]
```

### Visual polish

- Drop the bottom-border underline indicator on active nav (`NavLinkIndicator`) — pill background alone marks active state. Single treatment is calmer.
- Soften `header-border-line`: keep gradient, drop the glow `box-shadow` and lower opacity from `0.8 → 0.5`.
- Tighten `actions-styled` gap from `24px → 16px` (chips already have their own internal padding).

### Mobile

Mobile drawer receives the full six-item nav list (Games, Leaderboards, Shop, Chats, History, Stats) — desktop slims, mobile stays comprehensive. `HeaderInteractive` computes a separate `mobileNavItems` and passes it to `MobileMenu`. `MobileMenu`'s `NAV_ICON_BY_SLUG` gets a `leaderboards: TrophyIcon` entry. Install-PWA, Support, and Logout still live in the mobile drawer as today.

## Files touched

- `apps/web/src/widgets/header/ui/HeaderInteractive.tsx` — desktop nav slim to 3, build `mobileNavItems` list of 6 and pass to MobileMenu, remove InstallPWA+Support, drop `NavLinkIndicator` usage
- `apps/web/src/widgets/header/ui/ProfileMenu.tsx` — compact chip, add identity card, add Chats + History + Install-PWA + Support dropdown items
- `apps/web/src/widgets/header/ui/MobileMenu.tsx` — add `leaderboards: TrophyIcon` to icon map
- `apps/web/src/widgets/header/ui/LanguageSwitcher.tsx` — drop standalone GlobeIcon
- `apps/web/src/widgets/header/ui/styles.tsx` — add identity-card styled component; can leave NavLinkIndicator exported (unused) or remove
- `apps/web/src/widgets/header/ui/header-stable.css` — calmer border, tighter actions gap
- `apps/web/src/shared/i18n/messages/navigation.ts` — add `leaderboardsTab` in 5 locales
- `packages/ui/src/components/Icons/GameIcons.tsx` — add `TrophyIcon` (lucide trophy path)

## Testing

- Unit: `useHeaderAuth`, `useMobileMenu`, `useClickOutside` tests stay green (no logic changes).
- E2E (Playwright):
  - `e2e/header-language.spec.ts` — verify language picker still works after compaction.
  - `e2e/header-responsive.spec.ts` — verify nav/actions visibility at 1400/1150/480px breakpoints.
  - `e2e/navigation.spec.ts` — verify `Settings` is no longer in primary nav and is reachable via profile dropdown.
  - `e2e/header-footer-modernization.spec.ts` — adjust assertions for the new desktop right cluster (no Install-PWA, no Support button at top level).

## Risk

Low. All removed buttons are preserved one level deeper. The biggest risk is e2e test selectors that target the removed Support button at the top level — those tests need updating. No data, auth, or routing changes.
