# Styled-Components → Tamagui Migration Design

**Date:** 2026-03-21
**Branch:** ARC-425
**Status:** Approved

## Goal

Remove all remaining `styled-components` usage from `apps/web/src/` and replace with Tamagui primitives and `@arcadeum/ui` / `@/shared/ui` components. This continues the migration already completed for the payment feature.

## Scope

### Files to Migrate (24 files)

**home agent:**
- `apps/web/src/app/home/components/modals/HomeGameDetailsModal.tsx`
- `apps/web/src/app/home/components/styles/Footer.styles.ts`

**games agent:**
- `apps/web/src/app/games/styles.ts`
- `apps/web/src/app/games/room-card.styles.ts`
- `apps/web/src/app/games/create/styles.ts`
- `apps/web/src/app/games/rooms/[id]/components/styles.ts`
- `apps/web/src/app/games/[id]/GameDetailPage.tsx`
- `apps/web/src/app/games/components/InviteCodeModal.tsx`

**stats agent:**
- `apps/web/src/app/stats/styles.ts`
- `apps/web/src/app/stats/StatsPage.tsx`
- `apps/web/src/app/stats/components/Leaderboard.tsx`
- `apps/web/src/app/stats/components/StatsHeader.tsx`
- `apps/web/src/app/stats/components/GameBreakdown.tsx`
- `apps/web/src/app/stats/components/StatsOverview.tsx`

**chats-notes agent:**
- `apps/web/src/app/chats/ChatListPage.tsx`
- `apps/web/src/app/notes/NotesPage.tsx`

**misc-pages agent:**
- `apps/web/src/app/settings/styles.tsx`
- `apps/web/src/app/support/styles.ts`
- `apps/web/src/app/error.tsx`
- `apps/web/src/app/offline/page.tsx`
- `apps/web/src/app/payment/cancel/page.tsx`

**shared-features agent:**
- `apps/web/src/shared/lib/styles.ts`
- `apps/web/src/features/referrals/ui/styles.ts`
- `apps/web/src/features/pwa/InstallPWAModalContent.tsx`

### Infrastructure Cleanup (main session — AFTER all agents complete)

**Required ordering:** This step must only run after confirming zero `${({ theme }) =>` occurrences remain across `apps/web/src/` via grep. Removing the theme provider while styled-components consumers still exist will break the entire app.

Files touched:
- `apps/web/src/app/StyledComponentsRegistry.tsx` — replace body with a passthrough component (`export default function StyledRegistry({ children }) { return <>{children}</>; }`). Do NOT delete the file — it is imported in both `layout.tsx` (lines 9, 46, 59) and `global-error.tsx` (lines 7, 29, 49).
- `apps/web/src/app/theme/ThemeContext.tsx` — remove `StyledThemeProvider` import and wrapper; keep `TamaguiProvider` unchanged.
- `apps/web/src/styled.d.ts` — delete entirely.
- Run `tsc --noEmit` after deleting `styled.d.ts` to catch any lingering type errors.
- Verify `grep -r "from 'styled-components'" apps/web/src` returns no results, then remove `styled-components` from `package.json` dependencies.

## Architecture

### Approach: 6 Parallel Subagents + 1 Cleanup Pass

Each agent handles an independent feature area with no shared state between areas, enabling safe parallel execution. After all agents complete, the main session performs infrastructure cleanup.

### Reference Pattern

The payment feature migration (commits `0740fd6`–`903035e`) is the established pattern:
- Inline styled-components → Tamagui primitives in the component file
- Complex reusable styled components → Tamagui `styled()` in a companion `styles.ts`
- `@arcadeum/ui` and `@/shared/ui` components used wherever available

## Migration Rules

### Element Replacement

| styled-components | Tamagui |
|---|---|
| `styled.div` (vertical stack) | `YStack` |
| `styled.div` (horizontal layout) | `XStack` |
| `styled.section` / `styled.main` / `styled.footer` / `styled.header` | `YStack` with `tag="section"` etc. if semantics needed |
| `styled.span` / `styled.p` | `Text` |
| `styled.h1`–`styled.h3` | `H1`–`H3` or `Text` with size prop |
| `styled.a` | `Text` with `tag="a"` or Next.js `Link` |
| `styled.ul` / `styled.li` | `YStack` / `XStack` |
| `styled(ExistingComponent)` | `styled(ExistingComponent, { ... })` from tamagui |

### Theme Token Mapping

The Tamagui config (`packages/ui/src/tamagui.config.ts`) defines these semantic tokens — use them directly via `$token` syntax in Tamagui `styled()` components:

| styled-components theme | Tamagui `$token` |
|---|---|
| `theme.text.primary` | `$color` |
| `theme.background.base` | `$background` |
| `theme.surfaces.card.background` | `$background` |
| `theme.surfaces.card.border` | `$borderColor` |
| `theme.surfaces.card.shadow` | `elevation` prop or `shadowColor: '$shadowColor'` |
| `theme.buttons.primary.gradientStart` | `$primaryGradientStart` |
| `theme.buttons.primary.gradientEnd` | `$primaryGradientEnd` |
| `theme.interactive.option.border` | `$borderColor` |
| `theme.interactive.option.background` | `$backgroundHover` |
| `theme.outlines.focus` | `$borderColorFocus` |

For theme values with **no direct Tamagui token** (muted text, panel surfaces, interactive states, etc.), use hardcoded RGBA values that approximate the dark theme defaults, or use inline `style` prop. The Tamagui theme does not expose equivalents for:
- `theme.text.secondary` → use `color: '$color'` at 70% opacity or `color: 'rgba(236, 239, 238, 0.7)'`
- `theme.text.muted` → use `color: 'rgba(236, 239, 238, 0.45)'`
- `theme.text.accent` → use `color: '$accent'`
- `theme.surfaces.panel.background` → use `backgroundColor: '$background'`
- `theme.surfaces.panel.border` → use `borderColor: '$borderColor'`
- `theme.background.radialStart` → use `$backgroundRadialStart`
- `theme.interactive.download.*` → use `$borderColor` / `$backgroundHover`
- `theme.interactive.pill.*` → use `$borderColor` / `$backgroundHover`
- `theme.copyNotice` → `color: '$accent'` (text color only — equals `#81f1ff` in dark themes; do NOT use as background/border)
- `theme.text.notice` → `color: '$accent'` (same as `text.accent` in neon themes; add comment noting divergence for violet/teal themes)
- `theme.buttons.secondary.*` → use `$secondary` / `$secondaryGradientStart`
- `theme.buttons.primary.text` → `color: '#050316'` (hardcoded; Tamagui has no inverse-primary token)

### Responsive Breakpoints

Based on actual values in `packages/ui/src/tamagui.config.ts`:

| CSS media query | Tamagui prop |
|---|---|
| `@media (max-width: 480px)` | No Tamagui equivalent — move to inline `<style>` tag with CSS class |
| `@media (max-width: 640px)` | `$xs` (660px; 20px gap — note deviation in comment) |
| `@media (max-width: 660px)` | `$xs` |
| `@media (max-width: 768px)` or `@media (max-width: 800px)` | `$sm` |
| `@media (max-width: 1024px)` | `$tablet` |
| `@media (max-width: 1150px)` | `$md` |
| `@media (min-width: 661px)` | `$gtXs` |
| `@media (min-width: 768px)` or `@media (min-width: 769px)` or `@media (min-width: 801px)` | `$gtSm` (1px gap for 768px; same approximation policy) |
| `@media (min-width: 1151px)` | `$gtMd` |
| `@media (min-width: 1281px)` | `$gtLg` |

When a source breakpoint doesn't align exactly with a Tamagui breakpoint, choose the closest and note the deviation in a comment.

Non-standard media queries (`@media (hover: hover) and (pointer: fine)`, `@media (prefers-reduced-motion)`) have no Tamagui equivalent — move these to an inline `<style>` tag or CSS module.

### Animations

- Simple entrance animations (`fadeIn`, `slideIn`) → `enterStyle` + `animation` prop on the Tamagui component, or Tamagui's `AnimatePresence`
- Complex or pseudo-element animations → inline `<style>` tag (same approach as `PaymentPage.tsx` which uses `const backgroundStyles = \`@keyframes ...\`` injected via `<style>`)
- Shimmer/skeleton keyframes → inline `<style>` tag with a CSS class applied via `className` prop

### Pseudo-Elements and Child Selectors

Tamagui's `styled()` does not support `::before`, `::after`, or descendant selectors (`& > button`, `& > span`). For these:
- Move pseudo-element and descendant-selector CSS to an inline `<style>` tag or a CSS class
- Apply the class via `className` prop on the Tamagui component
- The same inline `<style>` tag pattern used in `PaymentPage.tsx` is the approved approach

### `.attrs()` Pattern

styled-components' `.attrs()` has no Tamagui equivalent. Replace:
- `styled.input.attrs({ type: 'checkbox' })` → native `<input type="checkbox" />` with CSS class for pseudo-element styling (`::after`, `:checked::after`)

### Shared UI Components to Prefer

From `@arcadeum/ui` / `@/shared/ui`:
- `Container` — replaces `max-width: 1200px; margin: 0 auto` wrapper divs
- `Card` — replaces card-shaped divs with border/background/radius
- `PageLayout` — replaces page-level layout wrappers
- `Section` — replaces section wrappers
- `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter` — replaces modal scaffolding
- `Typography`, `PageTitle` — replaces heading/text styled components
- `LoadingState`, `EmptyState`, `ErrorState` — replaces custom loading/empty/error states
- `Divider`, `Spinner`, `Badge`, `Avatar`, `GlassCard` — use wherever custom divs replicate these

### Special Cases

**`shared/lib/styles.ts` (scrollbar CSS):**
Export a plain CSS string constant instead of a styled-components `css` block:
```ts
export const scrollbarStyles = `
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(236, 239, 238, 0.45); border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: rgba(236, 239, 238, 0.7); }
  scrollbar-width: thin;
  scrollbar-color: rgba(236, 239, 238, 0.45) transparent;
`;
```
Run `grep -r "scrollbarStyles" apps/web/src` to find consumers. As of this spec there are zero import consumers (the export is unused), so no propagation work is needed — just convert the module and leave it in place for future use.

**`support/styles.ts` (complex CSS composition):**
- Replace `css` tagged template helper with plain Tamagui `styled()` objects
- For `CopyActionWrapper` which styles child elements via `& > button` and `& > span` descendant selectors — move those selectors to an inline `<style>` tag injected in the component that uses `CopyActionWrapper`
- For `@media (hover: hover) and (pointer: fine)` and `@media (prefers-reduced-motion)` — move to the same inline `<style>` tag; these have no Tamagui equivalent

**`settings/styles.tsx` (`.attrs()` + pseudo-elements):**
- `ToggleInput = styled.input.attrs({ type: 'checkbox' })` with `::after` / `:checked::after` pseudo-elements — replace with a native `<input type="checkbox" className="toggle-input" />` and add styles to the page's inline `<style>` tag
- The existing `UnblockButton` (already a Tamagui component) should not be touched

**`notes/NotesPage.tsx` (pseudo-elements):**
- `NoteCard::before` (accent border stripe) and `SkeletonCard::after` (shimmer animation) — move to inline `<style>` tag with CSS class applied via `className`

**`stats/` components (shimmer keyframes):**
- The `Skeleton` in `stats/styles.ts` uses inline `@keyframes shimmer` — move to inline `<style>` tag with a CSS class

**`games/rooms/[id]/components/styles.ts` (fullscreen pseudo-classes):**
- The `Container` component uses `:fullscreen`, `:-webkit-full-screen`, and `:-moz-full-screen` pseudo-class blocks with theme tokens inside. Tamagui `styled()` cannot express these. Move these blocks to an inline `<style>` tag injected in the component that renders `Container`, and apply the styles via a CSS class on the container element.

## Success Criteria (ordered)

1. All 6 agent migrations complete with no TypeScript errors in their respective files
2. `grep -r "\${({ theme })" apps/web/src` returns zero results
3. Infrastructure cleanup applied: `StyledComponentsRegistry` becomes a passthrough, `StyledThemeProvider` removed from `ThemeContext`, `styled.d.ts` deleted
4. `grep -r "from 'styled-components'" apps/web/src` returns zero results (infrastructure imports are removed in step 3, so this must run after)
5. `tsc --noEmit` passes with no errors
6. All pages render correctly (visual check)
7. `styled-components` removed from `package.json`
