# Critical — Active Game View Redesign

**Date:** 2026-04-19
**Scope:** `apps/web` only. Active Game View of the Critical widget (post-lobby, in-game scene).
**Out of scope:** Lobby, mobile app (`apps/mobile`), backend/game engine changes.

## Purpose

The Active Game View is the core gameplay surface of Critical. Today it reads as a generic card-game UI: flat dark panels, weak turn affordance, hand layout that competes with the table for attention, and variant theming that only tints backgrounds. The redesign replaces it with an **immersive, neon-forward, depth-layered scene** that (a) makes turn state impossible to miss, (b) pulls variant theming through to first-class visual identity, and (c) reads as polished and contemporary at both desktop and mobile web widths.

Direction was validated in two visual mockup rounds: the "Immersive, maxed out" hero (desktop) and the portrait mobile pair (view-state + your-turn-with-selected-card).

## Goals

1. **Turn state is the loudest thing on screen.** A player should know whose turn it is within 200ms of opening the tab.
2. **Layered depth.** At least 4 distinct z-depth layers (background, ambient, table, HUD/hand/foreground). No flat single-plane composition.
3. **Variant-first theming.** The active palette (primary + accent + background) cascades into card glow, HUD colors, particle hue, turn-banner gradient, and ambient light — not just the room background.
4. **Modern polish.** Subtle motion on idle elements (pulse on turn dot, drift on particles, soft shimmer on horizon line). No gratuitous flashing.
5. **Mobile web parity.** Same visual language at 375px as at 1200px+, reflowing opponents into a horizontal chip row, hand into a scrollable strip, and card-targeting into a bottom sheet.
6. **No regressions** to game-action correctness or socket/state flow. This is a presentation-layer change.

## Non-goals

- Changing game rules, actions, timing, or server behavior.
- Redesigning modals (stash, favor, defuse, targeted-attack, etc.). They keep existing content; light style pass only to match the new palette.
- Redesigning the Lobby. Separate effort.
- Mobile app (`apps/mobile`) redesign. Separate effort.
- Offering a "classic UI" toggle. The new design replaces the old one.

## Design Direction (locked)

- **Background composition (per scene):**

  - Base: radial gradient from variant primary/accent into near-black (e.g. cyberpunk: `#2a0a4a → #0f0518 → #000`).
  - Perspective **grid floor**: two superposed 1px line gradients at 48×48 tiles, `transform: perspective(600px) rotateX(62deg) translateY(180px) scale(2)`, `mask-image` fading to transparent near horizon.
  - **Horizon line**: 2px horizontal gradient (variant-primary → variant-accent), blurred 1px, heavy `box-shadow` for bloom.
  - **Volumetric backlight**: 600×300 radial-gradient ellipse, top-centered, blurred 20px.
  - **Scanlines**: 3px-repeat horizontal lines at 3% opacity, pointer-events none.
  - **Particles**: 5–8 fixed-position absolute dots (2–5px) with `box-shadow` glow in variant hues. Static in first release; optional animated drift later.
  - **Bottom vignette**: 140px tall linear-gradient for depth falloff.

- **HUD (top bar):**

  - 12/16px padding, `backdrop-filter: blur(12px)`, bottom border in variant primary at 0.3 alpha.
  - Left: gradient logo chip (variant primary → accent), title "CRITICAL · {VARIANT}" with the variant name glowing in primary.
  - Right: round chip (gold-tinted), rules icon, fullscreen icon.
  - Height ~50px desktop, ~42px mobile.

- **Turn banner:**

  - Pill, centered below HUD, gradient 1px border (primary → accent) using the `::before` + `mask-composite` technique.
  - Pulsing dot (variant accent) + "YOUR MOVE" / "{NAME}'S TURN" label in uppercase 3px-tracking + separator + tabular-nums timer in gold.
  - `box-shadow: 0 0 24px primary, 0 0 48px accent` at low alpha.
  - Height ~36px; never wraps.

- **Opponents (desktop: ring; mobile: chip row):**

  - Desktop: centered horizontal row of avatar+name+meta blocks, gap 40px.
  - Avatar 58px normal, 68px on turn; 2px border, variant-primary box-shadow.
  - Turn state: external magenta ring (2px solid + 24px box-shadow + inset glow) + outer radial halo (blurred).
  - Eliminated: opacity 0.35, `filter: grayscale(0.6)`, dashed red ring, "ELIMINATED" / "OUT" label.
  - Meta: card-count badge (variant-tinted), mark/effect badges (gold for marks).
  - Mobile: 96px-wide chips in horizontal scroll row; avatar 34px; name + one-line meta.

- **Center zone:**

  - Three stacks: **Deck** (with count) · **Last played** (oversized 92×126 with gold halo) · **Discard** (with count).
  - Deck: 74×102 px, deep variant gradient, 3-layer offset shadow stack (via `::before`/`::after`) to suggest depth.
  - Last played: 92×126 px, full-variant gradient front, 2px gold border, triple-shadow (primary glow + accent glow + inset highlight), radial gold halo behind.
  - Discard: 74×102 px, teal/accent-tinted, count number large with text-shadow.
  - Stack labels: 9px uppercase, 3px tracking, ◦ dots.

- **Log strip:**

  - Single-line pill floating just above hand area (desktop) or between center and you-strip (mobile).
  - `backdrop-filter: blur(8px)`, variant-tinted border at 0.35 alpha.
  - Inline color-coded player names + card names.

- **You + actions (desktop):**

  - Left: gold avatar + "YOU" label + meta ("5 cards · 1 mark").
  - Right: ghost NOPE button + primary DRAW button (gold gradient, heavy box-shadow).

- **You strip (mobile):**

  - Full-width glass bar with you-avatar + meta on the left, NOPE button on the right.
  - Sits above the hand strip so NOPE stays thumb-reachable on an opponent's turn.

- **Hand (desktop):**

  - Fanned horizontal row; 82×114 px cards, rotated ±7/14°, vertically offset to create arc.
  - Hero card (hovered or selected) lifts -26px, scales to 94×130 px, gets 2px gold border and triple-stack shadow.
  - Card gradients keyed to type: blue=insight, green=defuse, magenta=attack-family, red=skip, orange=favor.
  - Corner tags: top-left type name (9–10px, weight 900), center art (emoji-scale icon, to be replaced with existing card art assets in variants that have them), bottom-right count badge.

- **Hand (mobile):**

  - Flat horizontal strip, 62×88 px cards, gap 8px, horizontal scroll when >6 cards.
  - Hero card (selected): lifts -14px, keeps gold border + glow.
  - Non-selected cards dim to 0.35 opacity + desaturate when in target-selection state.

- **Mobile action sheet:**

  - Slides up from bottom (above hand) when a card needing a target is selected.
  - Glass panel with 1px gold-tinted border, 16px radius.
  - Title "◦ SELECT TARGET ◦" in gold, description line ("Play Attack on which player?"), target buttons (one per live opponent, current-turn target gets magenta highlight), Cancel + Play buttons at the bottom (ghost + primary).

- **Motion:**
  - Turn dot: 1.5s ease-in-out pulse (scale 0.7 ↔ 1, opacity 0.5 ↔ 1).
  - Ambient glow / horizon shimmer: keep existing `ambientGlow 12s` and `shimmer 6s` keyframes from `styles/variants/base.ts`.
  - Card hover/select on desktop: 150ms transform + shadow transition.
  - No new heavy particle animation in first release — particles are static.

## Variant System

The redesign makes every variant a **cohesive scene palette**, not just a background tint. Each variant exports a `scene` object adjacent to the existing `layout`, `header`, etc. configs in `styles/variants/<variant>.ts`, consumed by `getVariantStyles`:

```ts
interface VariantScenePalette {
  // Background scene
  sceneBgGradient: string; // radial-gradient string for scene root
  gridLineColorA: string; // rgba
  gridLineColorB: string; // rgba
  horizonGradient: string; // horizontal gradient stops
  backlightColor: string; // rgba for volumetric backlight
  vignetteColor: string; // rgba for bottom vignette
  particleColors: string[]; // 3-4 colors for particle hues

  // Turn banner
  turnBannerBorderGradient: string; // 90deg gradient of primary→accent
  turnBannerDotColor: string; // accent
  turnBannerShadow: string; // layered primary/accent box-shadow

  // Player (opponents + you)
  opponentTurnRingColor: string; // primary
  opponentTurnHaloColor: string; // rgba radial
  youAvatarGradient: string; // gold default; can be swapped per variant

  // Table cards
  deckGradient: string;
  deckGlow: string; // box-shadow
  discardGradient: string;
  discardGlow: string;
  lastPlayedGradient: string; // primary→accent→accent2 sweep
  lastPlayedHaloColor: string; // radial background for ::before

  // Hand card gradients by role
  handColorByRole: {
    attack: string; // magenta/red family
    defuse: string; // green
    skip: string; // red
    nope: string; // grey
    favor: string; // orange
    see: string; // blue
    combo: string; // purple
    special: string; // variant primary (fallback for unknown roles)
    [k: string]: string;
  };
}
```

The authoritative enumeration of card roles is `apps/web/src/widgets/CriticalGame/lib/cardUtils.ts` (role helpers) and the engine `CriticalCard` union in `apps/web/src/widgets/CriticalGame/types`. The plan step that wires role-to-gradient must derive keys from those sources; any role without an explicit mapping must fall back to `handColorByRole.special`.

Each of the 6 existing variants (`cyberpunk`, `underwater`, `crime`, `horror`, `adventure`, `high-altitude-hike`) will get a `scene` export. Unspecified variants fall back to `base.ts` which ships a reasonable default (purple/cyan cyberpunk-ish as in the mockup).

## Component architecture

### Files to change

- `apps/web/src/widgets/CriticalGame/ui/ActiveGameView.tsx` — unchanged **props/logic**; wraps child sections in a new `SceneShell` and passes down the resolved `scenePalette`.
- `apps/web/src/widgets/CriticalGame/ui/CriticalGameHeader.tsx` — restyle via the updated styled components; no prop changes.
- `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx` — unchanged structure; layout of children reflows into the new positioned zones.
- `apps/web/src/widgets/CriticalGame/ui/GameTableSection.tsx` + `CenterTableSection.tsx` + `DeckDisplay.tsx` + `TablePlayer.tsx` + `TableStats.tsx` — restyle; minor markup adjustments to support the new center-stack layout.
- `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` + `ActionsSection.tsx` + `LastPlayedCardDisplay.tsx` — restyle + reflow.
- `apps/web/src/widgets/CriticalGame/ui/GameStatusMessage.tsx` + `ChatBubble.tsx` — restyle to sit inside the new scene language (log pill style for status).
- `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — becomes the scene shell (grid floor, horizon, backlight, scanlines, vignette, particle layer).
- `apps/web/src/widgets/CriticalGame/ui/styles/header.tsx` — new HUD look (logo chip, turn pill).
- `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx` + `table-widgets.tsx` + `table-decorations.tsx` + `table-info.tsx` + `cards.tsx` + `cards-base.tsx` + `card-decorations.tsx` + `card-image.tsx` + `players-hand.tsx` + `players.tsx` + `player-widgets.tsx` — restyled to the new system.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/<variant>.ts` — add `scene` palette export.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/base.ts` — add default `scene` palette; extend `VariantStyleConfig` with `scene`.
- `apps/web/src/widgets/CriticalGame/ui/styles/variants/types.ts` — add `VariantScenePalette` type.

### New files

- `apps/web/src/widgets/CriticalGame/ui/styles/scene.tsx` — `SceneShell`, `SceneGridFloor`, `SceneHorizon`, `SceneBacklight`, `SceneScanlines`, `SceneVignette`, `SceneParticles` styled components (Tamagui). Accepts the resolved `VariantScenePalette`.
- `apps/web/src/widgets/CriticalGame/ui/SceneBackdrop.tsx` — lightweight component that composes the six backdrop layers above, given a palette. Mounted inside `GameContainer` just under the HUD.
- `apps/web/src/widgets/CriticalGame/ui/TurnBanner.tsx` — the gradient-border pulsing pill (replaces the current `TurnStatusPill` for the in-game active view; lobby still uses the old one).
- `apps/web/src/widgets/CriticalGame/ui/MobileActionSheet.tsx` — bottom-sheet target picker for mobile, shown when a card needing a target is tapped. Reuses existing handlers from `useCriticalModals`/`useGameHandlers` behind a mobile-only render gate.

### Removed/deprecated

- `ParticleOverlay.tsx` — superseded by `SceneParticles` inside `SceneShell`. Delete after migration.
- Style exports in `table-decorations.tsx` / `table-info.tsx` / `player-widgets.tsx` that are no longer referenced after the restyle. Identified during implementation, not committed to in advance.

## Data flow

No changes to:

- Zustand stores (`criticalGameStore`, `gameStore`).
- Socket gateway events.
- `useCriticalState`, `useRematch`, `useGameActions`, `useCriticalModals`, `useGameHandlers`, `useGameAutoplayIntegration`, `useTurnStatus` hooks — all still own their current responsibilities.
- Server-side engine, DTOs, or validation.

The only new data wiring:

- `CriticalGame.tsx` resolves `cardVariant` from `room.gameOptions.cardVariant` (already does) and passes it into `ActiveGameView`.
- `ActiveGameView.tsx` calls `getVariantStyles(cardVariant).scene` once with `useMemo` and passes the resulting `VariantScenePalette` to `SceneBackdrop`, `TurnBanner`, `GameTableSection` (which fans it to `DeckDisplay`, `LastPlayedCardDisplay`, `TablePlayer`), and `PlayerHand` (which fans it to card-role coloring).
- Alternatively (cleaner): a React context `<ScenePaletteProvider palette={palette}>` around `ActiveGameView` children, read via `useScenePalette()` where needed. **Chosen approach: context**, since 6+ descendants need the palette and prop-drilling would be noisy.

## Responsive behavior

Breakpoints (match existing Tamagui `$sm` at ≤660px):

| Element         | Desktop (>660px)              | Mobile (≤660px)                                        |
| --------------- | ----------------------------- | ------------------------------------------------------ |
| HUD padding     | 12/20                         | 10/16                                                  |
| HUD title       | full                          | shortened ("R7" instead of "ROUND 7"; one icon button) |
| Turn banner     | full pill                     | same pill, smaller paddings, never wraps               |
| Opponents       | centered row, 40px gap        | horizontal scroll chip row, 10px gap                   |
| Opponent avatar | 58/68px                       | 34px                                                   |
| Center stacks   | 74/92/74px, 32px gap          | 58/72/58px, 14px gap                                   |
| Log pill        | bottom-center above hand      | between center and you-strip                           |
| You + actions   | split left/right blocks       | single you-strip, NOPE inside it                       |
| Hand            | fanned, 82×114, ±14° rotation | flat strip, 62×88, no rotation                         |
| Action sheet    | N/A (uses existing modals)    | bottom sheet (new `MobileActionSheet`)                 |

Decision rule for the mobile action sheet: if the viewport matches the mobile breakpoint AND the selected card needs a target (`attack-family`, `favor`, etc.), render `MobileActionSheet` instead of the existing targeted-attack modal. On desktop the existing modals (`TargetedAttackModal`, `FavorModal`, etc.) continue to be used unchanged.

Breakpoint alignment: the runtime query must use the exact same threshold as Tamagui `$sm` — `(max-width: 660px)`. Because other responsive style branches in `ActiveGameView` already consume Tamagui's media hook, the mobile action sheet must use the same mechanism rather than a bespoke `window.matchMedia` listener; the plan will use Tamagui's `useMedia()` (or equivalent `$sm` style prop) so that orientation changes, device rotation, and window resizes are handled uniformly. If `useMedia()` is unavailable in the target Tamagui version, the fallback is a `window.matchMedia('(max-width: 660px)')` wrapped in a `useSyncExternalStore` subscription so that resize is reactive — never a one-shot `.matches` check at render time. A user rotating mid-turn must see the UI switch cleanly between desktop modals and the mobile sheet without losing the selected card.

## Accessibility

- All interactive elements keep their existing `data-testid` attributes so e2e tests (`critical-*.spec.ts`) continue to pass.
- Color contrast: gold text on dark backgrounds ≥ 4.5:1; player names and card tags use white at ≥ 90% opacity on colored gradients (verified 4.5:1+ in each variant gradient midpoint).
- Turn banner does not rely on color alone — includes a text label ("YOUR MOVE" vs "{NAME}'S TURN") and a semantically distinct pulse animation.
- Eliminated state does not rely on color alone — adds dashed border + "ELIMINATED"/"OUT" text label.
- `prefers-reduced-motion`: disable pulsing dot, horizon shimmer, and ambient glow keyframes. Scene remains static but fully styled.
- All buttons retain focus rings (use Tamagui `focusStyle`).

## Error / edge states

| State                           | Behavior                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| No `cardVariant` set            | Fall back to `base.ts` scene palette.                                                                    |
| Server wake-up / loading        | Existing `ServerLoadingNotice` continues to render in HUD slot; scene backdrop still renders underneath. |
| `actionBusy` (in-flight action) | Hero card stays lifted; Draw button shows existing spinner state; scene is otherwise unchanged.          |
| Idle timer triggered            | Existing `IdleTimerDisplay` + `AutoplayControls` render in HUD-right area as today.                      |
| Game over                       | Scene stays visible; `GameResultModal` overlays on top (unchanged). Hand hides (existing behavior).      |
| Opponent count 1                | Center the single opponent chip/ring. Scene composition is unchanged.                                    |
| Opponent count 7+               | Opponents row scrolls horizontally on desktop too (already supported by mobile style — re-applied).      |
| Hand > 8 cards                  | Fan tightens (negative margins compress) on desktop; mobile scrolls.                                     |

## Performance

- All backdrop layers are pure CSS (no canvas, no SVG animation). GPU-accelerated via `transform`, `filter`, `backdrop-filter`.
- Particles are static `<div>`s (5–8 per scene). No animation loop.
- `backdrop-filter: blur()` on HUD, turn banner, log pill, mobile action sheet — Chrome/Safari/Firefox ≥ 103 all support it; fallback is a solid-color background (existing behavior).
- `mask-image` for grid floor fade — Chrome/Safari/Firefox all current. Fallback: the grid simply extends to the scene edge (acceptable).
- `mask-composite: exclude` for gradient-border ring on turn banner — supported widely; fallback is a solid primary-colored border (acceptable).
- No new runtime dependencies, no new images, no font changes.

## Testing

### Unit (Vitest, apps/web)

- `SceneBackdrop` — renders all 6 layers with palette values propagated (grid colors, horizon gradient, particle colors).
- `TurnBanner` — renders "YOUR MOVE" when `isMyTurn`, "{NAME}'S TURN" otherwise; timer formatted as `m:ss`; respects `prefers-reduced-motion`.
- `MobileActionSheet` — renders when `isOpen && needsTarget`; lists live opponents only; fires `onConfirm` with the chosen target; fires `onCancel` on Cancel; does not render on desktop breakpoint.
- `scene` palette resolution — `getVariantStyles('cyberpunk').scene` returns the cyberpunk palette; `getVariantStyles(undefined).scene` returns the base palette.

### e2e (Playwright)

- Extend existing `apps/web/e2e/critical-*.spec.ts` files; no new tests required for correctness (all actions still dispatch the same way). Add visual-regression-friendly selectors for:
  - `data-testid="scene-backdrop"` on `SceneBackdrop`
  - `data-testid="turn-banner"` on `TurnBanner`
  - `data-testid="mobile-action-sheet"` on `MobileActionSheet`
- Run existing suites (`critical-card-visibility`, `critical-mobile-table`, `critical-single-player`, `critical-variants`, `game-lobby`, `game-rules`) unchanged — they must pass.

### Manual

- Verify at widths 375, 600, 900, 1280, 1920.
- Verify each of 6 variants renders with its own palette.
- Verify `prefers-reduced-motion` disables pulse/shimmer.
- Verify fullscreen toggle still works and looks correct.
- Verify Game-over modal still appears on top.

## Risks & open questions

- **File size budget.** `CLAUDE.md` enforces 500 lines per file. Several existing files are close to that limit. The new `scene.tsx` will be ~150 lines; the scene palette types will be ~50; individual variant scenes ~80 each. Split proactively if any file crosses.
- **Existing e2e tests** may rely on specific DOM structure of deck/discard/hand markers. Implementation must preserve existing `data-testid` values; audit during the first step.
- **Variant art assets.** The hero card uses emoji icons as placeholders in the mockup. The production view must continue to use existing `assets/card-art/<variant>_<card>.png` sprites via the current `CardImage` component; the new gradient backgrounds sit behind those assets, not instead of them.
- **`role` → gradient mapping** per card type must be derived from existing `cardUtils.ts`/`CARD_VARIANTS` constants, not hardcoded. Card roles like `attack`, `favor`, `skip`, `see`, `defuse`, `nope`, `combo`, `special` are already enumerated in the engine types.
- **Mobile action sheet vs existing modals.** We are **adding** a mobile-only surface, not removing the desktop modals. The sheet must cover the same submit paths so game logic stays one-to-one with modal equivalents.

## Success criteria

1. Turn state is legible in under 200ms on a cold tab load.
2. All 6 variants render with their own distinct palette applied to scene, cards, and HUD.
3. All existing Playwright e2e suites for Critical pass unchanged.
4. New unit tests for `SceneBackdrop`, `TurnBanner`, `MobileActionSheet`, and palette resolution pass.
5. No file exceeds 500 lines (`pnpm check-file-length` passes).
6. `pnpm lint` and `pnpm build` succeed in `apps/web`.
7. Visual sign-off against the two mockup files in `.superpowers/brainstorm/77708-1776607395/neon-hero-v2.html` and `mobile-hero.html`.
