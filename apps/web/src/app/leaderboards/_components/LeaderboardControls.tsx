'use client';
import { XStack, YStack, Text, Input, styled } from 'tamagui';
import { Button } from '@arcadeum/ui';
import type { ChangeEvent } from 'react';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export type Scope =
  | 'global'
  | 'perGame'
  | 'tournaments'
  | 'friends'
  | 'regional';

export type Range = 'today' | 'week' | 'month' | 'season';

const SCOPES: Scope[] = [
  'global',
  'perGame',
  'tournaments',
  'friends',
  'regional',
];
const RANGES: Range[] = ['today', 'week', 'month', 'season'];

const SegBtn = styled(XStack, {
  name: 'SegBtn',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$2',
  borderWidth: 1,
  cursor: 'pointer',
  alignItems: 'center',
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.04)' },
  variants: {
    active: {
      true: {
        borderColor: '$mythicAccent',
        backgroundColor: 'rgba(236,72,153,0.12)',
      },
      false: {
        borderColor: '$borderColor',
        backgroundColor: 'rgba(255,255,255,0.02)',
      },
    },
  } as const,
});

export function LeaderboardControls({
  scope,
  onScopeChange,
  range,
  onRangeChange,
  search,
  onSearchChange,
  onJumpToSelf,
  t,
}: {
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  range: Range;
  onRangeChange: (r: Range) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onJumpToSelf?: () => void;
  t?: PageTranslations;
}) {
  const tt = (t?.controls ?? {}) as Record<string, string | object>;
  const ranges = (tt.ranges as Record<string, string>) ?? {};

  return (
    <XStack
      justifyContent="space-between"
      gap="$3"
      flexWrap="wrap"
      alignItems="center"
    >
      <XStack
        gap="$2"
        flexWrap="wrap"
        role="tablist"
        aria-label="Leaderboard scope"
      >
        {SCOPES.map((s) => (
          <SegBtn
            key={s}
            active={scope === (s as never)}
            role="tab"
            aria-selected={scope === s}
            tabIndex={scope === s ? 0 : -1}
            onPress={() => onScopeChange(s)}
            testID={`scope-${s}`}
          >
            <Text
              fontSize="$2"
              fontWeight={scope === s ? '700' : '500'}
              color={scope === s ? '$mythicAccent' : undefined}
            >
              {(tt[s] as string) ?? s}
            </Text>
          </SegBtn>
        ))}
      </XStack>
      <XStack gap="$2" flexWrap="wrap" alignItems="center">
        <YStack>
          <select
            value={range}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onRangeChange(e.target.value as Range)
            }
            data-testid="range-select"
            aria-label="Time range"
            style={{
              background: 'rgba(255,255,255,0.02)',
              color: 'inherit',
              border: '1px solid var(--borderColor)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
            }}
          >
            {RANGES.map((r) => (
              <option key={r} value={r}>
                {ranges[r] ?? r}
              </option>
            ))}
          </select>
        </YStack>
        <Input
          width={200}
          placeholder={(tt.searchPlaceholder as string) ?? 'Find player…'}
          value={search}
          onChangeText={onSearchChange}
          data-testid="leaderboard-search"
        />
        {onJumpToSelf ? (
          <Button
            variant="ghost"
            onClick={onJumpToSelf}
            data-testid="leaderboard-jump-to-me"
            aria-label={(tt.jumpToMe as string) ?? 'Jump to me'}
          >
            {(tt.jumpToMe as string) ?? '↓ Jump to me'}
          </Button>
        ) : null}
      </XStack>
    </XStack>
  );
}
