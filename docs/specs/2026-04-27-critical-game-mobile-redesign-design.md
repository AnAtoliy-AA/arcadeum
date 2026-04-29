# Critical Game — Mobile Layout Redesign (`$sm`)

- **Date:** 2026-04-27
- **Branch / ticket:** ARC-480 follow-up (no ticket assigned yet)
- **Scope:** `apps/web/src/widgets/CriticalGame` — `$sm` Tamagui breakpoint only.
- **Out of scope:** desktop / tablet layout, lobby, chat panel, fullscreen, rematch, backend, other games.

## Why

On a 390×844 mobile viewport, an active 6-player Critical match renders at:

- Page chrome above the widget: ~285px (site nav + spectator/player toolbar + widget header + turn banner).
- Game widget `scrollHeight` measured: **1495px** in a **634px** clientHeight (2.4× viewport).
- The 2-column opponent grid alone occupies ~420px (3 rows of ~140px tiles for 6 players).
- The 220×220 center "table circle" occupies another ~280px showing one card.
- Hand zone is below all of the above; the user must scroll past every other element to reach it, then scroll back up to see the deck/discard. There is no overlap, but the constant context-switch is the symptom users describe as "overlap".

User asks (verbatim):

1. Nothing should overlap.
2. Better to see all cards in main layout.
3. Maybe make players icons less size.
4. It should be user friendly.

## Goals

1. The full game widget fits in **≤ 560px** of vertical space on `$sm`, so on a typical phone (844px viewport, 285px chrome) the entire game is visible without inner scroll.
2. Deck, last-played, and discard are simultaneously visible.
3. Hand cards are large enough to read (image + name).
4. Opponent footprint shrinks roughly in half (avatar diameter ~32px vs. current 58px wrapper / 48px inner).
5. Primary actions (Draw / Pass / Nope) are always reachable at viewport bottom via a sticky bar.
6. No regression on desktop, tablet, or any breakpoint above `$sm`.

## Non-goals

- Drag-and-drop hand re-ordering, new animations beyond what `prefers-reduced-motion` already gates, hand sorting modes.
- Reworking the lobby, fullscreen mode, chat panel, modals (`MobileActionSheet`, `GameModals`, `GameResultModal`).
- Reworking SceneBackdrop, ScenePaletteContext, or any variant palette.
- Backend or state-shape changes.

## Architecture

The five-zone vertical layout, top to bottom inside `GameContainer`:

```
┌──────────────────────────────────────┐  GameContainer ($sm: overflowY auto)
│ CriticalGameHeader   (~44px)         │  unchanged
│ TurnBanner           (~36px)         │  unchanged
├──────────────────────────────────────┤
│ OpponentStrip        (~80px)         │  NEW; horizontal scrollable chip row
├──────────────────────────────────────┤
│ CenterTableRow       (~150px)        │  NEW; Deck | Last Played | Discard
├──────────────────────────────────────┤
│ HandStrip            (~190px)        │  REWORKED CardsGrid; horizontal scroll
├──────────────────────────────────────┤
│ ActionBar (sticky)   (~64px)         │  NEW; primary actions only
└──────────────────────────────────────┘
```

Each zone has a fixed-or-bounded height, eliminating overflow stacking. Breakpoints above `$sm` retain the existing layout unchanged.

## Component changes

### A. OpponentStrip (replaces `PlayersRing` 2-column grid on `$sm`)

- **File:** `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx`.
- New styled component `OpponentStrip` (XStack):
  - On `$sm`: `flexDirection: row`, `overflowX: auto`, `gap: $2`, `paddingHorizontal: $3`, `height: 80`, `scroll-snap-type: x mandatory`, hide scrollbars (reuse `scrollbarStyles`).
- The existing `PlayersRing` and `PlayerPositionWrapper` keep their non-`$sm` variants. On `$sm`, `PlayerPositionWrapper` collapses to `position: relative; width: auto` (scroll-snap child).
- `GameTableSection.tsx`: branch on `useMedia().sm`; on mobile render `<OpponentStrip>` containing one chip per opponent (skip `viewer`'s own chip — viewer's stats are in `ActionBar` / hand zone).

### B. TablePlayer chip mode (`$sm`)

- **File:** `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx`.
- Mobile branch:
  - Outer wrapper **32px**, inner avatar **28px** (was 58 / 48).
  - Turn ring + halo: scale to fit; existing color tokens reused.
  - `PlayerName` shrinks to fontSize 11, single line, ellipsized at ~8 chars; sits below avatar.
  - `PlayerCardCount` becomes a 14×14 overlay badge anchored bottom-right of avatar (count text 9px). Stash / marked indicators become small dots top-right.
  - `ChatBubble` and `SeaBattlePopup` continue to render but anchor to the chip's avatar bbox.
  - `IdleBadge` rendered at reduced size or as a top-right dot.
- Desktop branch unchanged.

### C. CenterTableRow (replaces `CenterTable` 220×220 circle on `$sm`)

- **File:** `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx`.
- New styled component `CenterTableRow` (XStack):
  - On `$sm`: `flexDirection: row`, `justifyContent: space-around`, `alignItems: center`, `gap: $3`, `height: 150`, `paddingHorizontal: $3`.
- Three slots, all reusing `CardSlot` (`$role`):
  - **Deck** — 80×112, count pill below: `Deck · {n}`.
  - **Last Played** — 96×128 (slightly larger to feature), card name below.
  - **Discard** — 80×112, count pill below: `Discard · {n}`.
- `pendingDraws` indicator becomes a small badge on the Deck slot top-right when `> 0`.
- **TableStats row deleted on `$sm`** (counts now live with the slots). Desktop still renders it.
- `CenterTableSection.tsx`: branch on `useMedia().sm`; on mobile render `<CenterTableRow>` instead of the circular layout. The white-bordered circle is the `PlayersRing` background — also dropped on `$sm`.

### D. HandStrip (`CardsGrid` rework on `$sm`)

- **File:** `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx`.
- `CardsGrid` `$sm` override: `flexDirection: row`, `flexWrap: nowrap`, `overflowX: auto`, `paddingVertical: $2`, `gap: $2`, `scroll-snap-type: x mandatory`.
- The `effectiveLayout` switch in `PlayerHand.tsx` is no longer needed on `$sm` (always linear); keep desktop logic intact.
- **HandCard `mobileFlat` size 62×88 → 88×120.** `cards.tsx`/`players-hand.tsx`.
- On `$sm`, render only the card image + name overlay. Remove inline name toggle output and inline description output. The `showNames` / `showDescriptions` state becomes desktop-only.
- `HandLayoutDropdown` hidden on `$sm`.
- The current "Hide Names" / "Hide Descriptions" toggle buttons hidden on `$sm`.
- `HandHeader` reduced to: `YOUR HAND ({n})` only on `$sm`.

### E. CardActionsPopover (new, mobile-only)

- **File:** new `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.tsx`.
- Component-local React state (no Zustand) — selected card index lives in `PlayerHand`.
- Anchored above the tapped hand card; below if within 100px of the top of the strip.
- Contents:
  - Card name (large), card description (full text, multi-line).
  - Action buttons relevant to current state, e.g.:
    - "Play" — for `PLAYABLE_ACTION_CARDS` and special cards (`insight`, `trade`, `cancel`).
    - "Play as combo (×N)" — for combo-eligible cards with `count >= 2`.
    - "Stash" — when stashing is currently legal.
    - Buttons reuse `ActionButton`.
  - "Close" button.
- Tap behavior:
  - Tap a hand card → set `selectedCardId`. The card visually raises (`y: -14` style already used in `mobileFlat.pressStyle`).
  - Tap the same card again, tap outside, or tap "Close" → `selectedCardId = null`.
  - Pressing an action button fires the existing handler (`onPlayActionCard`, `onOpenEventCombo`, `onPlayNope`, etc.) and clears `selectedCardId`.
- One popover open at a time. The popover replaces the current "tap card → immediately fire action / open modal" flow on mobile only. Desktop behavior unchanged.

### F. Sticky ActionBar (new, mobile-only)

- **File:** new styled component `ActionBar` in `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx`, rendered from `PlayerHand.tsx`.
- Mounted only when `isMyTurn && !isGameOver` (or when `canPlayNope` for off-turn Nope).
- Style: `position: sticky`, `bottom: 0`, `zIndex: 40`, `backgroundColor: rgba(15,17,22,0.85)` with `backdropFilter: blur(12px)`, `paddingVertical: $2`, `paddingHorizontal: $3`, `borderTopWidth: 1`, `borderTopColor: $glassBorder`.
- Contents (always-visible primary actions):
  - **Draw** — when `canAct && !pendingAction`.
  - **Pass** — placeholder for "end turn without drawing" if applicable; no new behavior, just surfacing the existing `endTurnWithoutDrawing` via `onPlayActionCard('pass'...)` if already wired. (If not wired, omit; do not add new gameplay.)
  - **Nope** — when `canPlayNope`, even off-turn (matches existing `InfoCard` Nope rendering).
- Card-specific actions (Play X, Stash X, Combo X, Insight, Cancel/Nope-style) move into the tap popover.
- The current `ActionsSection` panel is **deleted on `$sm`** (its actions move to the popover + bar). Desktop keeps `ActionsSection`.

### G. Container changes

- **File:** `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx`.
- `GameContainer` `$sm`: keep `overflowY: 'auto'` (already fixed in prior commit). Reduce `paddingTop: '$2' → 0` so the OpponentStrip can sit immediately below the TurnBanner; the strip handles its own padding.
- `GameBoard` `$sm`: `gap: $2` (down from `$4`) and zero margins; rely on per-zone padding.
- `HandSection` `$sm`: `borderTopWidth: 0`, `paddingTop: 0` — the visual separation comes from zone backgrounds, not borders.

### H. Copy fix

- The mobile screenshot shows "START GAME" rendered as the actions panel title mid-game. Root cause likely: missing translation key `games.table.actions.title` or `games.table.actions.label`, with the code falling back to a status string used during lobby ("Start game"). Action: rename or add the correct key in all five locales (`en`, `ru`, `es`, `fr`, `by`) and use it from `ActionsSection` on desktop. On `$sm` the section is removed entirely so the bug self-resolves there.

## Data flow

No new server state. New client state, all component-local in `PlayerHand`:

- `selectedCardId: CriticalCard | null` — drives `CardActionsPopover` open/anchor.

The popover dispatches into existing handlers from `useGameHandlers` (`handlePlayActionCard`, `handleOpenEventCombo`, `onPlayNope`, etc.). No store changes.

`useMedia().sm` is the only branch point and is already used throughout the widget.

## Error / edge cases

- **0 opponents** (game over before render): `OpponentStrip` renders empty container with min-height to keep layout stable.
- **7+ opponents**: horizontal scroll. Snap-points keep chips aligned. ARIA: container has `role="list"`, chips have `role="listitem"`.
- **Hand of 1 card**: `HandStrip` left-aligns; sticky ActionBar still renders.
- **Hand empty** (eliminated player): no `HandStrip`, no `ActionBar`. Desktop already handles this in `ActiveGameContent.tsx`; mobile follows.
- **Popover open + game state changes** (e.g., it becomes opponent's turn after they Nope you): `PlayerHand` clears `selectedCardId` in a `useEffect` watching `[isMyTurn, canAct, currentPlayer.hand]`.
- **Pending modal flows** (favor, defuse, target, alter-future, see-the-future, omniscience, stash, mark, smite, combo): unchanged. Modals continue to render at the `ActiveGameView` level. `MobileActionSheet` for target pickers is unaffected.
- **Reduced motion**: existing guard in `TurnBanner` and scene continues to apply. New components add no animations beyond Tamagui defaults.
- **Touch outside popover dismiss**: implement via a single document-level click handler, gated on `selectedCardId !== null`.

## Testing

### Unit (Vitest)

- `CardActionsPopover.test.tsx` (new):
  - Renders correct buttons for `insight`, `trade`, `cancel` (special cards).
  - Renders "Play as Combo (×2)" when `count >= 2 && allowActionCardCombos`.
  - Calls `onPlayActionCard(card)` with correct arg on Play.
  - "Close" clears the popover (no action fired).
- `TablePlayer.test.tsx` (existing): add cases for chip mode (mocked `useMedia().sm = true`) — assert avatar 32/28 sizes, name truncation, badge anchor.
- `MobileActionSheet.test.tsx` and `TurnBanner.test.tsx` continue to pass unchanged.

### Playwright e2e

- Extend `apps/web/e2e/critical-card-visibility.spec.ts` (closest existing fixture) or add a new `critical-mobile-layout.spec.ts`. At 390×844:
  - Game widget inner `scrollHeight ≤ clientHeight + 80` (no inner scroll).
  - All three center cards (Deck, Last Played, Discard) visible and have non-zero count text where applicable.
  - For 7-opponent game state: opponent strip is horizontally scrollable; chips snap.
  - Tap a hand card opens `CardActionsPopover`; tap outside closes it.
  - Sticky `ActionBar` stays at viewport bottom while inner content scrolls.
  - `data-testid="game-widget-container"` (existing) — preserve.
  - New testids: `opponent-strip`, `opponent-chip`, `center-table-row`, `hand-strip`, `card-actions-popover`, `action-bar`.

### Manual

- All 5 variants: cyberpunk, underwater, crime, horror, adventure, high-altitude-hike. Verify scene palette and turn ring still read correctly at the smaller chip size.
- iOS Safari + Android Chrome at 360, 390, 414 widths.
- Existing fullscreen toggle (desktop-only) untouched.

## File-level checklist

- `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — `$sm` paddings.
- `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx` — add `OpponentStrip`, `CenterTableRow`; gate circle visuals to non-`$sm`.
- `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx` — `CardsGrid` `$sm` linear strip + snap.
- `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx` — `HandCard.mobileFlat` 88×120; new `ActionBar` styled.
- `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.tsx` (new).
- `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx` (new).
- `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` — mobile branch: HandStrip + popover state + ActionBar.
- `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx` — mobile chip mode.
- `apps/web/src/widgets/CriticalGame/ui/GameTableSection.tsx` — mobile branch: OpponentStrip.
- `apps/web/src/widgets/CriticalGame/ui/CenterTableSection.tsx` — mobile branch: CenterTableRow.
- `apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx` — short-circuit render-null on `$sm`.
- `apps/web/src/i18n/locales/{en,ru,es,fr,by}/*.json` — fix `games.table.actions.*` keys; add popover labels.
- `apps/web/e2e/critical-mobile-layout.spec.ts` (new) — see Testing.

## Acceptance criteria

1. On 390×844, an active 6-player Critical game widget has `scrollHeight - clientHeight ≤ 80`. (Hard threshold replacing the current 1495 / 634 = 861px overflow.)
2. Deck, last-played card, and discard pile are all visible without scrolling.
3. Tapping a hand card surfaces a popover with action buttons; selecting an action fires the same handler the previous click flow used.
4. A 7-opponent game shows a horizontally scrollable opponent strip with snap.
5. Sticky ActionBar always reachable at the bottom of the visible widget area on the player's turn.
6. No visible regression on `$md`, `$tablet`, `$lg` breakpoints in any of the 6 variants.
7. All existing unit + e2e tests pass; new tests added pass.
8. ESLint, file-length, and i18n checks pass.

## Risks & mitigations

- **Risk:** popover anchoring fails on cards near the strip edges (clipping). **Mitigation:** anchor logic checks `getBoundingClientRect` and flips above/below; fallback is a centered modal-style overlay if no room either way.
- **Risk:** sticky ActionBar interferes with `MobileActionSheet` (which is itself a bottom sheet). **Mitigation:** when an action sheet is open (`targetedAttackModal || favorModal`), hide the ActionBar via the same flag.
- **Risk:** removing inline descriptions on `$sm` makes new players unable to learn cards. **Mitigation:** popover always shows the description; tap-to-reveal is one tap.
- **Risk:** "START GAME" copy fix touches all 5 locale files. **Mitigation:** keep changes mechanical; no semantic key reorganization.

## Migration / rollout

Single PR. Branch from `main` (since `ARC-480` already merged). New ticket suggested: `ARC-XXX` (TBD). No flag needed — purely visual, change is `$sm`-gated, easily revertable. The first commit is the spec + plan; subsequent commits implement zone by zone bottom-up (HandStrip + popover → ActionBar → CenterTableRow → OpponentStrip → cleanup), each with a passing test gate.
