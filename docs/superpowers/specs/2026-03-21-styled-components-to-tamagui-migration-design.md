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

### Infrastructure Cleanup (main session after agents)
- `apps/web/src/app/StyledComponentsRegistry.tsx` — remove or replace with passthrough
- `apps/web/src/app/theme/ThemeContext.tsx` — remove `StyledThemeProvider` wrapper
- `apps/web/src/styled.d.ts` — delete

## Architecture

### Approach: 6 Parallel Subagents + 1 Cleanup Pass

Each agent handles an independent feature area with no shared state between areas, enabling safe parallel execution. After all agents complete, the main session removes styled-components infrastructure.

### Reference Pattern

The payment feature migration (commits `0740fd6`–`903035e`) is the established pattern:
- Inline styled-components → Tamagui primitives in the component file
- Complex reusable styled components → Tamagui `styled()` in a companion `styles.ts`
- `@arcadeum/ui` and `@/shared/ui` components used wherever available

## Migration Rules

### Element Replacement
| styled-components | Tamagui |
|---|---|
| `styled.div` | `YStack` or `XStack` |
| `styled.section` / `styled.main` / `styled.footer` | `YStack` (with `tag` prop if semantics needed) |
| `styled.span` / `styled.p` | `Text` |
| `styled.h1`–`styled.h3` | `H1`–`H3` or `Text` with size prop |
| `styled.a` | `Text` with `tag="a"` or Next.js `Link` |
| `styled.ul` / `styled.li` | `YStack` / `XStack` |
| `styled(ExistingComponent)` | `styled(ExistingComponent, { ... })` from tamagui |

### Theme Token Mapping
| styled-components theme | Tamagui token |
|---|---|
| `theme.text.primary` | `$color` |
| `theme.text.secondary` | `$colorPress` |
| `theme.text.muted` | `$colorSubtle` |
| `theme.background.base` | `$background` |
| `theme.surfaces.card.background` | `$background` |
| `theme.surfaces.card.border` | `$borderColor` |
| `theme.surfaces.card.shadow` | `elevation` prop |
| `theme.buttons.primary.gradientStart` | `$primary` |

### Responsive Props
| CSS media query | Tamagui |
|---|---|
| `@media (max-width: 768px)` | `$sm` |
| `@media (min-width: 768px)` | `$gtSm` |
| `@media (min-width: 1024px)` | `$gtMd` |

### Animations
- Simple `keyframes` (fadeIn, slideIn) → `enterStyle` + `animation` prop on Tamagui component
- Complex or pseudo-element animations → inline `<style>` tag or CSS class (same pattern as `PaymentPage.tsx`)

### Shared UI Components to Prefer
From `@arcadeum/ui` / `@/shared/ui`:
- `Container` — replaces `max-width: 1200px; margin: 0 auto` wrapper divs
- `Card` — replaces card-shaped divs with border/background/radius
- `PageLayout` — replaces page-level layout wrappers
- `Section` — replaces section wrappers
- `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter` — replaces modal scaffolding
- `Typography`, `PageTitle` — replaces heading/text styled components
- `LoadingState`, `EmptyState`, `ErrorState` — replaces custom loading/empty/error states

### Special Cases
- **`shared/lib/styles.ts` (scrollbar CSS):** Convert to a plain CSS string exported as a constant (no styled-components dependency), applied via `<style>` tag or global CSS. Tamagui does not support `::webkit-scrollbar` pseudo-elements.
- **`support/styles.ts` CSS keyframes + `css` helper:** Replace `css` tagged template with Tamagui `styled()` objects; move keyframe animations to inline `<style>` tag.

## Infrastructure Cleanup

After all agent migrations are verified:

1. **`StyledComponentsRegistry.tsx`** — Replace body with a simple passthrough (`export default function StyledRegistry({ children }) { return children; }`) or delete if not referenced in layout.
2. **`ThemeContext.tsx`** — Remove `StyledThemeProvider` import and wrapper; keep only `TamaguiProvider`.
3. **`styled.d.ts`** — Delete entirely.
4. Verify `styled-components` can be removed from `package.json` (check no remaining imports with `grep -r "from 'styled-components'"` across the repo).

## Success Criteria

- `grep -r "from 'styled-components'" apps/web/src` returns no results (except StyledComponentsRegistry and ThemeContext which are cleaned up last)
- All pages render correctly (visual regression check)
- No TypeScript errors
- `styled-components` package can be removed from dependencies
