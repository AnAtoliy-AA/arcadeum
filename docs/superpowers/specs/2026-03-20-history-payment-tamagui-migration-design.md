# Design: Replace styled-components with Tamagui in History and Payment Pages

**Date:** 2026-03-20
**Scope:** `apps/web` only — history and payment pages (including success page)
**Branch:** ARC-425

---

## Overview

Migrate all `styled-components` usage in the web app's history and payment pages to Tamagui primitives and `styled()` API, using as much as possible from `@arcadeum/ui`. The `styled-components` package is not removed globally — other parts of the app may still use it.

---

## Approach

File-by-file, styles-first within each page. Migrate history page fully before starting payment page. Within each page, rewrite or delete style files first, then update the component files that import them.

Styling rules:

- **Simple flex/layout wrappers** → Tamagui primitives inline (`XStack`, `YStack`, `Typography`)
- **Complex or reused components** → Tamagui `styled()` API
- **CSS-only features** (pseudo-elements, webkit selectors, `appearance:none`, keyframes) → plain HTML elements + `<style>` block in the component
- **CSS Grid** → plain `<div style={{ display: 'grid', ... }}>` (Tamagui does not support grid layout natively)

---

## Component Mapping

### History Page

#### `styles/structure.ts` → **Delete**

- `Page` = `styled(SharedPageLayout)` with no extra styles → use `PageLayout` directly in `HistoryPage.tsx`
- `Container` = `styled(SharedContainer).attrs({ size: 'xl' })` with `gap: 1.5rem` → use `Container` with `size="xl" gap="$5"` inline
  - **Note:** verify that `$5` token in the project's scale equals `1.5rem` before finalizing

#### `styles/header.ts` → **Delete**

- `Header` → not a separate file export anymore; this component is defined inside `HistoryHeader.tsx` (at the bottom of the file, after the JSX). See `HistoryHeader.tsx` section below for the full rewrite.

#### `HistoryHeader.tsx` → **Rewrite**

This file currently defines its styled-components inline (after the JSX):

- `Header = styled.div` (flex row) → inline `XStack jc="space-between" ai="center" mb="$8"` directly in JSX
- `StyledRefreshIcon = styled.svg` with conditional `spin` keyframe animation → keep as native `<svg>` + `<style>` block inside the component:
  ```tsx
  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  <svg style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} ... />
  ```

#### `styles/filters.tsx` → **Delete**

- `FilterBar` → inline `XStack flexWrap="wrap" gap="$4" $xs={{ flexDirection: 'column' }}`
- `SearchInput` → `Input` from `@arcadeum/ui` with `flex={1} minWidth={250} $xs={{ minWidth: '100%', width: '100%' }}` inline
- `FilterSelect` → `Select` from `@arcadeum/ui` — see `HistoryFilters.tsx` section for migration notes
  - **Note:** `SelectProps` is a closed explicit type — it does not accept `minWidth` or responsive `$xs` props. Use `style={{ minWidth: 180 }}` for the min-width, and wrap `Select` in a `YStack $xs={{ width: '100%' }}` for the responsive breakpoint behavior.
- `ClearFiltersButton` → already uses Tamagui `Button` props, no change needed

#### `HistoryFilters.tsx` → **Rewrite**

The `FilterSelect` currently renders native `<option>` children. The `@arcadeum/ui` `Select` component uses Tamagui's dropdown and does not accept `<option>` children — items must be passed as an `options` array:

```tsx
// Before
<FilterSelect onChange={(e) => onStatusChange(e.target.value)}>
  <option value="all">...</option>
  ...
</FilterSelect>

// After — Select wrapped in YStack for responsive min-width (SelectProps is a closed type,
// does not accept minWidth or $xs directly)
<YStack style={{ minWidth: 180 }} $xs={{ width: '100%' }}>
<Select
  value={statusFilter}
  onChange={(e) => onStatusChange(e.target.value)}  // onChange adapter exists in Select.tsx
  options={[
    { value: 'all', label: t('history.filter.all') },
    { value: 'lobby', label: t('history.status.lobby') },
    { value: 'in_progress', label: t('history.status.in_progress') },
    { value: 'completed', label: t('history.status.completed') },
    { value: 'waiting', label: t('history.status.waiting') },
    { value: 'active', label: t('history.status.active') },
  ]}
  aria-label={t('history.filter.label')}
/>
</YStack>
```

The `onChange` adapter is already present in `Select.tsx` (line 19: `onChange?: (e: { target: { value: string } }) => void`), so the existing call site pattern continues to work.

#### `styles/entries.ts` → **Rewrite**

- `EntriesGrid` → plain `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>`
- `EntryCard` → `Card variant="elevated" padding="md" interactive` + `flexDirection="column" gap="$3" textAlign="left"` + `group` prop
  - The `group` prop passes through `Card`'s `...rest` spread to `StyledCard`. This enables child `$group-hover` selectors. Verify at implementation time that Tamagui's group feature works correctly with the `Card.styleable()` wrapper.
- `EntryHeader` → inline `XStack jc="space-between" ai="flex-start" gap="$4"`
- `EntryTitleGroup` → inline `YStack flex={1} minWidth={0}`
- `EntryGameName` → `Typography uiSize="lg" weight="600" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" width="100%"`
  - Use `tag="h3"` for semantic HTML. This works via Tamagui's `GetProps` inference on the underlying `Text` component, though `tag` is not explicitly in `Typography`'s declared prop type. It will work but the type may require `as any` or a cast.
- `EntryRoomName` → `Typography uiSize="sm" alpha="medium"` + `overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" width="100%"`
- `EntryStatus` → `Badge variant="info" size="sm" borderRadius={999}` inline
- `EntryMeta` → inline `XStack flexWrap="wrap" gap="$2"`
- `EntryFooter` → inline `XStack jc="space-between" ai="center" gap="$4" marginTop="auto" paddingTop="$3" borderTopWidth={1}`
- `EntryTimestamp` → `Typography uiSize="xs" alpha="medium"`
- `EntryViewDetails` → `Typography uiSize="sm" weight="600" $group-hover={{ opacity: 0.8 }}`
  - This replaces the `${EntryCard}:hover &` parent selector pattern from styled-components using Tamagui's `group` feature on the parent `EntryCard`.

#### `styles/details.ts` → **Rewrite**

- `DetailTimestamp` → `Typography uiSize="sm" alpha="medium"` with `padding="$3 $4" borderRadius="$4" borderWidth={1}` and background/border colors from theme tokens
- `Section` → inline `YStack gap="$4" padding="$6" borderRadius="$5" borderWidth={1}`
  - **Important:** `HistoryDetailModal.tsx` imports `Section` from `@/shared/ui`, NOT from `history/styles`. The `Section` in `details.ts` is only used by components that import from `../styles`. Do not change the `Section` import in `HistoryDetailModal.tsx` — it is a separate, shared component.
- `SectionTitle` → extract as a named exported component in `details.ts` (not inline JSX — it is used 4 times in `HistoryDetailModal.tsx`). Replace the `::before` pseudo-element with a real element:
  ```tsx
  export function SectionTitle({ children }: { children: ReactNode }) {
    return (
      <XStack ai="center" gap="$2">
        <YStack
          width={4}
          height={18}
          borderRadius={2}
          background="linear-gradient(180deg, $primary, $primaryDark)"
        />
        <Typography uiSize="lg" weight="600" tag="h3">
          {children}
        </Typography>
      </XStack>
    );
  }
  ```
  - `height={18}` is the fixed equivalent of `height: 1em` at the h3 font size (1.125rem ≈ 18px). Tamagui's `YStack` does not accept `"1em"` as a valid height value — use a pixel number.
  - Export this component from `details.ts` so all four usages in `HistoryDetailModal.tsx` continue to work without changes to those call sites.
- `SectionDescription` → `Typography uiSize="sm" alpha="medium" lineHeight="$5"`

#### `styles/actions.ts` → **Delete**

- `ConfirmRow` → inline `XStack gap="$4"` in `HistoryDetailModal.tsx`; each `Button` gets `flex={1}` directly as a prop

#### `styles/participants.ts` → **Rewrite**

- `ParticipantRow` → Tamagui `styled(XStack)` with `hoverStyle`, `animation="fast"`, `borderWidth={1}`, `borderRadius="$4"`, `padding="$4 $5"`
- `ParticipantInfo` → inline `XStack ai="center" gap="$3" flex={1}`
- `ParticipantName` → `Typography weight="500"`
- `Checkbox` → keep as native `<input type="checkbox">` with `appearance:none`. Add a `<style>` block in the component covering `:checked`, `::after`, `:hover`, `:focus-visible` — these pseudo-selectors cannot be expressed in Tamagui.

#### `styles/logs.ts` → **Rewrite**

- `LogItem` → `styled(YStack)` with `hoverStyle={{ borderColor: '$borderColor' }}`, `animation="fast"`, `borderWidth={1}`, `borderRadius="$4"`, `padding="$5"`, `gap="$3"`
- `LogHeader` → inline `XStack jc="space-between" ai="center" gap="$4"`
- `LogTimestamp` → `Typography uiSize="xs" alpha="medium" fontFamily="$mono"`
- `LogScope` → `styled(Typography)` — pill shape: `borderRadius={999} paddingHorizontal="$3" paddingVertical="$1"` + background and uppercase/tracking styles
- `LogSender` → `Typography uiSize="sm" weight="500" alpha="high"`
- `LogMessage` → `Typography lineHeight="$5"`

#### `styles.ts` barrel → **Update**

Remove exports for deleted files (`structure`, `header`, `filters`, `actions`). Keep exports for rewritten files (`entries`, `details`, `participants`, `logs`).

---

### Payment Page

#### `ui/PaymentHeader.tsx` → **Rewrite**

- `HeaderSection` → inline `YStack ai="center" mb="$12"`
- `GradientTitle` → use `PageTitle size="xl" gradient` directly from `@arcadeum/ui`
  - `fontWeight="800"` is already baked into `PageTitle` internally — do not pass it as a prop.
  - `PageTitle` does not accept `mb` or `display` as props (it is a memo-wrapped function component, not a raw Tamagui element). Apply margin/display to a wrapping `YStack` or `XStack` instead.
- `Subtitle` → `Typography uiSize="lg" alpha="medium"` inline
- `Description` → `Typography uiSize="sm" alpha="medium" maxWidth={480} textAlign="center" mt="$4" lineHeight="$5"` inline

#### `ui/PaymentPresets.tsx` → **Rewrite**

- `PresetGrid` → plain `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>` with a `<style>` block for the 4-column breakpoint: `@media (min-width: 640px) { .preset-grid { grid-template-columns: repeat(4, 1fr); } }`
- `PresetCard` wrapper component → remove entirely; use `Button` directly with existing Tamagui props
- `Emoji` → plain `<span>`
- `PresetLabel` → `Typography uiSize="sm" alpha="high" weight="500"` inline
- `PresetValue` → `Typography weight="600"` inline

#### `ui/AmountDisplay.tsx` → **Rewrite**

- `AmountInputWrapper` → inline `XStack ai="center" jc="center" position="relative" my="$4"`
- `CurrencySymbol` → plain `<span style={{ position: 'absolute', left: '2rem', fontSize: '2.5rem', fontWeight: 600, pointerEvents: 'none' }}>`
- `LargeAmountInput` → keep as native `<input>` with a `<style>` block for:
  - `::-webkit-outer-spin-button` / `::-webkit-inner-spin-button` (hide number arrows)
  - `::placeholder` opacity
  - `:focus` box-shadow and border-color
  - `-moz-appearance: textfield`
  - Apply non-pseudo styles (width, background, border, border-radius, font-size, etc.) as inline `style` prop values using theme CSS variables or hard-coded values

#### `PaymentPage.tsx` → **Remove inline styled-components**

- `BackgroundWrapper` (keyframes + `::before`/`::after` blobs) → plain `<div className="payment-bg">` + `<style>` tag at top of component containing `@keyframes float`, `.payment-bg::before`, `.payment-bg::after` rules
- `StyledForm` → `YStack as="form" gap="$8"`
- `StyledTextArea` → Tamagui `styled(TextArea)` extracted to new `payment/styles.ts`
  - The original uses `!important` overrides. Tamagui's `styled()` does not support `!important`. Verify that equivalent Tamagui style props achieve the same result without specificity conflicts. If any `!important` is truly needed, fall back to a `className` + `<style>` block for that specific property.
- `StatusMessage` → Tamagui `styled(XStack)` in `payment/styles.ts` with `variants` for `$type: 'error' | 'success'` + `enterStyle={{ opacity: 0, y: 10 }}` + `animation="fast"`
  - The original uses `keyframes` for a `fadeIn` animation — replace with Tamagui's `enterStyle` + `animation` props
- `SecureInfoWrapper` → inline `XStack jc="center" ai="center" gap="$2" opacity={0.5} mt="$8"`
- `CheckboxWrapper` → inline `XStack as="label" cursor="pointer" padding="$3" borderRadius="$4" borderWidth={1} hoverStyle={{ ... }}`
- `StyledCheckbox` → plain `<input type="checkbox" style={{ accentColor: '#3b82f6', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}>`
- `CheckboxLabel` → `Typography uiSize="sm"` inline

#### `payment/success/PaymentSuccessView.tsx` → **Rewrite**

This file was previously missing from scope. It contains 7 styled-components and 5 keyframe animations.

- `SuccessContainer = styled(Container)` with flex, animation → `Container size="sm" flexDirection="column" ai="center" textAlign="center" gap="$10" pt="$24" position="relative" zIndex={10}` + add className + `<style>` block for `@keyframes fadeIn` and animate via `style={{ animation: 'fadeIn 0.6s ease-out' }}`
- `ConfettiContainer = styled.div` with fixed position → inline `YStack position="fixed" top={0} left={0} width="100%" height="100%" pointerEvents="none" overflow="hidden" zIndex={1}`
- `Particle = styled.div` with 4 dynamic props (`$delay`, `$left`, `$duration`, `$color`) and `confettiFall` keyframe → keep as plain `<div>` with inline `style` prop for dynamic values; `@keyframes confettiFall` goes in a `<style>` block at the top of the file
- `IconWrapper = styled.div` with two chained animations (`popIn` + `float`) → plain `<div>` with inline `style`; `@keyframes popIn` and `@keyframes float` go in the `<style>` block
- `Title = styled(PageTitle)` with font-size override + gradient text via `-webkit-background-clip` → use `PageTitle size="lg" gradient` directly; if font-size override is needed, wrap in a `YStack` with `style={{ fontSize: '2.5rem' }}`
- `Message = styled.p` → `Typography uiSize="lg" maxWidth={480} lineHeight="$6" textAlign="center"` inline
- `DetailCard = styled(Card)` with `::before` shimmer pseudo-element + `fadeIn` animation → `Card padding="md"` directly with glass-style inline props (`backgroundColor`, `borderColor`, `maxWidth={420}`, `width="100%"`); the `::before` shimmer goes in the `<style>` block using a CSS class (e.g. `.detail-card::before { ... animation: shimmer 3s linear infinite }`)
- `ButtonGroup = styled.div` with flex + `fadeIn` animation → inline `XStack gap="$6" mt="$6"` + `style={{ animation: 'fadeIn 0.6s ease-out 0.4s backwards' }}`

All 5 keyframes (`fadeIn`, `popIn`, `float`, `shimmer`, `confettiFall`) consolidated into a single `<style>` block at the top of `PaymentSuccessView.tsx`.

---

## Files Changed

| File                                        | Action                                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `history/styles/structure.ts`               | Delete                                                                                                                                        |
| `history/styles/header.ts`                  | Delete                                                                                                                                        |
| `history/styles/filters.tsx`                | Delete                                                                                                                                        |
| `history/styles/actions.ts`                 | Delete                                                                                                                                        |
| `history/styles/entries.ts`                 | Rewrite → Tamagui                                                                                                                             |
| `history/styles/details.ts`                 | Rewrite → Tamagui                                                                                                                             |
| `history/styles/participants.ts`            | Rewrite → Tamagui + `<style>`                                                                                                                 |
| `history/styles/logs.ts`                    | Rewrite → Tamagui                                                                                                                             |
| `history/styles.ts`                         | Update barrel exports                                                                                                                         |
| `history/HistoryPage.tsx`                   | Update imports, inline layout                                                                                                                 |
| `history/components/HistoryHeader.tsx`      | Inline `XStack`, keep svg + `<style>` for spin animation                                                                                      |
| `history/components/HistoryFilters.tsx`     | Inline `XStack`/`Input`/`Select` props; rewrite `Select` usage to `options` array                                                             |
| `history/components/HistoryDetailModal.tsx` | Inline `XStack` for `ConfirmRow` — remove `ConfirmRow` from the `../styles` import block; `Section` import from `@/shared/ui` stays unchanged |
| `history/components/HistoryCard.tsx`        | Update to use new entry styles                                                                                                                |
| `history/components/HistoryList.tsx`        | Update if needed                                                                                                                              |
| `payment/PaymentPage.tsx`                   | Remove inline styled-components, add `<style>` for background                                                                                 |
| `payment/ui/PaymentHeader.tsx`              | Rewrite                                                                                                                                       |
| `payment/ui/PaymentPresets.tsx`             | Rewrite + `<style>` for grid breakpoint                                                                                                       |
| `payment/ui/AmountDisplay.tsx`              | Rewrite + `<style>` for input pseudo-selectors                                                                                                |
| `payment/success/PaymentSuccessView.tsx`    | Rewrite + single consolidated `<style>` block for all keyframes                                                                               |
| `payment/styles.ts` (new)                   | `styled(TextArea)` + `StatusMessage` variants                                                                                                 |

---

## Imports After Migration

All style imports switch from `styled-components` to:

- `import { XStack, YStack, Typography, Card, Badge, Input, Select, PageTitle, TextArea } from '@arcadeum/ui'`
- `import { styled } from 'tamagui'` for any remaining `styled()` wrappers in rewritten style files

---

## Out of Scope

- Removing `styled-components` from `package.json`
- Mobile app
- Any page outside history and payment (including cancel page)
- Global theme or token changes
