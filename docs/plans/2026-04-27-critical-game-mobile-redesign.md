# Critical Game Mobile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the `$sm` (mobile) layout of the Critical game widget so the entire game (opponents, center pile, hand, primary actions) is visible without inner scrolling — replacing the current 1495×634 inner scroll situation with a five-zone vertical layout where each zone has a bounded height, hand cards are tappable to reveal action buttons, and primary actions live in a sticky bar.

**Architecture:** Five vertically-stacked zones inside `GameContainer` on `$sm`: `CriticalGameHeader` → `TurnBanner` (unchanged) → new `OpponentStrip` (replaces 2-col player grid) → new `CenterTableRow` (replaces 220×220 circle) → reworked `HandStrip` (`CardsGrid` linear) → new sticky `ActionBar`. Hand cards open a new `CardActionsPopover` on tap that surfaces card-specific buttons; the existing `ActionsSection` panel and inline name/description toggles are hidden on `$sm`. All changes are gated behind `useMedia().sm` or Tamagui `$sm` overrides; non-mobile breakpoints render the existing layout unchanged. Full spec at [docs/specs/2026-04-27-critical-game-mobile-redesign-design.md](../specs/2026-04-27-critical-game-mobile-redesign-design.md).

**Tech Stack:** Next.js (`apps/web`), React, Tamagui (styled), Zustand (untouched), Vitest + `@testing-library/react` (unit), Playwright (e2e), TypeScript strict. No new runtime dependencies.

---

## File Structure

### New files

- `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.tsx` — popover anchored to a tapped hand card; renders name + description + card-specific action buttons.
- `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx` — unit tests for popover render and dispatch.
- `apps/web/src/widgets/CriticalGame/ui/styles/mobile-action-bar.tsx` — sticky bottom action bar styled component (kept separate from `players-hand.tsx` to respect the 500-line limit).
- `apps/web/e2e/critical-mobile-layout.spec.ts` — Playwright spec asserting the acceptance criteria from the design doc.

### Modified files

- `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx` — `$sm` paddings reduced; gap reduced.
- `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx` — add `OpponentStrip` and `CenterTableRow`; gate `PlayersRing` background visuals to non-`$sm`.
- `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx` — `CardsGrid` `$sm` override switches to linear horizontal strip with snap.
- `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx` — `HandCard.mobileFlat` size 62×88 → 88×120.
- `apps/web/src/widgets/CriticalGame/ui/styles/index.ts` — re-export new pieces.
- `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` — mobile branch: hide name/description toggles, render `HandStrip` + popover state + `ActionBar`; remove inline name/description rendering on `$sm`.
- `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx` — chip mode on `$sm` (32/28 sizes, name truncated, count overlay badge).
- `apps/web/src/widgets/CriticalGame/ui/GameTableSection.tsx` — branch on `useMedia().sm`; render `<OpponentStrip>` instead of `<PlayersRing>` with viewer's own chip skipped.
- `apps/web/src/widgets/CriticalGame/ui/CenterTableSection.tsx` — branch on `useMedia().sm`; render `<CenterTableRow>` (Deck | Last Played | Discard with counts under each).
- `apps/web/src/widgets/CriticalGame/ui/ActiveGameContent.tsx` — pass-through for `useMedia().sm` if needed (likely only minor wiring).
- `apps/web/src/widgets/CriticalGame/ui/TableStats.tsx` — render-null on `$sm` (counts now live with the slots in `CenterTableRow`).
- `apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx` — render-null on `$sm` (actions move to popover + sticky bar).
- `apps/web/src/widgets/CriticalGame/ui/TablePlayer.test.tsx` — extend with `$sm` chip-mode assertions.
- `apps/web/src/shared/i18n/messages/games/critical/{en,ru,es,fr,by}.ts` — fix `actions.start` → use a correct "Actions" key; add popover labels (`mobile.popover.play`, `mobile.popover.combo`, `mobile.popover.stash`, `mobile.popover.close`); add `mobile.actionBar.draw`, `mobile.actionBar.nope`.

### Deleted files

- None.

### Out of scope (do not touch)

- `apps/web/src/widgets/CriticalGame/ui/styles/scene.tsx` and the entire scene/palette system.
- `MobileActionSheet.tsx`, `GameModals.tsx`, `GameResultModal`, `RulesModal`.
- All non-`$sm` breakpoints.
- `SeaBattleGame` and other widgets.
- Backend, sockets, engines.

---

## Conventions

- **Never use `any`** — popover prop and handler types come from existing `CriticalCard`, `CriticalPlayerState`, and `useGameHandlers` returns.
- **500-line per file limit** — `players-hand.tsx` is currently ~190 lines, `cards.tsx` ~195, `table.tsx` ~159; new additions stay well under. New `mobile-action-bar.tsx` keeps `ActionBar` isolated from `players-hand.tsx`.
- **i18n** — every new string has keys in all five locales: `en`, `ru`, `es`, `fr`, `by`. Reuse existing keys whenever possible. The "Actions" title fix uses an existing key — search `critical/en.ts` for the right one before adding new.
- **data-testid stability** — every existing `data-testid` on a Critical-widget styled component must be preserved. Before any markup edit (Task 4 onward), capture the baseline:

  ```bash
  grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/ > /tmp/critical-testids-before.txt
  grep -rn "data-testid" apps/web/e2e/critical-*.spec.ts > /tmp/critical-e2e-testids.txt
  ```

  After Task 9, diff to confirm no removals (only additions allowed):

  ```bash
  grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/ > /tmp/critical-testids-after.txt
  diff /tmp/critical-testids-before.txt /tmp/critical-testids-after.txt
  ```

- **Branch & commit scope** — current branch is `ARC-485`. Every commit subject ends with `(ARC-485)` per commitlint footer convention. If a new ticket is created mid-implementation, find-and-replace the scope and footer in subsequent commits.
- **Co-authored footer** — every commit includes:
  ```
  Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
  ```
- **Test runner commands** —
  - Web unit: `cd apps/web && pnpm test src/widgets/CriticalGame/ui/<file>.test.tsx`
  - Whole web suite: `cd apps/web && pnpm test`
  - Lint: `cd apps/web && pnpm lint <path>`
  - File-length: `pnpm check-file-length` (root)
  - i18n: `pnpm check-translations` (root, runs in pre-commit too)
  - e2e (single spec): `cd apps/web && pnpm exec playwright test e2e/critical-mobile-layout.spec.ts`

---

## Pre-flight

- [ ] **Step P1: Verify clean tree on ARC-485**

  ```bash
  git -C /Users/anatoliyaliaksandrau/js/arcadeum_claude status --short
  git -C /Users/anatoliyaliaksandrau/js/arcadeum_claude log --oneline -3
  ```

  Expected: clean tree (or only the untracked screenshot PNGs from earlier sessions); HEAD on `ARC-485` with the spec commit `8af33294 docs(ARC-485): add critical game mobile redesign spec`.

- [ ] **Step P2: Capture testid baseline**

  ```bash
  grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/ > /tmp/critical-testids-before.txt
  grep -rn "data-testid" apps/web/e2e/critical-*.spec.ts > /tmp/critical-e2e-testids.txt
  wc -l /tmp/critical-testids-before.txt /tmp/critical-e2e-testids.txt
  ```

  Expected: line counts > 0; commit nothing — these files are scratch.

- [ ] **Step P3: Confirm i18n key for "Actions"**

  ```bash
  grep -n "table.actions" apps/web/src/shared/i18n/messages/games/critical/en.ts | head -10
  grep -n "actions.start\|actions.title\|actions.label" apps/web/src/shared/i18n/messages/games/critical/en.ts
  ```

  Note the existing key path. The `ActionsSection` panel currently uses `t('games.table.actions.start')` for its title — that key resolves to "Start Game" / "START GAME" and is the reason the mobile screenshot shows the wrong copy. Decide between:

  1. Renaming the key (breaking change across locales, but cleaner).
  2. Adding a new key `games.table.actions.title` with the value "Actions" / "ACTIONS" and switching `ActionsSection` to it (additive, safer).

  Use option 2.

---

## Task 1: Add `actions.title` i18n key and switch `ActionsSection`

**Why:** Fixes the visible "START GAME" copy bug mid-game on desktop. This bug exists today and is the smallest user-visible improvement — landing it first proves the loop. Also keeps `ActionsSection` correct on desktop for after we hide it on mobile.

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/games/critical/en.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/critical/ru.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/critical/es.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/critical/fr.ts`
- Modify: `apps/web/src/shared/i18n/messages/games/critical/by.ts`
- Modify: `apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx`

- [ ] **Step 1.1: Read current `actions` block in `en.ts`** to determine exact nesting.

  ```bash
  grep -n "actions" apps/web/src/shared/i18n/messages/games/critical/en.ts | head -20
  ```

- [ ] **Step 1.2: Add `actions.title` key in all 5 locale files** alongside `actions.start`. Values:

  - `en`: `"ACTIONS"`
  - `ru`: `"ДЕЙСТВИЯ"`
  - `es`: `"ACCIONES"`
  - `fr`: `"ACTIONS"`
  - `by`: `"ДЗЕЯННІ"`

- [ ] **Step 1.3: Update `ActionsSection.tsx`** — replace the `t('games.table.actions.start')` title with `t('games.table.actions.title')`. Leave the rest untouched.

- [ ] **Step 1.4: Run i18n check**

  ```bash
  pnpm check-translations
  ```

  Expected: `✅ All translation keys are present!`

- [ ] **Step 1.5: Run lint on changed files**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/ActionsSection.tsx src/shared/i18n/messages/games/critical/
  ```

- [ ] **Step 1.6: Commit**

  ```bash
  git add apps/web/src/shared/i18n/messages/games/critical/ apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx
  git commit -m "$(cat <<'EOF'
  fix(ARC-485): use actions.title for in-game ActionsSection panel
  ```

The panel rendered "START GAME" mid-game because it reused the
lobby's actions.start key. Add a dedicated actions.title key in
all five locales and switch ActionsSection to it.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 2: Bump `HandCard.mobileFlat` size 62×88 → 88×120

**Why:** Improves card readability — the single biggest UX win for the smallest change. No functional impact.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx`

- [ ] **Step 2.1: Read the current `mobileFlat` block**

```bash
grep -n "mobileFlat" apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx
````

Confirm lines 171–181 contain `width: 62, height: 88`.

- [ ] **Step 2.2: Edit** — change `width: 62` to `width: 88`, `height: 88` to `height: 120`. Leave press style, aspectRatio override, etc. unchanged.

- [ ] **Step 2.3: Lint**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/styles/players-hand.tsx
  ```

- [ ] **Step 2.4: Run existing PlayerHand-relevant unit tests** (sanity)

  ```bash
  cd apps/web && pnpm test src/widgets/CriticalGame/ui/TablePlayer.test.tsx src/widgets/CriticalGame/ui/MobileActionSheet.test.tsx
  ```

  Expected: all pass.

- [ ] **Step 2.5: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): enlarge mobile hand cards to 88x120
  ```

Bumps HandCard mobileFlat size from 62x88 to 88x120 so card art
and name are readable on $sm without zooming. No structural
change to the hand layout — that comes in Task 3.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 3: Switch `CardsGrid` to linear horizontal strip on `$sm`

**Why:** With larger cards, the 2-column wrap looks cramped. A single horizontal scrollable row matches the new design and pairs cleanly with snap behavior.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx` (remove `effectiveLayout` mobile branch, force `linear` on `$sm`)

- [ ] **Step 3.1: Add `$sm` override to `CardsGrid`** in `cards.tsx`. Insert after the `variants` block at line ~125, OR as a top-level `$sm` (Tamagui supports both — top-level is simpler).

```tsx
$sm: {
  flexDirection: 'row',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  paddingVertical: '$2',
  gap: '$2',
  justifyContent: 'flex-start',
  scrollSnapType: 'x mandatory' as unknown as undefined,
},
````

Tamagui doesn't natively type `scrollSnapType`; cast as shown matches the project's `cardImage` and other escape patterns. Alternative: add to `scrollbarStyles` import or to a `style={{ scrollSnapType: ... }}` prop on the rendered element.

- [ ] **Step 3.2: Add `scroll-snap-align: start` to `HandCard`** so cards snap to the strip's left edge. In `players-hand.tsx`, append to the `mobileFlat` size block:

  ```tsx
  mobileFlat: {
    width: 88,
    height: 120,
    aspectRatio: undefined,
    scrollSnapAlign: 'start' as unknown as undefined,
    pressStyle: { ... unchanged ... },
  },
  ```

- [ ] **Step 3.3: Update `PlayerHand.tsx`** — replace the `effectiveLayout` calculation:

  ```tsx
  // Before:
  const effectiveLayout: HandLayoutMode =
    isMobile && handLayout === 'grid' && handCardCount > 6
      ? 'linear'
      : handLayout;

  // After:
  const effectiveLayout: HandLayoutMode = isMobile ? 'linear' : handLayout;
  ```

- [ ] **Step 3.4: Lint**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/styles/cards.tsx src/widgets/CriticalGame/ui/styles/players-hand.tsx src/widgets/CriticalGame/ui/PlayerHand.tsx
  ```

- [ ] **Step 3.5: Manual visual verification** — start dev server, open active game in 390×844 mobile viewport, confirm hand renders as horizontal strip with snap.

  ```bash
  cd apps/web && pnpm dev
  # In another terminal or via Playwright: open the active game URL at mobile viewport.
  ```

  This is informational only; no automated test yet (covered in Task 10).

- [ ] **Step 3.6: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/cards.tsx apps/web/src/widgets/CriticalGame/ui/styles/players-hand.tsx apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): switch hand to horizontal snap strip on $sm
  ```

CardsGrid renders as a single nowrap row with x-snap on $sm, and
HandCard mobileFlat snaps to start. PlayerHand always uses
'linear' layout on mobile (handLayout dropdown remains
desktop-only).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 4: New `CardActionsPopover` component (TDD)

**Why:** New tap-to-reveal interaction. Since this is a new component with discrete behaviors, TDD it.

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.tsx`
- Create: `apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/index.ts` (re-export if used externally — likely not).

The component is self-contained and stateless. It receives:

```ts
interface CardActionsPopoverProps {
card: CriticalCard;
count: number;
isMyTurn: boolean;
canAct: boolean;
allowActionCardCombos: boolean;
hasOpponents: boolean;
cardVariant?: string;
t: (key: string, params?: Record<string, string | number>) => string;
onPlay: () => void;
onPlayCombo: () => void;
onStash: () => void;
onClose: () => void;
}
````

It renders the card name (large), description, and a button list determined by:

- `insight`, `trade`, `cancel`: single "Play" button.
- Combo-eligible (count ≥ 2 and `allowActionCardCombos || COMBO_CARDS.includes(card)`) and `hasOpponents`: "Play as Combo (×N)" button.
- `PLAYABLE_ACTION_CARDS.includes(card)`: "Play" button.
- Always: "Close" button.

If `!isMyTurn || !canAct`: render only "Close" + read-only description.

- [ ] **Step 4.1: Write failing test for the special-card render** (`CardActionsPopover.test.tsx`)

  ```tsx
  import { describe, it, expect, vi } from 'vitest';
  import { render, screen } from '@testing-library/react';
  import { TamaguiProvider } from 'tamagui';
  import config from '../../../../packages/ui/src/tamagui.config';
  import { CardActionsPopover } from './CardActionsPopover';

  const noop = () => {};
  const t = (k: string) => k;

  function renderPopover(overrides = {}) {
    return render(
      <TamaguiProvider config={config}>
        <CardActionsPopover
          card="insight"
          count={1}
          isMyTurn
          canAct
          allowActionCardCombos={false}
          hasOpponents
          t={t}
          onPlay={noop}
          onPlayCombo={noop}
          onStash={noop}
          onClose={noop}
          {...overrides}
        />
      </TamaguiProvider>,
    );
  }

  describe('CardActionsPopover', () => {
    it('renders Play and Close buttons for insight (special card)', () => {
      renderPopover();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /close/i }),
      ).toBeInTheDocument();
    });
  });
  ```

  Verify the import path for the Tamagui config — it should match how other Critical-widget tests import (likely a shared test util). If the existing tests use a `renderWithTamagui` helper, prefer that:

  ```bash
  grep -rn "TamaguiProvider\|renderWithTamagui" apps/web/src/widgets/CriticalGame/ui/*.test.tsx | head -10
  ```

- [ ] **Step 4.2: Run test to verify it fails**

  ```bash
  cd apps/web && pnpm test src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx
  ```

  Expected: FAIL with "Cannot find module './CardActionsPopover'".

- [ ] **Step 4.3: Implement minimal `CardActionsPopover.tsx`** — just enough to make Step 4.1 pass.

  ```tsx
  import React from 'react';
  import { YStack, XStack, Text } from 'tamagui';
  import type { GameVariant } from '@arcadeum/ui';
  import {
    COMBO_CARDS,
    SPECIAL_CARDS,
    type CriticalCard,
    type CriticalComboCard,
  } from '../types';
  import { PLAYABLE_ACTION_CARDS } from '../lib/constants';
  import { ActionButton } from './styles/cards';

  export interface CardActionsPopoverProps {
    card: CriticalCard;
    count: number;
    isMyTurn: boolean;
    canAct: boolean;
    allowActionCardCombos: boolean;
    hasOpponents: boolean;
    cardVariant?: string;
    t: (key: string, params?: Record<string, string | number>) => string;
    onPlay: () => void;
    onPlayCombo: () => void;
    onStash: () => void;
    onClose: () => void;
  }

  export function CardActionsPopover({
    card,
    count,
    isMyTurn,
    canAct,
    allowActionCardCombos,
    hasOpponents,
    cardVariant,
    t,
    onPlay,
    onPlayCombo,
    onStash,
    onClose,
  }: CardActionsPopoverProps) {
    const variant = cardVariant as GameVariant | undefined;

    const isSpecial =
      card === 'insight' || card === 'trade' || card === 'cancel';
    const isComboCard = COMBO_CARDS.includes(card as CriticalComboCard);
    const isComboable = allowActionCardCombos
      ? !SPECIAL_CARDS.includes(card as (typeof SPECIAL_CARDS)[number])
      : isComboCard;
    const canCombo =
      isMyTurn && canAct && hasOpponents && isComboable && count >= 2;
    const canPlay =
      isMyTurn && canAct && (isSpecial || PLAYABLE_ACTION_CARDS.includes(card));

    return (
      <YStack
        data-testid="card-actions-popover"
        gap="$3"
        padding="$3"
        borderRadius={12}
        backgroundColor="rgba(15,17,22,0.95)"
        borderWidth={1}
        borderColor="$glassBorder"
        minWidth={260}
        zIndex={60}
      >
        <Text fontSize={16} fontWeight="700">
          {t(`games.table.cards.${card}` as never)}
        </Text>

        <XStack gap="$2" flexWrap="wrap">
          {canPlay && (
            <ActionButton
              variant={variant || 'primary'}
              onPress={onPlay}
              data-testid="card-actions-play"
            >
              {t('games.table.mobile.popover.play')}
            </ActionButton>
          )}
          {canCombo && (
            <ActionButton
              variant="secondary"
              onPress={onPlayCombo}
              data-testid="card-actions-combo"
            >
              {t('games.table.mobile.popover.combo', { count })}
            </ActionButton>
          )}
          <ActionButton
            variant="secondary"
            onPress={onClose}
            data-testid="card-actions-close"
          >
            {t('games.table.mobile.popover.close')}
          </ActionButton>
        </XStack>
      </YStack>
    );
  }
  ```

- [ ] **Step 4.4: Run test to verify it passes**

  ```bash
  cd apps/web && pnpm test src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx
  ```

  Expected: PASS.

- [ ] **Step 4.5: Add test — combo button appears for combo card with count ≥ 2**

  ```tsx
  it('renders Play as Combo when count >= 2 and combo eligible', () => {
    renderPopover({ card: 'attack', count: 2, allowActionCardCombos: true });
    expect(screen.getByRole('button', { name: /combo/i })).toBeInTheDocument();
  });
  ```

- [ ] **Step 4.6: Add test — buttons hidden when not playable**

  ```tsx
  it('hides Play and Combo buttons when canAct is false', () => {
    renderPopover({ canAct: false });
    expect(
      screen.queryByRole('button', { name: /^play$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
  ```

- [ ] **Step 4.7: Add test — onPlay is called when Play is pressed**

  ```tsx
  it('fires onPlay when Play button is pressed', async () => {
    const onPlay = vi.fn();
    renderPopover({ onPlay });
    screen.getByRole('button', { name: /^play$/i }).click();
    expect(onPlay).toHaveBeenCalledOnce();
  });
  ```

- [ ] **Step 4.8: Run all popover tests**

  ```bash
  cd apps/web && pnpm test src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx
  ```

  Expected: 4 passing.

- [ ] **Step 4.9: Add new i18n keys** — `games.table.mobile.popover.play`, `.combo` (with `{count}` interp), `.close`. All 5 locale files.

  ```text
  en: { popover: { play: 'Play', combo: 'Play as Combo (×{count})', close: 'Close' } }
  ru: { popover: { play: 'Сыграть', combo: 'Комбо (×{count})', close: 'Закрыть' } }
  es: { popover: { play: 'Jugar', combo: 'Combo (×{count})', close: 'Cerrar' } }
  fr: { popover: { play: 'Jouer', combo: 'Combo (×{count})', close: 'Fermer' } }
  by: { popover: { play: 'Згуляць', combo: 'Камба (×{count})', close: 'Зачыніць' } }
  ```

  These nest under `games.table.mobile.popover`. Use the existing `mobile` namespace if present; otherwise add it.

- [ ] **Step 4.10: Run i18n check**

  ```bash
  pnpm check-translations
  ```

- [ ] **Step 4.11: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.tsx apps/web/src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx apps/web/src/shared/i18n/messages/games/critical/
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): add CardActionsPopover for mobile hand interactions
  ```

New presentational popover anchored to a tapped hand card. Renders
play/combo/close buttons gated on turn state, hand count, and
combo eligibility. Wiring into PlayerHand follows in the next task.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 5: Wire `CardActionsPopover` into `PlayerHand` on `$sm`

**Why:** Activates the new tap-to-reveal flow and removes the inline name/description toggles per the spec.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx`

- [ ] **Step 5.1: Add `selectedCardId` state and click-outside dismissal** to `PlayerHand`. Insert after the existing `useState` block:

```tsx
const [selectedCardId, setSelectedCardId] = useState<CriticalCard | null>(null);

useEffect(() => {
  if (!selectedCardId) return;
  const onDocClick = (e: MouseEvent) => {
    const popover = document.querySelector('[data-testid="card-actions-popover"]');
    const target = e.target as Node;
    if (popover && !popover.contains(target)) {
      setSelectedCardId(null);
    }
  };
  document.addEventListener('click', onDocClick, { capture: true });
  return () => document.removeEventListener('click', onDocClick, { capture: true });
}, [selectedCardId]);

// Clear popover when game state invalidates current selection
useEffect(() => {
  if (selectedCardId && !currentPlayer.hand.includes(selectedCardId)) {
    setSelectedCardId(null);
  }
}, [selectedCardId, currentPlayer.hand]);
````

Add `useEffect` to imports.

- [ ] **Step 5.2: Update `handleCardClick` to be mobile-aware.** On mobile, just toggle the popover instead of immediately firing actions:

  ```tsx
  const handleCardClick = useCallback(
    (card: CriticalCard, count: number) => {
      if (!isMyTurn || isGameOver || !canAct) return;

      if (isMobile) {
        // Toggle popover; let user choose action via buttons.
        setSelectedCardId((prev) => (prev === card ? null : card));
        return;
      }

      // Desktop: existing flow (immediate fire)
      // ... unchanged code from current handleCardClick
    },
    [isMobile, isMyTurn, isGameOver, canAct /* ...rest of deps */],
  );
  ```

- [ ] **Step 5.3: Render the popover above the hand** — find the closing tag of `</CardsGrid>` and insert immediately after, gated on `isMobile && selectedCardId`:

  ```tsx
  {
    isMobile &&
      selectedCardId &&
      (() => {
        const item = groupedHand.find(({ card }) => card === selectedCardId);
        if (!item) return null;
        return (
          <CardActionsPopover
            card={item.card}
            count={item.count}
            isMyTurn={isMyTurn}
            canAct={canAct}
            allowActionCardCombos={allowActionCardCombos}
            hasOpponents={aliveOpponents.length > 0}
            cardVariant={cardVariant}
            t={t}
            onPlay={() => {
              // Reuse existing handlers
              if (item.card === 'insight') onPlaySeeTheFuture();
              else if (item.card === 'trade') onOpenFavorModal();
              else if (item.card === 'cancel') onPlayNope();
              else if (PLAYABLE_ACTION_CARDS.includes(item.card))
                onPlayActionCard(item.card);
              setSelectedCardId(null);
            }}
            onPlayCombo={() => {
              onOpenEventCombo(
                [item.card as CriticalComboCard],
                currentPlayer.hand,
              );
              setSelectedCardId(null);
            }}
            onStash={() => setSelectedCardId(null)} // placeholder; stash flow stays modal-driven
            onClose={() => setSelectedCardId(null)}
          />
        );
      })();
  }
  ```

- [ ] **Step 5.4: Hide the names/descriptions toggle buttons and HandLayoutDropdown on `$sm`.** Wrap the `HandControls` block with `{!isMobile && (...)}` (conservative — keeps the title visible).

- [ ] **Step 5.5: Skip rendering inline name/description on hand cards when `isMobile`.** In the `groupedHand.map`, gate `{showNames && ...}` and `{showDescriptions && ...}` blocks behind `{!isMobile && showNames && ...}`. Add a smaller always-visible name overlay on `$sm` if not already present (the `CardName` may already render inside `CardImage`; verify).

- [ ] **Step 5.6: Lint**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/PlayerHand.tsx
  ```

- [ ] **Step 5.7: Run unit tests**

  ```bash
  cd apps/web && pnpm test src/widgets/CriticalGame/ui/CardActionsPopover.test.tsx
  cd apps/web && pnpm test
  ```

  Expected: all 280+ existing tests still pass; popover tests pass.

- [ ] **Step 5.8: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): wire CardActionsPopover into PlayerHand on $sm
  ```

On mobile, tapping a hand card opens the popover instead of
firing the action immediately. Tap-outside or Close dismisses it.
HandControls (Hide Names / Hide Descriptions / layout dropdown)
hidden on $sm.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 6: Sticky `ActionBar` + hide `ActionsSection` on `$sm`

**Why:** Primary actions (Draw / Nope) always reachable at the bottom of the widget, no scrolling required.

**Files:**
- Create: `apps/web/src/widgets/CriticalGame/ui/styles/mobile-action-bar.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx`
- Modify: `apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx`

- [ ] **Step 6.1: Create `mobile-action-bar.tsx`**

```tsx
import { styled, XStack } from 'tamagui';

export const ActionBar = styled(XStack, {
  name: 'CriticalActionBar',
  position: 'sticky',
  bottom: 0,
  zIndex: 40,
  paddingVertical: '$2',
  paddingHorizontal: '$3',
  gap: '$2',
  backgroundColor: 'rgba(15,17,22,0.85)',
  backdropFilter: 'blur(12px)',
  borderTopWidth: 1,
  borderTopColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexShrink: 0,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});
````

- [ ] **Step 6.2: Re-export from `styles/index.ts`**

  ```ts
  export * from './mobile-action-bar';
  ```

- [ ] **Step 6.3: Render `ActionBar` from `PlayerHand` on `$sm`** — at the bottom of the `<HandSection>`, after `</HandContainer>`:

  ```tsx
  {
    isMobile && isMyTurn && !isGameOver && (
      <ActionBar data-testid="action-bar">
        <ActionButton
          variant="primary"
          onPress={onDraw}
          disabled={!canAct}
          data-testid="action-bar-draw"
        >
          {t('games.table.mobile.actionBar.draw')}
        </ActionButton>
        {canPlayNope && (
          <ActionButton
            variant="secondary"
            onPress={onPlayNope}
            data-testid="action-bar-nope"
          >
            {t('games.table.mobile.actionBar.nope')}
          </ActionButton>
        )}
      </ActionBar>
    );
  }

  {
    isMobile && !isMyTurn && !isGameOver && canPlayNope && (
      <ActionBar data-testid="action-bar">
        <ActionButton
          variant="secondary"
          onPress={onPlayNope}
          data-testid="action-bar-nope"
        >
          {t('games.table.mobile.actionBar.nope')}
        </ActionButton>
      </ActionBar>
    );
  }
  ```

  Add the import: `import { ActionBar } from './styles';`.

- [ ] **Step 6.4: Hide `ActionsSection` on `$sm`** — at the top of `ActionsSection` body:

  ```tsx
  import { useMedia } from 'tamagui';

  export function ActionsSection(props: ActionsSectionProps) {
    const media = useMedia();
    if (media.sm) return null;
    // ... existing return statement
  }
  ```

  Reason for `useMedia()` over Tamagui `$sm: { display: 'none' }`: cleaner unmount, also drops state hooks if any.

- [ ] **Step 6.5: Add i18n keys** for `games.table.mobile.actionBar.draw` and `.nope` in all 5 locales.

  ```text
  en: { actionBar: { draw: 'Draw', nope: 'Nope' } }
  ru: { actionBar: { draw: 'Взять', nope: 'Отмена' } }
  es: { actionBar: { draw: 'Robar', nope: 'No' } }
  fr: { actionBar: { draw: 'Piocher', nope: 'Non' } }
  by: { actionBar: { draw: 'Узяць', nope: 'Не' } }
  ```

- [ ] **Step 6.6: i18n + lint**

  ```bash
  pnpm check-translations
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/styles/mobile-action-bar.tsx src/widgets/CriticalGame/ui/PlayerHand.tsx src/widgets/CriticalGame/ui/ActionsSection.tsx
  ```

- [ ] **Step 6.7: Run all tests**

  ```bash
  cd apps/web && pnpm test
  ```

- [ ] **Step 6.8: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/mobile-action-bar.tsx apps/web/src/widgets/CriticalGame/ui/styles/index.ts apps/web/src/widgets/CriticalGame/ui/PlayerHand.tsx apps/web/src/widgets/CriticalGame/ui/ActionsSection.tsx apps/web/src/shared/i18n/messages/games/critical/
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): add sticky ActionBar; hide ActionsSection on $sm
  ```

Sticky bottom bar surfaces Draw and Nope on mobile. ActionsSection
panel hidden via useMedia().sm so its actions don't double-render.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 7: `CenterTableRow` (replace 220×220 circle on `$sm`)

**Why:** Three-card horizontal row makes Deck / Last Played / Discard simultaneously visible in ~150px instead of ~280px.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx` — add `CenterTableRow`; gate `CenterTable` circle to non-`$sm`.
- Modify: `apps/web/src/widgets/CriticalGame/ui/CenterTableSection.tsx` — branch on `useMedia().sm`.
- Modify: `apps/web/src/widgets/CriticalGame/ui/TableStats.tsx` — render-null on `$sm`.

- [ ] **Step 7.1: Add `CenterTableRow` styled component to `table.tsx`** (insert after `CenterTable`)

```tsx
export const CenterTableRow = styled(XStack, {
  name: 'CenterTableRow',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  gap: '$3',
  height: 150,
  paddingHorizontal: '$3',
  width: '100%',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});
````

- [ ] **Step 7.2: Gate `CenterTable` (the circle) and `PlayersRing` background on `$sm`** — set `display: 'none'` on `$sm` for the circle, and remove `borderRadius`/glow on `$sm` for `PlayersRing`. Verify by reading the existing `$sm` block in `PlayersRing` (lines 66–76 of `table.tsx`).

  Update `CenterTable`'s `$sm`:

  ```tsx
  $sm: {
    display: 'none' as const,
  },
  ```

- [ ] **Step 7.3: Read `CenterTableSection.tsx`** — figure out how it composes the deck/discard/last-played slots today. Note exact prop signatures.

- [ ] **Step 7.4: Update `CenterTableSection.tsx`** — at the top, add `useMedia` and branch on `media.sm`. On mobile, render:

  ```tsx
  if (media.sm) {
    return (
      <CenterTableRow data-testid="center-table-row">
        <YStack alignItems="center" gap="$1">
          <CardSlot $role="deck">
            <DeckDisplay deck={deck} cardVariant={cardVariant} t={t} />
            {/* pendingDraws badge if applicable */}
          </CardSlot>
          <Text fontSize={11} opacity={0.7}>
            {t('games.table.deck')} · {deck.length}
          </Text>
        </YStack>

        <YStack alignItems="center" gap="$1">
          <CardSlot $role="lastPlayed">
            <LastPlayedCardDisplay
              discardPile={discardPile}
              cardVariant={cardVariant}
              t={t}
            />
          </CardSlot>
          {discardPile.length > 0 && (
            <Text fontSize={11} opacity={0.7}>
              {t(
                `games.table.cards.${discardPile[discardPile.length - 1]}` as never,
              )}
            </Text>
          )}
        </YStack>

        <YStack alignItems="center" gap="$1">
          <CardSlot $role="deck">
            {/* Re-use deck visual or a simpler discard pile representation */}
          </CardSlot>
          <Text fontSize={11} opacity={0.7}>
            {t('games.table.discard')} · {discardPile.length}
          </Text>
        </YStack>
      </CenterTableRow>
    );
  }
  ```

  Verify exact translation keys in `critical/en.ts` (`games.table.deck`, `games.table.discard` may already exist).

- [ ] **Step 7.5: Render-null `TableStats` on `$sm`**. At the top:

  ```tsx
  import { useMedia } from 'tamagui';

  export function TableStats(props: TableStatsProps) {
    const media = useMedia();
    if (media.sm) return null;
    // existing return
  }
  ```

- [ ] **Step 7.6: Lint + tests**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/styles/table.tsx src/widgets/CriticalGame/ui/CenterTableSection.tsx src/widgets/CriticalGame/ui/TableStats.tsx
  cd apps/web && pnpm test
  ```

- [ ] **Step 7.7: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/table.tsx apps/web/src/widgets/CriticalGame/ui/CenterTableSection.tsx apps/web/src/widgets/CriticalGame/ui/TableStats.tsx
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): replace center circle with horizontal Deck/Last/Discard row on $sm
  ```

CenterTableRow renders Deck | Last Played | Discard side-by-side
with counts under each. The 220x220 circle and the redundant
TableStats row are hidden on mobile.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 8: `OpponentStrip` + `TablePlayer` chip mode on `$sm`

**Why:** Replaces the 2-col player grid (~420px for 6 players) with a horizontal scrollable chip strip (~80px for any count). Halves opponent footprint.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/table.tsx` — add `OpponentStrip`.
- Modify: `apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx` — chip mode on `$sm`.
- Modify: `apps/web/src/widgets/CriticalGame/ui/GameTableSection.tsx` — branch on `useMedia().sm`.
- Modify: `apps/web/src/widgets/CriticalGame/ui/TablePlayer.test.tsx` — add chip-mode assertions.

- [ ] **Step 8.1: Add `OpponentStrip` styled component to `table.tsx`**

```tsx
export const OpponentStrip = styled(XStack, {
  name: 'OpponentStrip',
  flexDirection: 'row',
  overflowX: 'auto',
  overflowY: 'hidden',
  gap: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  height: 80,
  width: '100%',
  flexShrink: 0,
  alignItems: 'center',

  ...scrollbarStyles, // reuse same hide-scrollbar treatment if it exists

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});
````

Import `scrollbarStyles` if used elsewhere; otherwise inline `'::-webkit-scrollbar': { display: 'none' }` style on the consumer.

- [ ] **Step 8.2: Add chip-mode rendering to `TablePlayer.tsx`** — when `isMobile`, replace the existing layout block with:

  ```tsx
  if (isMobile) {
    return (
      <YStack
        alignItems="center"
        gap={2}
        flexShrink={0}
        data-testid="opponent-chip"
      >
        <YStack
          width={32}
          height={32}
          borderRadius={16}
          alignItems="center"
          justifyContent="center"
          borderWidth={showTurnRing ? 2 : showEliminatedRing ? 1 : 0}
          borderColor={
            showTurnRing
              ? palette.players.getTurnRing()
              : showEliminatedRing
                ? ELIMINATED_RING_COLOR
                : 'transparent'
          }
          backgroundColor="rgba(255,255,255,0.05)"
        >
          <Text fontSize={11} fontWeight="700">
            {initials}
          </Text>
        </YStack>
        <Text fontSize={10} maxWidth={56} numberOfLines={1} opacity={0.85}>
          {displayName}
        </Text>
        <XStack
          position="absolute"
          right={-4}
          bottom={14}
          width={16}
          height={16}
          borderRadius={8}
          backgroundColor="rgba(0,0,0,0.7)"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.2)"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={9} fontWeight="700">
            {player.handCount ?? 0}
          </Text>
        </XStack>
      </YStack>
    );
  }
  ```

  Verify `player.handCount` is the right field — read `CriticalPlayerTableState` to confirm; current code uses `player.handCount` or similar.

- [ ] **Step 8.3: Update `GameTableSection.tsx`** — branch on `useMedia().sm`:

  ```tsx
  const media = useMedia();

  if (media.sm) {
    return (
      <OpponentStrip data-testid="opponent-strip">
        {playerOrder
          .filter((id) => id !== currentUserId)
          .map((playerId, index) => {
            const player = players.find((p) => p.playerId === playerId);
            if (!player) return null;
            return (
              <TablePlayer
                key={playerId}
                player={player}
                index={playerOrder.indexOf(playerId)}
                relativeIndex={index}
                totalPlayers={playerOrder.length - 1}
                currentTurnIndex={currentTurnIndex}
                currentUserId={currentUserId}
                logs={logs}
                resolveDisplayName={resolveDisplayName}
                cardVariant={cardVariant}
              />
            );
          })}
      </OpponentStrip>
    );
  }
  // existing desktop branch
  ```

- [ ] **Step 8.4: Add chip-mode test to `TablePlayer.test.tsx`**

  ```tsx
  it('renders chip mode at $sm with 32px avatar and overlay count badge', () => {
    // mock useMedia to return { sm: true }
    // render TablePlayer
    // assert opponent-chip testid present, name truncated to numberOfLines={1}
    // assert count badge visible
  });
  ```

  The test's `useMedia` mock approach is established in `MobileActionSheet.test.tsx`; copy that pattern.

- [ ] **Step 8.5: Lint + tests**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/styles/table.tsx src/widgets/CriticalGame/ui/TablePlayer.tsx src/widgets/CriticalGame/ui/GameTableSection.tsx
  cd apps/web && pnpm test
  ```

- [ ] **Step 8.6: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/table.tsx apps/web/src/widgets/CriticalGame/ui/TablePlayer.tsx apps/web/src/widgets/CriticalGame/ui/GameTableSection.tsx apps/web/src/widgets/CriticalGame/ui/TablePlayer.test.tsx
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): replace opponent grid with horizontal chip strip on $sm
  ```

OpponentStrip renders one chip per opponent (32x32 avatar, 10px
truncated name, 16px count badge overlay), horizontally scrollable.
Viewer's own chip is excluded; their stats live in the hand zone.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 9: Container padding cleanup on `$sm`

**Why:** Tighten paddings so the five zones butt cleanly with each other and the widget shrinks to within the target ~560px budget.

**Files:**
- Modify: `apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx`

- [ ] **Step 9.1: Reduce `GameContainer` `$sm` paddings**

```tsx
$sm: {
  paddingHorizontal: '$2',
  paddingTop: 0,
  paddingBottom: 0,
  borderRadius: 16,
  overflowX: 'hidden',
  overflowY: 'auto',
},
````

- [ ] **Step 9.2: Reduce `GameBoard` `$sm` gap**

  ```tsx
  // top-level (or inside variants if Tamagui supports both):
  $sm: {
    gap: '$2',
  },
  ```

- [ ] **Step 9.3: Drop `HandSection` border + paddingTop on `$sm`**

  ```tsx
  $sm: {
    borderTopWidth: 0,
    paddingTop: 0,
    gap: '$2',
  },
  ```

- [ ] **Step 9.4: Lint**

  ```bash
  cd apps/web && pnpm lint src/widgets/CriticalGame/ui/styles/layout.tsx
  ```

- [ ] **Step 9.5: Verify testid baseline preserved**

  ```bash
  grep -rn "data-testid" apps/web/src/widgets/CriticalGame/ui/ > /tmp/critical-testids-after.txt
  diff /tmp/critical-testids-before.txt /tmp/critical-testids-after.txt
  ```

  Expected: only additions (new testids: `opponent-strip`, `opponent-chip`, `center-table-row`, `card-actions-popover`, `card-actions-play`, `card-actions-combo`, `card-actions-close`, `action-bar`, `action-bar-draw`, `action-bar-nope`). No removals.

- [ ] **Step 9.6: Commit**

  ```bash
  git add apps/web/src/widgets/CriticalGame/ui/styles/layout.tsx
  git commit -m "$(cat <<'EOF'
  feat(ARC-485): tighten layout paddings on $sm
  ```

GameContainer paddingTop -> 0, GameBoard gap -> $2,
HandSection borderTop dropped on mobile so the five zones
read as a single continuous surface.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Task 10: Playwright e2e — mobile layout assertions

**Why:** Locks in the acceptance criteria from the design doc.

**Files:**
- Create: `apps/web/e2e/critical-mobile-layout.spec.ts`

- [ ] **Step 10.1: Find a starting fixture pattern.** Read the closest existing e2e for shape/login/seeding:

```bash
cat apps/web/e2e/critical-card-visibility.spec.ts
````

Reuse helpers (room creation, login) referenced there.

- [ ] **Step 10.2: Write `critical-mobile-layout.spec.ts`**

  ```ts
  import { test, expect } from '@playwright/test';
  // Reuse helpers consistent with critical-card-visibility.spec.ts.

  test.use({ viewport: { width: 390, height: 844 } });

  test.describe('Critical mobile layout', () => {
    test.beforeEach(async ({ page }) => {
      // Create / join an active 6-player Critical room.
      // Mirror the setup in critical-card-visibility.spec.ts.
    });

    test('game widget fits viewport without large inner scroll', async ({
      page,
    }) => {
      const overflow = await page.evaluate(() => {
        const el = document.querySelector('.is_GameContainer') as HTMLElement;
        return el.scrollHeight - el.clientHeight;
      });
      expect(overflow).toBeLessThanOrEqual(80);
    });

    test('deck, last played, and discard are simultaneously visible', async ({
      page,
    }) => {
      await expect(page.getByTestId('center-table-row')).toBeVisible();
      // Three CardSlots should be inside.
      const slots = page
        .getByTestId('center-table-row')
        .locator('[role="img"], img, .is_CardSlot');
      // Soft assertion — at least 3 child slots present.
      expect(await slots.count()).toBeGreaterThanOrEqual(3);
    });

    test('opponent strip is horizontally scrollable when 7+ opponents', async ({
      page,
    }) => {
      // Skip or seed a 7-player game in setup.
      const strip = page.getByTestId('opponent-strip');
      const overflowX = await strip.evaluate(
        (el) => el.scrollWidth - el.clientWidth,
      );
      expect(overflowX).toBeGreaterThan(0);
    });

    test('tap hand card opens popover; tap outside closes it', async ({
      page,
    }) => {
      const hand = page.getByTestId('hand-grid');
      const firstCard = hand.locator('[data-cardtype]').first();
      await firstCard.click();
      await expect(page.getByTestId('card-actions-popover')).toBeVisible();
      await page
        .getByTestId('game-widget-container')
        .click({ position: { x: 5, y: 5 } });
      await expect(page.getByTestId('card-actions-popover')).not.toBeVisible();
    });

    test('sticky ActionBar visible at viewport bottom on my turn', async ({
      page,
    }) => {
      const bar = page.getByTestId('action-bar');
      await expect(bar).toBeVisible();
      const box = await bar.boundingBox();
      expect(box).not.toBeNull();
      // Sticky to widget bottom — should be in lower half of viewport.
      expect(box!.y).toBeGreaterThan(400);
    });
  });
  ```

  Adjust `getByTestId` selectors to match existing conventions (`page.locator('[data-testid="..."]')` if `getByTestId` isn't configured).

- [ ] **Step 10.3: Run the new e2e spec only**

  ```bash
  cd apps/web && pnpm exec playwright test e2e/critical-mobile-layout.spec.ts --project=chromium
  ```

  Expected: all 5 cases pass.

- [ ] **Step 10.4: Run the full Critical e2e set** to ensure no regressions

  ```bash
  cd apps/web && pnpm exec playwright test e2e/critical-*.spec.ts --project=chromium
  ```

- [ ] **Step 10.5: Commit**

  ```bash
  git add apps/web/e2e/critical-mobile-layout.spec.ts
  git commit -m "$(cat <<'EOF'
  test(ARC-485): add Playwright spec for Critical mobile layout
  ```

Asserts $sm acceptance criteria: widget fits viewport with <=80px
overflow, all three center cards visible, opponent strip
horizontally scrollable for 7+ players, tap-to-popover dismiss,
sticky ActionBar position.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

````

---

## Final verification

- [ ] **Step F1: Whole suite passes**

```bash
cd apps/web && pnpm test
cd apps/be && pnpm test  # smoke; should be unaffected
````

- [ ] **Step F2: Build passes**

  ```bash
  pnpm build
  ```

- [ ] **Step F3: File-length check**

  ```bash
  pnpm check-file-length
  ```

- [ ] **Step F4: i18n check**

  ```bash
  pnpm check-translations
  ```

- [ ] **Step F5: testid baseline diff**

  ```bash
  diff /tmp/critical-testids-before.txt /tmp/critical-testids-after.txt
  ```

  Confirm: only additions, no removals from existing testids.

- [ ] **Step F6: Manual visual sweep across all 6 variants**

  Open active game in each variant (cyberpunk / underwater / crime / horror / adventure / high-altitude-hike) at 390×844 and confirm: turn ring color reads, scene palette intact, no overlapping zones, all five zones visible without inner scroll.

- [ ] **Step F7: Manual visual sweep on desktop**

  At 1280×800, confirm desktop layout is byte-identical to before this branch (only `$sm` overrides changed).

- [ ] **Step F8: Push branch (when user requests)**

  ```bash
  git push -u origin ARC-485
  ```

  (Push only when explicitly requested.)

---

## Risks & rollback

- **All work is gated behind `useMedia().sm` or Tamagui `$sm` overrides.** A revert of any single Task commit is safe — the previous behavior returns. The most disruptive single revert is Task 5 (popover wiring) because it changes how taps fire actions on mobile; reverting it leaves the new larger cards and linear strip but restores immediate-fire taps.
- **i18n key additions are additive.** Removing the new keys without code changes is harmless (fallback to key path).
- **The `actions.title` desktop fix in Task 1** is the only change that touches non-`$sm` rendering. If it causes copy regression, revert just Task 1.
