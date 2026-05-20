# App Header Rework (ARC-726)

## Problem

The app header is visually overloaded on desktop. The right-side cluster currently packs **eight independent controls**: wallet chip, Install-PWA button, Support button, Language switcher (separate globe icon + select), Profile chip (avatar + name + role badge + cosmetic badges + chevron), Login button (when logged out), MobileLoginIndicator, and Menu toggle. The middle nav carries **six links** including `Settings`, which is also duplicated inside the profile dropdown. A glowing animated border line and 24px logo text add further visual weight.

## Goals

- Reduce the desktop right cluster to **three primary controls** (Language, Profile, Login-when-logged-out).
- Reduce primary nav from 6 → 5 by dropping the duplicate `Settings` entry.
- Surface Install-PWA and Support without losing functionality, by moving them inside the profile dropdown (where they belong as utility/help actions).
- Modernize visuals: tighter spacing, calmer border, single active-nav treatment.
- No regressions on mobile — the mobile menu drawer already groups things well; it stays.

## Non-goals

- Restructuring routing, wallet chip, or backend payloads.
- Touching `apps/mobile` — this is desktop/web-only.
- Reworking the profile dropdown's information architecture beyond adding two items and a compact identity card.

## Design

### Desktop primary nav (HeaderInteractive)

From: `Games · Shop · Chats · History · Stats · Settings`
To: `Games · Shop · Chats · History · Stats`

`Settings` is removed from the top nav. It remains reachable via the profile dropdown, where it already lives.

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

No structural changes. Install-PWA and Support already live in the mobile drawer. Mobile drawer keeps its current sections.

## Files touched

- `apps/web/src/widgets/header/ui/HeaderInteractive.tsx` — slim nav, remove InstallPWA+Support, drop `NavLinkIndicator` usage
- `apps/web/src/widgets/header/ui/ProfileMenu.tsx` — compact chip, add identity card, add Install-PWA + Support dropdown items
- `apps/web/src/widgets/header/ui/LanguageSwitcher.tsx` — drop standalone GlobeIcon
- `apps/web/src/widgets/header/ui/styles.tsx` — add identity-card styled component; can leave NavLinkIndicator exported (unused) or remove
- `apps/web/src/widgets/header/ui/header-stable.css` — calmer border, tighter actions gap

## Testing

- Unit: `useHeaderAuth`, `useMobileMenu`, `useClickOutside` tests stay green (no logic changes).
- E2E (Playwright):
  - `e2e/header-language.spec.ts` — verify language picker still works after compaction.
  - `e2e/header-responsive.spec.ts` — verify nav/actions visibility at 1400/1150/480px breakpoints.
  - `e2e/navigation.spec.ts` — verify `Settings` is no longer in primary nav and is reachable via profile dropdown.
  - `e2e/header-footer-modernization.spec.ts` — adjust assertions for the new desktop right cluster (no Install-PWA, no Support button at top level).

## Risk

Low. All removed buttons are preserved one level deeper. The biggest risk is e2e test selectors that target the removed Support button at the top level — those tests need updating. No data, auth, or routing changes.
