'use client';
import { Button, Input } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import type { ChangeEvent } from 'react';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export type Scope =
  'global' | 'perGame' | 'tournaments' | 'friends' | 'regional';

export type Range = 'today' | 'week' | 'month' | 'season';

const SCOPES: Scope[] = [
  'global',
  'perGame',
  'tournaments',
  'friends',
  'regional',
];
const RANGES: Range[] = ['today', 'week', 'month', 'season'];

function SegBtn({
  active,
  className,
  children,
  onClick,
  tabIndex,
  'aria-selected': ariaSelected,
  'data-testid': dataTestId,
}: {
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  tabIndex?: number;
  'aria-selected'?: boolean | 'true' | 'false';
  'data-testid'?: string;
}) {
  return (
    <div
      role="tab"
      aria-selected={ariaSelected}
      tabIndex={tabIndex}
      onClick={onClick}
      data-testid={dataTestId}
      className={cx(
        'flex flex-row items-center cursor-pointer rounded-lg border px-3 py-2 hover:bg-[rgba(255,255,255,0.04)]',
        active
          ? 'border-[var(--mythicAccent)] bg-[rgba(236,72,153,0.12)]'
          : 'border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

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
    <div className="flex flex-row items-center gap-3 justify-between flex-wrap">
      <div
        className="flex flex-row items-stretch gap-2 flex-wrap"
        role="tablist"
        aria-label="Leaderboard scope"
      >
        {SCOPES.map((s) => (
          <SegBtn
            key={s}
            active={scope === (s as never)}
            aria-selected={scope === s}
            tabIndex={scope === s ? 0 : -1}
            onClick={() => onScopeChange(s)}
            data-testid={`scope-${s}`}
          >
            <span
              className={cx(
                'text-[14px]',
                scope === s
                  ? 'font-bold text-[var(--mythicAccent)]'
                  : 'font-medium',
              )}
            >
              {(tt[s] as string) ?? s}
            </span>
          </SegBtn>
        ))}
      </div>
      <div className="flex flex-row gap-2 flex-wrap items-center">
        <div className="flex flex-col items-stretch">
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
        </div>
        <Input
          className={'w-[200px]'}
          placeholder={(tt.searchPlaceholder as string) ?? 'Find player…'}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
      </div>
    </div>
  );
}
