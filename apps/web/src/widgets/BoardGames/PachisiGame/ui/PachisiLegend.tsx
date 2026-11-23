import type { ReactElement } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';

function Swatch({
  className,
  children,
}: {
  className: string;
  children?: ReactElement | string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border text-[9px] font-bold leading-none ${className}`}
    >
      {children}
    </span>
  );
}

/** Compact key explaining star cells, start cells, stacks and move hints. */
export function PachisiLegend(): ReactElement {
  const { t } = useTranslation();
  const base = 'games.pachisi_v1.game.legend';
  return (
    <ul
      aria-label={t(`${base}.title`)}
      className="m-0 flex w-full list-none flex-wrap items-center justify-center gap-x-3 gap-y-1 p-0 text-[11px] leading-tight text-[var(--textMuted,currentColor)] opacity-90"
      data-testid="pachisi-legend"
    >
      <li className="flex items-center gap-1">
        <Swatch className="pachisi-cell border-[var(--pachisi-cell-border)] text-[var(--pachisi-safe-star)]">
          ★
        </Swatch>
        {t(`${base}.safe`)}
      </li>
      <li className="flex items-center gap-1">
        <Swatch className="pachisi-cell-seat-0 border-[var(--pachisi-cell-border)]" />
        {t(`${base}.start`)}
      </li>
      <li className="flex items-center gap-1">
        <Swatch className="border-amber-400/60 bg-amber-950/80 text-amber-300">
          2
        </Swatch>
        {t(`${base}.stack`)}
      </li>
      <li className="flex items-center gap-1">
        <Swatch className="pachisi-cell-dest-active border-transparent" />
        {t(`${base}.destination`)}
      </li>
      <li className="flex items-center gap-1">
        <Swatch className="pachisi-cell-dest-capture border-transparent" />
        {t(`${base}.capture`)}
      </li>
    </ul>
  );
}
