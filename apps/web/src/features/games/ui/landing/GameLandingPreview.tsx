'use client';

import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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
  className,
  testId,
}: Props) {
  const { t } = useTranslation();
  const { theme, cycleTheme } = useGameLandingTheme();
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
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={resolvedAria}
        data-testid={testId}
        className="box-border inline-block cursor-pointer rounded-md transition-transform duration-200 ease-out hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
      >
        {render(theme)}
      </button>

      <p className="box-border m-0 mt-3 flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--textSecondary)] select-none">
        <span
          className="box-border h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary)]"
          aria-hidden="true"
        />
        <span>{resolvedLabel}</span>
        <span aria-hidden="true">·</span>
        <span className="box-border text-[13px] font-semibold normal-case tracking-normal text-[var(--foreground)]">
          {themeName}
        </span>
      </p>

      <span
        className="box-border mt-1 select-none whitespace-nowrap rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/20 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--foreground)] opacity-85"
        aria-hidden="true"
      >
        {resolvedCycleHint}
      </span>
    </div>
  );
}
