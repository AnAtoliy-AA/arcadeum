'use client';

import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { useGameLandingTheme } from './GameLandingThemeContext';

interface Props {
  /** Themed preview art; receives the current shared theme id. */
  render: (themeId: string) => ReactNode;
  label?: string;
  cycleHint?: string;
  cycleAriaLabel?: string;
  /** i18n keys under `games.landing` used when prop overrides are absent. */
  labelKey?: TranslationKey;
  cycleHintKey?: TranslationKey;
  cycleAriaLabelKey?: TranslationKey;
  themeNames?: Partial<Record<string, string>>;
  interactive?: boolean;
  className?: string;
  testId?: string;
}

function themeDisplayName(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
}

/**
 * Clickable hero preview for game landings.
 *
 * Renders the game's themed preview art inside a button; clicking cycles
 * through the shared visual themes. The selected theme is stored in
 * `GameLandingThemeContext` so the hero's "Play vs AI" and "Create Room"
 * CTAs preselect it. The landing page itself is never restyled.
 */
export function GameLandingPreview({
  render,
  label,
  cycleHint,
  cycleAriaLabel,
  labelKey = 'games.landing.previewLabel',
  cycleHintKey = 'games.landing.cycleHint',
  cycleAriaLabelKey = 'games.landing.cycleAriaLabel',
  themeNames,
  interactive = false,
  className,
  testId,
}: Props) {
  const { t } = useTranslation();
  const { theme, cycleTheme, cyclePrevTheme } = useGameLandingTheme();
  const themeName = themeNames?.[theme] ?? themeDisplayName(theme);
  const resolvedLabel = label ?? t(labelKey);
  const resolvedCycleHint = cycleHint ?? t(cycleHintKey);
  const resolvedAria = (cycleAriaLabel ?? t(cycleAriaLabelKey)).replace(
    '{{variant}}',
    themeName,
  );

  return (
    <div
      className={cx(
        'box-border relative flex flex-col items-center w-fit max-w-full',
        className,
      )}
    >
      {interactive ? (
        <div data-testid={testId} className="box-border inline-block w-full">
          {render(theme)}
        </div>
      ) : (
        <button
          type="button"
          onClick={cycleTheme}
          aria-label={resolvedAria}
          data-testid={testId}
          className="box-border inline-block cursor-pointer rounded-md transition-transform duration-200 ease-out hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
        >
          {render(theme)}
        </button>
      )}

      <div className="box-border m-0 mt-3 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--textSecondary)] select-none">
        <button
          type="button"
          onClick={cyclePrevTheme}
          aria-label="Previous theme"
          data-testid="prev-theme-button"
          className="box-border flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--borderColor)] bg-[var(--surfaceBackground)] text-[12px] text-[var(--foreground)] opacity-90 hover:opacity-100 hover:border-[var(--primary)] transition-all"
        >
          ‹
        </button>
        <div className="box-border flex w-[210px] shrink-0 items-center justify-center gap-1.5 px-1 text-center">
          <span
            className="box-border h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary)]"
            aria-hidden="true"
          />
          <span className="shrink-0">{resolvedLabel}</span>
          <span aria-hidden="true" className="shrink-0">
            ·
          </span>
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={resolvedAria}
            data-testid="current-theme-button"
            className="box-border truncate cursor-pointer bg-transparent border-none p-0 text-[13px] font-semibold normal-case tracking-normal text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
          >
            {themeName}
          </button>
        </div>
        <button
          type="button"
          onClick={cycleTheme}
          aria-label="Next theme"
          data-testid="next-theme-button"
          className="box-border flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--borderColor)] bg-[var(--surfaceBackground)] text-[12px] text-[var(--foreground)] opacity-90 hover:opacity-100 hover:border-[var(--primary)] transition-all"
        >
          ›
        </button>
      </div>

      <button
        type="button"
        onClick={cycleTheme}
        data-testid="cycle-theme-button"
        className="box-border mt-1.5 cursor-pointer select-none whitespace-nowrap rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/20 hover:bg-[var(--primary)]/35 hover:scale-105 active:scale-95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition-all opacity-90"
      >
        {resolvedCycleHint}
      </button>
    </div>
  );
}
