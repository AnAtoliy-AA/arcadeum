# History & Payment: styled-components → Tamagui Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all `styled-components` usage in the history and payment pages of `apps/web` with Tamagui primitives and `styled()`, using `@arcadeum/ui` components wherever possible.

**Architecture:** File-by-file, styles-first approach. Delete or rewrite each style file, then update the components that import it. History page first, then payment page. Exported names are preserved so most consumers require no import changes — only files that delete exports need consumer updates.

**Tech Stack:** Tamagui 2.0.0-rc.23, `@arcadeum/ui` (workspace package), Next.js 14, TypeScript

---

## Verification command (run after each task)

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

Expected output: no errors related to your changes.

---

## Task 1: Delete `structure.ts` — update `HistoryPage.tsx`

**Files:**

- Delete: `apps/web/src/app/history/styles/structure.ts`
- Modify: `apps/web/src/app/history/styles.ts`
- Modify: `apps/web/src/app/history/HistoryPage.tsx`

- [ ] **Step 1: Delete `structure.ts`**

```bash
rm apps/web/src/app/history/styles/structure.ts
```

- [ ] **Step 2: Remove `structure` export from barrel**

`apps/web/src/app/history/styles.ts` — remove line 1:

```ts
// Remove this line:
export * from './styles/structure';
```

- [ ] **Step 3: Update `HistoryPage.tsx`**

Replace:

```tsx
import { Page, Container } from './styles';
// ...
return (
  <>
    <Page>
      <Container>
```

With:

```tsx
import { PageLayout, Container } from '@/shared/ui';
// ...
return (
  <>
    <PageLayout>
      <Container size="xl" gap="$5">
```

And the closing tags accordingly (`</Page>` → `</PageLayout>`, `</Container>` stays).

- [ ] **Step 4: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

Expected: no errors from history files.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/history/styles.ts apps/web/src/app/history/HistoryPage.tsx
git commit -m "refactor(history): replace Page/Container styled-components with Tamagui"
```

---

## Task 2: Delete `header.ts` — rewrite `HistoryHeader.tsx`

`HistoryHeader.tsx` defines its own inline styled-components (`Header`, `StyledRefreshIcon`). The `styles/header.ts` file exports a separate `Header` that may be unused — deleting it and verifying type check will confirm.

**Files:**

- Delete: `apps/web/src/app/history/styles/header.ts`
- Modify: `apps/web/src/app/history/styles.ts`
- Modify: `apps/web/src/app/history/components/HistoryHeader.tsx`

- [ ] **Step 1: Delete `header.ts` and update barrel**

```bash
rm apps/web/src/app/history/styles/header.ts
```

Remove from `styles.ts`:

```ts
// Remove this line:
export * from './styles/header';
```

- [ ] **Step 2: Run type check — expect it to pass** (header.ts exports were unused)

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Rewrite `HistoryHeader.tsx`**

Full replacement:

```tsx
'use client';

import { XStack } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PageTitle } from '@/shared/ui';
import { Button } from '@arcadeum/ui';

interface HistoryHeaderProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function HistoryHeader({
  loading,
  refreshing,
  onRefresh,
}: HistoryHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <XStack jc="space-between" ai="center" mb="$8">
        <PageTitle size="xl" gradient>
          {t('navigation.historyTab')}
        </PageTitle>
        <Button
          variant="icon"
          size="sm"
          onClick={onRefresh}
          disabled={loading || refreshing}
          aria-label={t('history.actions.refresh')}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              width: 20,
              height: 20,
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}
          >
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </Button>
      </XStack>
    </>
  );
}
```

- [ ] **Step 4: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/history/styles.ts apps/web/src/app/history/components/HistoryHeader.tsx
git commit -m "refactor(history): replace HistoryHeader styled-components with Tamagui"
```

---

## Task 3: Delete `filters.tsx` — rewrite `HistoryFilters.tsx`

**Files:**

- Delete: `apps/web/src/app/history/styles/filters.tsx`
- Modify: `apps/web/src/app/history/styles.ts`
- Modify: `apps/web/src/app/history/components/HistoryFilters.tsx`

- [ ] **Step 1: Delete `filters.tsx` and update barrel**

```bash
rm apps/web/src/app/history/styles/filters.tsx
```

Remove from `styles.ts`:

```ts
// Remove this line:
export * from './styles/filters';
```

- [ ] **Step 2: Rewrite `HistoryFilters.tsx`**

`SelectProps` is a closed type — it does not accept `minWidth` or `$xs`. Use a `YStack` wrapper for responsive min-width, and pass `options` array instead of `<option>` children.

Full replacement:

```tsx
'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Input, Select, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface HistoryFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
}

export function HistoryFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: HistoryFiltersProps) {
  const { t } = useTranslation();

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
  };

  const statusOptions = [
    { value: 'all', label: t('history.filter.all') },
    { value: 'lobby', label: t('history.status.lobby') },
    { value: 'in_progress', label: t('history.status.in_progress') },
    { value: 'completed', label: t('history.status.completed') },
    { value: 'waiting', label: t('history.status.waiting') },
    { value: 'active', label: t('history.status.active') },
  ];

  return (
    <XStack
      flexWrap="wrap"
      gap="$4"
      ai="center"
      $xs={{ flexDirection: 'column' }}
    >
      <Input
        flex={1}
        minWidth={250}
        $xs={{ minWidth: '100%', width: '100%' } as any}
        type="text"
        placeholder={t('history.search.placeholder')}
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onSearchChange(e.target.value)
        }
        aria-label={t('history.search.label')}
      />
      <YStack style={{ minWidth: 180 }} $xs={{ width: '100%' } as any}>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          aria-label={t('history.filter.label')}
        />
      </YStack>
      {(searchQuery || statusFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          whiteSpace="nowrap"
          $xs={{ width: '100%' } as any}
          onClick={handleClearFilters}
        >
          {t('history.filter.clear')}
        </Button>
      )}
    </XStack>
  );
}
```

- [ ] **Step 3: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/history/styles.ts apps/web/src/app/history/components/HistoryFilters.tsx
git commit -m "refactor(history): replace HistoryFilters styled-components with Tamagui"
```

---

## Task 4: Rewrite `entries.ts` — consumers unchanged

All exports keep the same names. `HistoryCard.tsx` and `HistoryList.tsx` do not need to be modified — their imports remain valid.

**Files:**

- Modify: `apps/web/src/app/history/styles/entries.ts`

- [ ] **Step 1: Rewrite `entries.ts`**

```ts
import { styled, XStack, YStack } from 'tamagui';
import { Card, Badge, Typography } from '@arcadeum/ui';
import type { ReactNode } from 'react';

export const EntriesGrid = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.25rem',
    }}
  >
    {children}
  </div>
);

export const EntryCard = styled(Card, {
  name: 'EntryCard',
  variant: 'elevated' as any,
  cardPadding: 'md' as any,
  interactive: true,
  flexDirection: 'column',
  gap: '$3',
  textAlign: 'left',
  cursor: 'pointer',
  group: 'entry' as any,
});

export const EntryHeader = styled(XStack, {
  jc: 'space-between',
  ai: 'flex-start',
  gap: '$4',
});

export const EntryTitleGroup = styled(YStack, {
  flex: 1,
  minWidth: 0,
});

export const EntryGameName = styled(Typography, {
  uiSize: 'lg',
  weight: '600',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  width: '100%',
} as any);

export const EntryRoomName = styled(Typography, {
  uiSize: 'sm',
  alpha: 'medium',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  width: '100%',
} as any);

export const EntryStatus = styled(Badge, {
  variant: 'info',
  size: 'sm',
  borderRadius: 999,
  flexShrink: 0,
} as any);

export const EntryMeta = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$2',
});

export const EntryFooter = styled(XStack, {
  jc: 'space-between',
  ai: 'center',
  gap: '$4',
  marginTop: 'auto',
  paddingTop: '$3',
  borderTopWidth: 1,
  borderColor: '$borderColor',
});

export const EntryTimestamp = styled(Typography, {
  uiSize: 'xs',
  alpha: 'medium',
} as any);

export const EntryViewDetails = styled(Typography, {
  uiSize: 'sm',
  weight: '600',
  color: '$primary',
  '$group-entry-hover': {
    opacity: 0.8,
  },
} as any);
```

**Note on `EntryCard` group:** Tamagui's `group` prop takes a string identifier. Child components reference it as `$group-{name}-hover`. If the `group` prop doesn't pass through `Card`'s `.styleable()` wrapper cleanly, fall back to removing `group` + `$group-entry-hover` and instead apply a static `opacity` on `EntryViewDetails` (the hover effect is cosmetic only).

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/history/styles/entries.ts
git commit -m "refactor(history): rewrite entries styles with Tamagui"
```

---

## Task 5: Rewrite `details.ts` — consumers unchanged

All exports keep the same names. `HistoryDetailModal.tsx` imports continue to work.

**Files:**

- Modify: `apps/web/src/app/history/styles/details.ts`

- [ ] **Step 1: Rewrite `details.ts`**

```tsx
import { styled, XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui';
import type { ReactNode } from 'react';

export const DetailTimestamp = styled(Typography, {
  uiSize: 'sm',
  alpha: 'medium',
  padding: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$backgroundStrong',
} as any);

export const Section = styled(YStack, {
  gap: '$4',
  padding: '$6',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$backgroundStrong',
});

// SectionTitle replaces ::before pseudo-element with a real accent bar element.
// Used 4 times in HistoryDetailModal — must stay as a named export.
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <XStack ai="center" gap="$2">
      <YStack
        width={4}
        height={18}
        borderRadius={2}
        // Use inline style for gradient — Tamagui's background prop doesn't support linear-gradient strings
        style={{
          background:
            'linear-gradient(180deg, var(--color-primary, #6366f1) 0%, var(--color-primary-dark, #4f46e5) 100%)',
        }}
      />
      <Typography uiSize="lg" weight="600" tag="h3" margin={0}>
        {children}
      </Typography>
    </XStack>
  );
}

export const SectionDescription = styled(Typography, {
  uiSize: 'sm',
  alpha: 'medium',
  lineHeight: '$5',
} as any);
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/history/styles/details.ts
git commit -m "refactor(history): rewrite details styles with Tamagui"
```

---

## Task 6: Delete `actions.ts` — update `HistoryDetailModal.tsx`

**Files:**

- Delete: `apps/web/src/app/history/styles/actions.ts`
- Modify: `apps/web/src/app/history/styles.ts`
- Modify: `apps/web/src/app/history/components/HistoryDetailModal.tsx`

- [ ] **Step 1: Delete `actions.ts` and update barrel**

```bash
rm apps/web/src/app/history/styles/actions.ts
```

Remove from `styles.ts`:

```ts
// Remove this line:
export * from './styles/actions';
```

- [ ] **Step 2: Update `HistoryDetailModal.tsx` — remove `ConfirmRow` import and inline it**

In the import block (lines 22–37), remove `ConfirmRow` from the destructured list:

```tsx
// Before
import {
  DetailTimestamp,
  SectionTitle,
  SectionDescription,
  ParticipantRow,
  ParticipantInfo,
  ParticipantName,
  Checkbox,
  LogItem,
  LogHeader,
  LogTimestamp,
  LogScope,
  LogSender,
  LogMessage,
  ConfirmRow, // ← remove this
} from '../styles';
```

Add `XStack` import at the top (merge with existing `@arcadeum/ui` import):

```tsx
import {
  Button,
  Avatar,
  Badge,
  Card,
  ArrowLeftIcon,
  XStack,
} from '@arcadeum/ui';
```

Find the `<ConfirmRow>` usage (lines 218–235) and replace:

```tsx
// Before
<ConfirmRow>
  <Button variant="secondary" onClick={() => onSetShowRemoveConfirm(false)}>
    {t('history.detail.removeCancel')}
  </Button>
  <Button variant="danger" onClick={onRemove} disabled={removeLoading} data-testid="remove-button-confirm">
    {removeLoading ? t('history.detail.removeRemoving') : t('history.detail.removeConfirm')}
  </Button>
</ConfirmRow>

// After
<XStack gap="$4">
  <Button flex={1} variant="secondary" onClick={() => onSetShowRemoveConfirm(false)}>
    {t('history.detail.removeCancel')}
  </Button>
  <Button flex={1} variant="danger" onClick={onRemove} disabled={removeLoading} data-testid="remove-button-confirm">
    {removeLoading ? t('history.detail.removeRemoving') : t('history.detail.removeConfirm')}
  </Button>
</XStack>
```

- [ ] **Step 3: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/history/styles.ts apps/web/src/app/history/components/HistoryDetailModal.tsx
git commit -m "refactor(history): replace ConfirmRow styled-component with Tamagui XStack"
```

---

## Task 7: Rewrite `participants.ts` — consumers unchanged

All exports keep the same names.

**Files:**

- Modify: `apps/web/src/app/history/styles/participants.ts`

- [ ] **Step 1: Rewrite `participants.ts`**

The `Checkbox` component uses `appearance:none` and pseudo-selectors (`:checked`, `::after`, `:hover`, `:focus-visible`) which cannot be expressed in Tamagui. Keep it as a native `<input>` with a `<style>` block. The style block is defined once here and injected via the exported wrapper.

```tsx
import { styled, XStack } from 'tamagui';
import { Typography } from '@arcadeum/ui';
import type { ComponentProps } from 'react';

export const ParticipantRow = styled(XStack, {
  name: 'ParticipantRow',
  jc: 'space-between',
  ai: 'center',
  padding: '$4',
  paddingHorizontal: '$5',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  animation: 'fast',
  hoverStyle: {
    borderColor: '$primary',
    backgroundColor: '$backgroundStrong',
  },
});

export const ParticipantInfo = styled(XStack, {
  ai: 'center',
  gap: '$3',
  flex: 1,
});

export const ParticipantName = styled(Typography, {
  weight: '500',
  flex: 1,
} as any);

// Native checkbox — appearance:none + pseudo-selectors cannot be expressed in Tamagui.
// Styles injected via a <style> block rendered alongside the component.
const checkboxStyles = `
  .history-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
    flex-shrink: 0;
  }
  .history-checkbox:checked {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-color: #6366f1;
  }
  .history-checkbox:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
  }
  .history-checkbox:hover {
    border-color: #6366f1;
  }
  .history-checkbox:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

export function Checkbox(props: ComponentProps<'input'>) {
  return (
    <>
      <style>{checkboxStyles}</style>
      <input {...props} type="checkbox" className="history-checkbox" />
    </>
  );
}
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/history/styles/participants.ts
git commit -m "refactor(history): rewrite participants styles with Tamagui"
```

---

## Task 8: Rewrite `logs.ts` — consumers unchanged

**Files:**

- Modify: `apps/web/src/app/history/styles/logs.ts`

- [ ] **Step 1: Rewrite `logs.ts`**

```ts
import { styled, XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui';

export const LogItem = styled(YStack, {
  name: 'LogItem',
  padding: '$5',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  gap: '$3',
  animation: 'fast',
  hoverStyle: {
    borderColor: '$borderColorHover',
  },
});

export const LogHeader = styled(XStack, {
  jc: 'space-between',
  ai: 'center',
  gap: '$4',
});

export const LogTimestamp = styled(Typography, {
  uiSize: 'xs',
  alpha: 'medium',
  fontFamily: '$mono',
} as any);

export const LogScope = styled(Typography, {
  uiSize: 'xs',
  weight: '600',
  textTransform: 'uppercase',
  letterSpacing: '$md',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 999,
  backgroundColor: '$backgroundStrong',
  alpha: 'medium',
} as any);

export const LogSender = styled(Typography, {
  uiSize: 'sm',
  weight: '500',
  alpha: 'high',
} as any);

export const LogMessage = styled(Typography, {
  lineHeight: '$5',
} as any);
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Confirm zero styled-components imports remain in history directory**

```bash
grep -r "from 'styled-components'" apps/web/src/app/history/
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/history/styles/logs.ts
git commit -m "refactor(history): rewrite logs styles with Tamagui — history page migration complete"
```

---

## Task 9: Rewrite `PaymentHeader.tsx`

**Files:**

- Modify: `apps/web/src/app/payment/ui/PaymentHeader.tsx`

- [ ] **Step 1: Rewrite `PaymentHeader.tsx`**

`PageTitle` is a memo-wrapped function component — it does not accept `mb` or `display` as props. Apply spacing on a wrapper `YStack` instead. `fontWeight="800"` is already baked into `PageTitle` internally — do not pass it.

```tsx
import { YStack } from '@arcadeum/ui';
import { Typography } from '@arcadeum/ui';
import { PageTitle } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export function PaymentHeader() {
  const { t } = useTranslation();

  return (
    <YStack ai="center" mb="$12">
      <YStack mb="$2" display="inline-flex">
        <PageTitle size="xl" gradient>
          {t('payments.title') || 'Support the Project'}
        </PageTitle>
      </YStack>
      <Typography uiSize="lg" alpha="medium" textCenter>
        {t('payments.subtitle') || 'Secure and fast payments powered by PayPal'}
      </Typography>
      <Typography
        uiSize="sm"
        alpha="medium"
        textCenter
        mt="$4"
        lineHeight="$5"
        maxWidth={480}
      >
        {t('payments.description') ||
          'Your contribution directly supports the development of new games, UI improvements, bug fixes, and performance optimizations.'}
      </Typography>
    </YStack>
  );
}
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/payment/ui/PaymentHeader.tsx
git commit -m "refactor(payment): replace PaymentHeader styled-components with Tamagui"
```

---

## Task 10: Rewrite `PaymentPresets.tsx`

**Files:**

- Modify: `apps/web/src/app/payment/ui/PaymentPresets.tsx`

- [ ] **Step 1: Rewrite `PaymentPresets.tsx`**

`PresetCard` wrapper is removed — `Button` is used directly. CSS grid for the 2→4 column layout uses a `<style>` block (Tamagui doesn't support CSS grid natively).

```tsx
import { Typography } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface PaymentPresetsProps {
  amount: string;
  onSelect: (value: string) => void;
}

export function PaymentPresets({ amount, onSelect }: PaymentPresetsProps) {
  const { t } = useTranslation();

  const presets = [
    {
      value: '5',
      label: t('payments.presets.coffee') || 'Coffee',
      emoji: '☕️',
    },
    { value: '10', label: t('payments.presets.lunch') || 'Lunch', emoji: '🍕' },
    { value: '25', label: t('payments.presets.gift') || 'Gift', emoji: '🎁' },
    { value: '50', label: t('payments.presets.boost') || 'Boost', emoji: '🚀' },
  ];

  return (
    <>
      <style>{`
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .preset-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
      <div className="preset-grid">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant="secondary"
            size="md"
            isActive={amount === preset.value}
            bg={
              amount === preset.value
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
                : 'rgba(255, 255, 255, 0.03)'
            }
            borderWidth={1}
            borderColor={
              amount === preset.value
                ? 'rgba(59, 130, 246, 0.5)'
                : 'rgba(255, 255, 255, 0.08)'
            }
            borderRadius={16}
            padding="$4"
            flexDirection="column"
            gap="$2"
            hoverStyle={{
              y: -2,
              borderColor:
                amount === preset.value
                  ? 'rgba(59, 130, 246, 0.6)'
                  : 'rgba(255, 255, 255, 0.2)',
            }}
            onClick={() => onSelect(preset.value)}
          >
            <span
              style={{
                fontSize: '2rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            >
              {preset.emoji}
            </span>
            <Typography uiSize="sm" alpha="high" weight="500">
              {preset.label}
            </Typography>
            <Typography weight="600" color="$color">
              ${preset.value}
            </Typography>
          </Button>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/payment/ui/PaymentPresets.tsx
git commit -m "refactor(payment): replace PaymentPresets styled-components with Tamagui"
```

---

## Task 11: Rewrite `AmountDisplay.tsx`

**Files:**

- Modify: `apps/web/src/app/payment/ui/AmountDisplay.tsx`

- [ ] **Step 1: Rewrite `AmountDisplay.tsx`**

`LargeAmountInput` uses webkit pseudo-selectors (spin button removal, placeholder opacity) that can't be expressed in Tamagui. Keep as native `<input>` with a `<style>` block.

```tsx
import { XStack } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface AmountDisplayProps {
  amount: string;
  onChange: (value: string) => void;
}

const amountInputStyles = `
  .amount-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: inherit;
    font-size: 3rem;
    font-weight: 700;
    text-align: center;
    padding: 1.5rem 1rem;
    outline: none;
    transition: all 0.3s ease;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
    -moz-appearance: textfield;
  }
  .amount-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  .amount-input:focus {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  .amount-input::-webkit-outer-spin-button,
  .amount-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export function AmountDisplay({ amount, onChange }: AmountDisplayProps) {
  const { t } = useTranslation();

  return (
    <>
      <style>{amountInputStyles}</style>
      <XStack ai="center" jc="center" position="relative" my="$4">
        <span
          style={{
            fontSize: '2.5rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.3)',
            position: 'absolute',
            left: '2rem',
            pointerEvents: 'none',
          }}
        >
          $
        </span>
        <input
          id="payment-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          required
          aria-required="true"
          aria-label={t('payments.amountAria') || 'Payment amount'}
          className="amount-input"
        />
      </XStack>
    </>
  );
}
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/payment/ui/AmountDisplay.tsx
git commit -m "refactor(payment): replace AmountDisplay styled-components with Tamagui"
```

---

## Task 12: Create `payment/styles.ts` + Rewrite `PaymentPage.tsx`

**Files:**

- Create: `apps/web/src/app/payment/styles.ts`
- Modify: `apps/web/src/app/payment/PaymentPage.tsx`

- [ ] **Step 1: Create `payment/styles.ts`**

```ts
import { styled, XStack } from 'tamagui';
import { TextArea } from '@arcadeum/ui';

export const StyledTextArea = styled(TextArea, {
  name: 'PaymentTextArea',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: '$4',
  fontSize: '$4',
  focusStyle: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export const StatusMessage = styled(XStack, {
  name: 'StatusMessage',
  padding: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  ai: 'center',
  gap: '$2',
  animation: 'fast',
  enterStyle: { opacity: 0, y: 10 },

  variants: {
    messageType: {
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.2)',
      },
    },
  } as const,
});
```

- [ ] **Step 2: Rewrite `PaymentPage.tsx`**

Replace the entire styled-components section (lines 4, 23–156) with Tamagui. The `BackgroundWrapper` becomes a plain `<div className="payment-bg">` with a `<style>` block. The rest use Tamagui primitives or the new `payment/styles.ts` exports.

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { isValidPaymentUrl, parseAmount } from '@/shared/config/payment-config';
import { paymentApi } from '@/features/payment/api';
import { Button, XStack, YStack, Typography } from '@arcadeum/ui';
import {
  PageLayout,
  Container,
  Section,
  FormGroup,
  GlassCard,
} from '@/shared/ui';
import { PaymentHeader, PaymentPresets, AmountDisplay } from './ui';
import { StyledTextArea, StatusMessage } from './styles';

const backgroundStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  .payment-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow: hidden;
    z-index: -1;
    background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #000000 100%);
  }
  .payment-bg::before {
    content: '';
    position: absolute;
    top: -20%; left: -10%;
    width: 60%; height: 60%;
    background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
    filter: blur(60px);
    animation: float 10s ease-in-out infinite;
  }
  .payment-bg::after {
    content: '';
    position: absolute;
    bottom: -10%; right: -10%;
    width: 50%; height: 50%;
    background: radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%);
    filter: blur(60px);
    animation: float 8s ease-in-out infinite reverse;
  }
`;

export function PaymentPage() {
  const { snapshot } = useSessionTokens();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showName, setShowName] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const queryMode = searchParams?.get('mode');
  const initialMode = queryMode === 'subscription' ? 'subscription' : 'payment';
  const [localMode, setLocalMode] = useState<'payment' | 'subscription' | null>(
    null,
  );
  const mode = localMode ?? initialMode;
  const [interval, setInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const currency = 'USD';

  const { mutate: createSession, isPending: loading } = useMutation({
    mutationFn: async (params: {
      amount: number;
      currency: string;
      description?: string;
    }) => {
      if (mode === 'subscription') {
        return paymentApi.createSubscription(
          {
            amount: params.amount,
            currency: params.currency,
            interval,
            description: params.description,
            returnUrl: undefined,
            cancelUrl: undefined,
          },
          { token: snapshot.accessToken || undefined },
        );
      }
      return paymentApi.createSession(params, {
        token: snapshot.accessToken || undefined,
      });
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        if (!isValidPaymentUrl(data.paymentUrl)) {
          throw new Error(
            t('payments.errors.invalidUrl') || 'Invalid payment URL received',
          );
        }
        const normalizedAmount = parseAmount(amount);
        if (note.trim()) {
          localStorage.setItem(
            'pending_payment_note',
            JSON.stringify({
              note: note.trim(),
              amount: normalizedAmount,
              currency,
              displayName:
                snapshot.userId && showName ? snapshot.displayName : null,
            }),
          );
        }
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
        setSuccess(true);
        setAmount('');
        setNote('');
      } else {
        throw new Error(
          t('payments.errors.noUrl') || 'No payment URL received',
        );
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error
          ? err.message
          : t('payments.errors.failed') || 'Payment failed',
      );
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const normalizedAmount = parseAmount(amount);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        setError(
          t('payments.errors.invalidAmount') || 'Please enter a valid amount',
        );
        return;
      }
      if (normalizedAmount > 1000000) {
        setError(
          t('payments.errors.amountTooLarge') ||
            'Amount is too large. Maximum is 1,000,000',
        );
        return;
      }
      setError(null);
      setSuccess(false);
      createSession({
        amount: normalizedAmount,
        currency,
        description: note.trim() || undefined,
      });
    },
    [amount, currency, note, t, createSession],
  );

  const handleAmountChange = useCallback((val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 2) setAmount(cleaned);
  }, []);

  return (
    <PageLayout>
      <style>{backgroundStyles}</style>
      <div className="payment-bg" />
      <Container size="sm">
        <Section>
          <PaymentHeader />

          <XStack jc="center" mb="$6" gap="$4">
            <Button
              variant={mode === 'payment' ? 'primary' : 'secondary'}
              onClick={() => setLocalMode('payment')}
            >
              {t('payments.modes.oneTime') || 'One-time'}
            </Button>
            <Button
              variant={mode === 'subscription' ? 'primary' : 'secondary'}
              onClick={() => setLocalMode('subscription')}
            >
              {t('payments.modes.recurring') || 'Recurring'}
            </Button>
          </XStack>

          <GlassCard>
            <YStack as="form" gap="$8" onSubmit={handleSubmit as any}>
              {mode === 'subscription' && (
                <XStack jc="center" mb="$4" gap="$2">
                  <Button
                    variant={interval === 'MONTHLY' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      setInterval('MONTHLY');
                    }}
                  >
                    {t('payments.intervals.monthly') || 'Monthly'}
                  </Button>
                  <Button
                    variant={interval === 'YEARLY' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      setInterval('YEARLY');
                    }}
                  >
                    {t('payments.intervals.yearly') || 'Yearly'}
                  </Button>
                </XStack>
              )}

              <FormGroup
                label={t('payments.amountLabel') || 'Select Amount'}
                htmlFor="payment-amount"
                required
              >
                <PaymentPresets amount={amount} onSelect={setAmount} />
                <AmountDisplay amount={amount} onChange={handleAmountChange} />
              </FormGroup>

              <FormGroup
                label={t('payments.noteLabel') || 'Leave a message (optional)'}
                htmlFor="payment-note"
              >
                <StyledTextArea
                  id="payment-note"
                  placeholder={
                    t('payments.notePlaceholder') || 'Say something nice...'
                  }
                  value={note}
                  onChangeText={setNote}
                  aria-label={
                    t('payments.noteAria') || 'Payment note or description'
                  }
                  fullWidth
                  rows={3}
                />
              </FormGroup>

              {!!snapshot.userId && !!note.trim() && (
                <XStack
                  as="label"
                  cursor="pointer"
                  padding="$3"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.1)"
                  backgroundColor="rgba(255,255,255,0.03)"
                  gap="$3"
                  ai="center"
                  hoverStyle={
                    {
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(59,130,246,0.3)',
                    } as any
                  }
                >
                  <input
                    type="checkbox"
                    id="show-name"
                    checked={showName}
                    onChange={(e) => setShowName(e.target.checked)}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      accentColor: '#3b82f6',
                      cursor: 'pointer',
                    }}
                  />
                  <Typography uiSize="sm" color="rgba(255,255,255,0.8)">
                    {t('payments.showNameLabel') ||
                      'Show my name with this note'}
                  </Typography>
                </XStack>
              )}

              {error && (
                <StatusMessage messageType="error">
                  <span role="img" aria-label="error">
                    ⚠️
                  </span>
                  <Typography uiSize="sm" color="#fca5a5">
                    {error}
                  </Typography>
                </StatusMessage>
              )}
              {success && (
                <StatusMessage messageType="success">
                  <span role="img" aria-label="success">
                    ✅
                  </span>
                  <Typography uiSize="sm" color="#86efac">
                    {t('payments.status.success') ||
                      'Payment session created successfully!'}
                  </Typography>
                </StatusMessage>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                size="lg"
                fullWidth
              >
                {loading
                  ? t('payments.submitting') || 'Processing...'
                  : t('payments.submit') || 'Continue to Checkout'}
              </Button>
            </YStack>
          </GlassCard>

          <XStack jc="center" ai="center" gap="$2" opacity={0.5} mt="$8">
            <span role="img" aria-label="secure">
              🔒
            </span>
            <Typography uiSize="sm">
              {t('payments.secureInfo') ||
                'Payments are 256-bit encrypted and secure.'}
            </Typography>
          </XStack>
        </Section>
      </Container>
    </PageLayout>
  );
}
```

- [ ] **Step 3: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/payment/styles.ts apps/web/src/app/payment/PaymentPage.tsx
git commit -m "refactor(payment): replace PaymentPage styled-components with Tamagui"
```

---

## Task 13: Rewrite `PaymentSuccessView.tsx`

**Files:**

- Modify: `apps/web/src/app/payment/success/PaymentSuccessView.tsx`

- [ ] **Step 0: Verify `confetti-particles.ts` exists**

```bash
ls apps/web/src/app/payment/success/confetti-particles.ts
```

Expected: file exists (it already exists in the codebase). No action needed — the import in the rewrite below is correct.

- [ ] **Step 1: Rewrite `PaymentSuccessView.tsx`**

All 5 keyframes (`fadeIn`, `popIn`, `float`, `shimmer`, `confettiFall`) are consolidated into one `<style>` block. Dynamic per-particle CSS (delay, left, duration, color) is expressed via inline `style` props.

```tsx
'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { XStack, YStack, Typography } from '@arcadeum/ui';
import {
  PageLayout,
  Container,
  PageTitle,
  Card,
  LinkButton,
} from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { paymentApi } from '@/features/payment/api';
import { particles } from './confetti-particles';

const successStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes shimmer {
    0%   { background-position: -1000px 0; }
    100% { background-position:  1000px 0; }
  }
  @keyframes confettiFall {
    0%   { transform: translateY(-10vh) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  .detail-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
    background-size: 2000px 100%;
    animation: shimmer 3s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

interface PendingNote {
  note: string;
  amount: number;
  currency: string;
  displayName?: string | null;
}

function SuccessContent() {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('paymentId');
  const token = searchParams?.get('token');
  const hasSavedNoteRef = useRef(false);

  useEffect(() => {
    if (hasSavedNoteRef.current) return;
    const transactionId = paymentId || token;
    if (!transactionId) return;
    const pendingNoteStr = localStorage.getItem('pending_payment_note');
    if (!pendingNoteStr) return;
    hasSavedNoteRef.current = true;
    localStorage.removeItem('pending_payment_note');
    try {
      const pendingNote: PendingNote = JSON.parse(pendingNoteStr);
      paymentApi
        .createNote(
          {
            note: pendingNote.note,
            amount: pendingNote.amount,
            currency: pendingNote.currency,
            transactionId,
            displayName: pendingNote.displayName || undefined,
          },
          { token: snapshot.accessToken || undefined },
        )
        .catch(() => {});
    } catch {}
  }, [paymentId, token, snapshot.accessToken]);

  return (
    <>
      <style>{successStyles}</style>

      {/* Confetti */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: -20,
              left: `${p.left}%`,
              width: 10,
              height: 10,
              backgroundColor: p.color,
              borderRadius: '50%',
              animation: `confettiFall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <Container
        size="sm"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2.5rem',
          paddingTop: '6rem',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 100,
            height: 100,
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
            color: '#22c55e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            marginBottom: '0.5rem',
            boxShadow: '0 0 40px rgba(34,197,94,0.2)',
            border: '1px solid rgba(34,197,94,0.3)',
            animation:
              'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s backwards, float 3s ease-in-out infinite 0.7s',
          }}
        >
          🎉
        </div>

        <div>
          <YStack mb="$4">
            <PageTitle size="lg" gradient>
              {t('payments.successPage.title') || 'Payment Successful!'}
            </PageTitle>
          </YStack>
          <Typography
            uiSize="lg"
            maxWidth={480}
            lineHeight="$6"
            textCenter
            alpha="high"
          >
            {t('payments.successPage.message') ||
              'Thank you for your generous support! Your contribution helps us keep the servers running, the coffee brewing, and the updates coming.'}
          </Typography>
        </div>

        {(paymentId || token) && (
          <Card
            padding="md"
            className="detail-card"
            backgroundColor="rgba(255,255,255,0.03)"
            borderColor="rgba(255,255,255,0.08)"
            maxWidth={420}
            width="100%"
            style={{
              margin: '0 auto',
              animation: 'fadeIn 0.6s ease-out 0.3s backwards',
            }}
          >
            <p
              style={{
                opacity: 0.7,
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                letterSpacing: '0.05em',
              }}
            >
              {t('payments.successPage.referenceLabel') ||
                'Transaction Reference'}
            </p>
            <code
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#86efac',
                display: 'block',
                wordBreak: 'break-all',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {paymentId || token}
            </code>
          </Card>
        )}

        <XStack
          gap="$6"
          mt="$6"
          style={{ animation: 'fadeIn 0.6s ease-out 0.4s backwards' }}
        >
          <LinkButton href="/" size="lg" variant="primary">
            {t('payments.successPage.returnHome') || 'Return Home'}
          </LinkButton>
          <LinkButton href="/payment" size="lg" variant="ghost">
            {t('payments.successPage.supportAgain') || 'Support Again'}
          </LinkButton>
        </XStack>
      </Container>
    </>
  );
}

export function PaymentSuccessView() {
  return (
    <PageLayout>
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Verify type check passes**

```bash
cd apps/web && pnpm exec tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Confirm zero styled-components imports remain in both directories**

```bash
grep -r "from 'styled-components'" apps/web/src/app/history/ apps/web/src/app/payment/
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/payment/success/PaymentSuccessView.tsx
git commit -m "refactor(payment): replace PaymentSuccessView styled-components with Tamagui — payment migration complete"
```

---

## Final verification

- [ ] **Run full type check one last time**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

- [ ] **Confirm no styled-components remain in history or payment**

```bash
grep -r "from 'styled-components'" apps/web/src/app/history/ apps/web/src/app/payment/
```

Expected: no output.
