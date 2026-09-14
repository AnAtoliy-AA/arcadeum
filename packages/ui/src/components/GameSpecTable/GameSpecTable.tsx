import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface GameSpecItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  badge?: string;
  hint?: string;
}

export interface GameSpecTableProps {
  title?: string;
  kicker?: string;
  items: GameSpecItem[];
  className?: string;
  testId?: string;
}

export function GameSpecTable({
  title,
  kicker,
  items,
  className,
  testId = 'game-spec-table',
}: GameSpecTableProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      data-testid={testId}
      className={cx(
        'relative overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 sm:p-8 backdrop-blur-md',
        className,
      )}
    >
      {kicker || title ? (
        <header className="mb-6 flex flex-col gap-1">
          {kicker ? (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
              {kicker}
            </span>
          ) : null}
          {title ? (
            <h2 className="m-0 text-xl sm:text-2xl font-bold text-[var(--foreground)]">
              {title}
            </h2>
          ) : null}
        </header>
      ) : null}

      <dl className="m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1.5 rounded-xl border border-[var(--borderColor)] bg-[var(--surfaceBackground)]/40 p-4 transition-colors hover:border-[var(--primary)]/50"
          >
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-85">
              {item.icon ? (
                <span className="text-base text-[var(--primary)]" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color)]">
                  {item.badge}
                </span>
              ) : null}
            </dt>
            <dd className="m-0 text-sm sm:text-base font-semibold text-[var(--foreground)] leading-snug">
              {item.value}
              {item.hint ? (
                <span className="block mt-1 text-xs text-[var(--foreground)] opacity-80 leading-normal">
                  {item.hint}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

GameSpecTable.displayName = 'GameSpecTable';
