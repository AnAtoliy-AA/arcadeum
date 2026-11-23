import type { ReactNode } from 'react';

interface GameSectionHeadingProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** Optional element aligned to the end of the heading (e.g. a link). */
  action?: ReactNode;
}

/** Shared section header: kicker, title and subtitle with one spacing scale. */
export function GameSectionHeading({
  kicker,
  title,
  subtitle,
  action,
}: GameSectionHeadingProps) {
  if (!kicker && !title && !subtitle) return null;
  return (
    <div className="box-border flex items-end justify-between gap-4">
      <div className="box-border flex flex-col gap-2 max-w-2xl">
        {kicker ? (
          <span className="box-border inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
            <span
              aria-hidden="true"
              className="box-border h-0.5 w-6 rounded-full bg-[var(--primary)]"
            />
            {kicker}
          </span>
        ) : null}
        {title ? (
          <h2 className="box-border m-0 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-[var(--foreground)]">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="box-border m-0 text-sm sm:text-base leading-relaxed text-[var(--foreground)] opacity-80">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="box-border shrink-0">{action}</div> : null}
    </div>
  );
}
