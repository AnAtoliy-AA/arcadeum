import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

interface LobbyCardShellProps {
  title: string;
  description?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

/** Labelled settings card: icon + title + optional hint, then content. */
export function LobbyCardShell({
  title,
  description,
  icon,
  children,
  className,
  'data-testid': testId,
}: LobbyCardShellProps) {
  return (
    <section
      data-testid={testId}
      aria-label={title}
      className={cx(
        'flex w-full flex-col gap-4 rounded-2xl border border-[var(--glassBorder)] bg-[var(--surface)]/70 p-5 shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <header className="flex flex-col gap-0.5">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--textPrimary)]">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--textSecondary)]">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
