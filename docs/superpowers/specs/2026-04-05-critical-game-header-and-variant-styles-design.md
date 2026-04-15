# Critical Game — Header Redesign & Full Variant Immersion

**Date:** 2026-04-05  
**Branch:** ARC-456  
**Scope:** `apps/web/src/widgets/CriticalGame/ui/`

---

## Problem

1. **Header too tall.** `GameHeader` renders `GameInfo` as a full-width `YStack` (`width: '100%'`) which forces a second row, making the header ~140px tall. This pushes gameplay far down the screen.
2. **Generic design.** The stacked title + badges + turn status is visually heavy and not differentiated by variant.
3. **Crime, horror, adventure variants are shallow.** They only override `cards`; `layout`, `header`, `table`, `players`, `tableInfo`, `chat` all fall back to the base (indigo/pink) palette, breaking immersion. Cyberpunk and underwater are fully themed.

---

## Out of Scope

- `ParticleOverlay.tsx` — all 6 variant animations already exist (scanlines, bubbles, rain, snowflakes, dust motes, vignette). **No changes.**
- `TableDecorations.tsx` — sonar sweep, ice crystals, snowflakes already exist. **No changes.**
- `PlayersRing` circular layout — players around a round table. **No changes.**
- `CenterTable` circular shape (deck + discard). **No changes.**
- `GamesControlPanel` (outer room bar) — out of scope.

---

## Design

### 1. Compact Glassy Pill Header

**File:** `styles/header.tsx`

Replace the two-row structure with a single compact row. Target height: **≤ 56px desktop, ≤ 48px mobile**.

**New single-row structure:**

```
[ icon badge ] [ title text + room name ] [ flex spacer ] [ TurnStatusPill ] [ timer? ] [ 📖 ] [ ⛶ ]
```

#### `GameHeader` changes

- Remove `flexWrap: 'wrap'`
- Change `paddingVertical` from `$4` to `$2`
- Keep negative `marginHorizontal` / `marginTop` for full-bleed
- Add a `::before` pseudo-element for the accent line:

```ts
before: {
  content: '""',
  position: 'absolute',
  top: 0,
  left: '$7',        // align with padding
  right: '$7',
  height: 2,
  background: config.getLineBackground(),
  boxShadow: config.getLineShadow(),
  borderRadius: 1,
}
```

This accent line gets its color from each variant's `header.getLineBackground()` (defined for cyberpunk/underwater today; crime/horror/adventure will define it in their new files).

#### `GameInfo` changes

Change from `YStack` with `width: '100%'` to an `XStack` (`alignItems: 'center'`, `gap: '$2'`, no width override). It contains:

1. **Variant icon badge** — 30×30 rounded square, background from variant accent color, shows emoji
2. **Title + room name** — `YStack` with zero gap (visually stacked, title on top, room name below):
   - Top: `GameTitle` at `fontSize: 16` showing `"Critical · Variant Name"` — full gradient from `$variant` (remove the hardcoded inline `<span style={{ background: 'linear-gradient(135deg, #FF0080 ...)' }}>` wrapping the variant name in `CriticalGameHeader.tsx`; let the styled `GameTitle` handle the full gradient via `getTitleBackground()`)
   - Bottom: plain `Text` at `fontSize: 11`, `opacity: 0.5` showing `room.name` plus `" · ⚡"` suffix when `idleTimerEnabled` is true

`RoomNameBadge`, `RoomNameIcon`, `RoomNameText`, and `FastBadge` are **removed** as separate block elements — they were imported from `styles/lobby.tsx` and used in `CriticalGameHeader.tsx`. Delete those usages; the room name and fast indicator are now inline text in the title stack.

#### `TurnStatusPill` (new export in `header.tsx`)

A `YStack` wrapper around `TurnStatus` to give it pill styling:

```ts
export const TurnStatusPill = styled(YStack, {
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderWidth: 1,
  // border and bg come from parent context / $status variant
});
```

Status colors follow the existing `TurnStatus` variant map defined in `header.tsx` lines 90–107: `yourTurn` → `$success` (green), `waiting` → `$warning` (amber), `completed` → `$secondary`, `default` → muted. Add a matching semi-transparent background per status (e.g. `yourTurn` → `rgba(16,185,129,0.12)`).

#### `GameTitle` changes

- `fontSize: 16` (from 24)
- Remove `getTitleTextStyles` call from the `GameTitle` styled component variant block — currently called as `...config.getTitleTextStyles?.()` in `styles/header.tsx` lines 83–86. These were complex effects (cyberpunk glitch, underwater water-reflection) incompatible with the new compact size.
- Set `getTitleTextStyles: () => ({})` (safe no-op) in: `styles/variants/base.ts`, `styles/variants/cyberpunk/header.ts`, and `styles/variants/underwater.ts`. The three new variant files (crime-full, horror-full, adventure-full) should also define `getTitleTextStyles: () => ({})` in their header sections.

#### Mobile (`$sm`) header

On mobile (`$sm` breakpoint, ≤600px), the single row must fit in 48px. Apply these via `$sm` prop on the relevant elements:
- Room name / fast suffix `Text`: `display: 'none'`
- Timer badge (`TimerControlsWrapper`): `display: 'none'` — the `IdleTimerDisplay` component already shows countdown inside the game board area, so no information is lost
- Icon badge: shrink to 24×24
- Only: icon + title + turn pill + rules button + fullscreen button remain visible

---

### 2. Extend Crime, Horror, Adventure to Full Variant Depth

Follow the **flat file pattern** of `underwater.ts` (single file per variant, not a directory). This keeps the 3 new variants at a manageable size and consistent with the existing monolithic style.

Create three new flat files (matching the `underwater.ts` naming convention — no `-full` suffix):
- `styles/variants/crime-full.ts`  → named `crimeFullVariantStyles`, exported as `VariantStyleConfig` (not Partial — all fields required)
- `styles/variants/horror-full.ts` → named `horrorFullVariantStyles`
- `styles/variants/adventure-full.ts` → named `adventureFullVariantStyles`

Each exports a full `VariantStyleConfig` (not `Partial`) covering all sections. The existing `crime.ts`, `horror.ts`, `adventure.ts` are imported for their `cards` section and remain unchanged.

Color palettes already exist in `variant-palette.ts`:

| Variant   | Primary         | Secondary | Background |
|-----------|-----------------|-----------|------------|
| crime     | `#dc2626` red   | `#27272a` | `#18181b`  |
| horror    | `#10b981` emerald | `#0f172a` | `#020617` |
| adventure | `#f59e0b` amber | `#78350f` | `#451a03`  |

#### `styles/variants/index.ts` changes

Current shallow merge for crime (example):
```ts
case GAME_VARIANT.CRIME:
  return {
    ...baseVariantStyles,
    cards: { ...baseVariantStyles.cards, ...crimeVariantStyles.cards! },
  };
```

New full merge:
```ts
import { crimeFullVariantStyles } from './crime-full';
// ...
case GAME_VARIANT.CRIME:
  return {
    ...baseVariantStyles,
    ...crimeFullVariantStyles,
  };
```

Same pattern for horror and adventure.

#### What each section controls per new variant file

Use `underwater.ts` as the implementation reference — copy its structure and substitute variant-specific colors from `VARIANT_COLORS`.

| Section     | What to define |
|-------------|----------------|
| `layout`    | `getBackgroundEffects`, `getRoomBackground` gradient, `getRoomBorder`, `getRoomShadow` |
| `header`    | `getBackground`, `getBorder`, `getLineBackground` → use `VARIANT_COLORS[variant].primary` as the accent color, `getLineShadow`, `getTitleBackground`, `getTitleTextStyles: () => ({})` |
| `table`     | `getBackground`, `getBorder`, `getShadow`, `center.getBackground`, `center.getBorder`, `center.getShadow`, `center.getGlow` |
| `players`   | All player methods from `VariantStyleConfig.players` — use underwater.ts as model |
| `tableInfo` | `getBackground`, `getBorder`, `getShadow`, `getTextGlow`, `getStatValueColor`, `getInfoCardBackground`, `getInfoCardBorder`, `getInfoCardShadow`, `getInfoCardPattern` |
| `chat`      | `getBackground`, `getBorder`, `getShadow`, `getInputFocusBorder`, `getInputFocusShadow` |
| `cards`     | Re-export from existing `crime.ts` / `horror.ts` / `adventure.ts` (no changes to those files) |

**Example file shape for `crime-full.ts`:**
```ts
import { VariantStyleConfig } from './types';
import { VARIANT_COLORS } from '../variant-palette';
import { crimeVariantStyles } from './crime'; // existing cards

const C = VARIANT_COLORS.crime;

export const crimeFullVariantStyles: VariantStyleConfig = {
  layout: { /* ... */ },
  header: { /* ... */ },
  table: { /* ... */ },
  players: { /* ... */ },
  tableInfo: { /* ... */ },
  chat: { /* ... */ },
  cards: crimeVariantStyles.cards!,
};
```

---

## Files Changed

| File | Change |
|------|--------|
| `styles/header.tsx` | Compact `GameHeader` (single row, `paddingVertical: $2`, no wrap); `GameInfo` → `XStack`; new `TurnStatusPill`; accent line via `::before`; `GameTitle` at `fontSize: 16`; `getTitleTextStyles` → no-op for all variants |
| `CriticalGameHeader.tsx` | New single-row JSX: identity XStack (icon + title/room) + `TurnStatusPill` center + `HeaderActions`; remove `RoomNameBadge` / `FastBadge` as separate blocks |
| `styles/variants/crime-full.ts` | New file — full `VariantStyleConfig` for crime (imports `crimeVariantStyles.cards`) |
| `styles/variants/horror-full.ts` | New file — full `VariantStyleConfig` for horror |
| `styles/variants/adventure-full.ts` | New file — full `VariantStyleConfig` for adventure |
| `styles/variants/index.ts` | Update crime/horror/adventure cases to `{ ...baseVariantStyles, ...crimeFullVariantStyles }` pattern |
| `styles/variants/base.ts` | Set `getTitleTextStyles: () => ({})` |
| `styles/variants/cyberpunk/header.ts` | Set `getTitleTextStyles: () => ({})` (glitch effect removed from title) |
| `styles/variants/underwater.ts` | Set `getTitleTextStyles: () => ({})` (water-reflection effect removed from title) |

---

## Success Criteria

- Header height ≤ 56px on desktop, ≤ 48px on mobile (no wrapping)
- All 6 variants have distinct `layout`, `header`, `table`, `players` theming
- Existing particle animations (snow, bubbles, rain, scanlines, dust, vignette) still render
- Circular table layout unchanged
- No TypeScript `any` or type errors introduced
- `pnpm check-file-length` passes (all files ≤ 500 lines)
