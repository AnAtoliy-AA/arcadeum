import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface PlatformComparisonColumn {
  key: string;
  name: string;
  isHighlighted?: boolean;
  badge?: string;
  subtext?: string;
}

export interface PlatformComparisonRow {
  feature: string;
  hint?: string;
  values: Record<string, boolean | string | ReactNode>;
}

export interface PlatformComparisonTableProps {
  title?: string;
  kicker?: string;
  subtitle?: string;
  columns?: PlatformComparisonColumn[];
  rows: PlatformComparisonRow[];
  className?: string;
  testId?: string;
}

const DEFAULT_COLUMNS: PlatformComparisonColumn[] = [
  {
    key: 'arcadeum',
    name: 'Arcadeum Games',
    isHighlighted: true,
    badge: '100% Free · Included',
  },
];

export function PlatformComparisonTable({
  title,
  kicker,
  subtitle,
  columns,
  rows,
  className,
  testId = 'platform-comparison-table',
}: PlatformComparisonTableProps) {
  const resolvedColumns = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const isSingleColumn = resolvedColumns.length === 1;

  if (!rows || rows.length === 0) return null;

  return (
    <section
      data-testid={testId}
      className={cx(
        'relative overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 sm:p-8 backdrop-blur-md',
        className,
      )}
    >
      {kicker || title || subtitle ? (
        <header className="mb-6 flex flex-col gap-1.5">
          {kicker ? (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
              {kicker}
            </span>
          ) : null}
          {title ? (
            <h3 className="m-0 text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="m-0 text-sm text-[var(--foreground)] opacity-75 max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--borderColor)] bg-[var(--surfaceBackground)]/30">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--borderColor)] bg-[var(--surfaceBackground)]/60">
              <th
                scope="col"
                className={cx(
                  'p-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-70',
                  isSingleColumn ? 'w-full' : 'min-w-[200px]',
                )}
              >
                Feature & Advantage
              </th>
              {resolvedColumns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(
                    'p-4 text-center',
                    isSingleColumn ? 'min-w-[220px]' : 'min-w-[140px]',
                    col.isHighlighted
                      ? 'bg-[var(--primary)]/15 border-x border-[var(--primary)]/30'
                      : '',
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={cx(
                        'text-sm font-bold',
                        col.isHighlighted
                          ? 'text-[var(--color)]'
                          : 'text-[var(--foreground)]',
                      )}
                    >
                      {col.name}
                    </span>
                    {col.badge ? (
                      <span className="rounded-full bg-[var(--primary)] text-[var(--primaryForeground,white)] px-2 py-0.5 text-[10px] font-bold">
                        {col.badge}
                      </span>
                    ) : null}
                    {col.subtext ? (
                      <span className="text-[11px] text-[var(--foreground)] opacity-60">
                        {col.subtext}
                      </span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--borderColor)]">
            {rows.map((row) => (
              <tr
                key={row.feature}
                className="transition-colors hover:bg-[var(--surfaceBackground)]/50"
              >
                <th scope="row" className="p-4 font-medium text-[var(--foreground)]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">{row.feature}</span>
                    {row.hint ? (
                      <span className="text-xs text-[var(--foreground)] opacity-60 font-normal">
                        {row.hint}
                      </span>
                    ) : null}
                  </div>
                </th>
                {resolvedColumns.map((col) => {
                  const val = row.values[col.key];
                  const isHighlighted = col.isHighlighted;

                  return (
                    <td
                      key={col.key}
                      className={cx(
                        'p-4 text-center align-middle',
                        isHighlighted
                          ? 'bg-[var(--primary)]/10 font-semibold border-x border-[var(--primary)]/30'
                          : '',
                      )}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <span
                            className={cx(
                              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black',
                              isHighlighted
                                ? 'bg-[var(--success,#22c55e)]/20 text-[var(--success,#22c55e)] border border-[var(--success,#22c55e)]/40'
                                : 'bg-[var(--surfaceBackground)] text-[var(--foreground)] opacity-80',
                            )}
                            aria-label="Supported"
                          >
                            <span>✓</span>
                            {isSingleColumn ? <span>Included</span> : null}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black bg-[var(--danger,#ef4444)]/15 text-[var(--danger,#ef4444)]"
                            aria-label="Not supported"
                          >
                            ✕
                          </span>
                        )
                      ) : (
                        <span
                          className={cx(
                            'text-xs sm:text-sm',
                            isSingleColumn
                              ? 'inline-flex items-center px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--foreground)] font-bold border border-[var(--primary)]/30'
                              : isHighlighted
                              ? 'text-[var(--foreground)] font-bold'
                              : 'text-[var(--foreground)] opacity-80',
                          )}
                        >
                          {val ?? '—'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

PlatformComparisonTable.displayName = 'PlatformComparisonTable';
