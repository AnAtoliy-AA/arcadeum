'use client';

import { useState } from 'react';
import { SeaBattleThemeProvider } from '@/widgets/StrategyGames/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattleThemePreview';
import styles from './SeaBattleLandingBoard.module.scss';

const ROTATING_THEMES = [
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'adventure',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;

type Theme = (typeof ROTATING_THEMES)[number];

interface Props {
  initialTheme?: Theme;
  themeNames?: Partial<Record<Theme, string>>;
  label: string;
  cycleHint: string;
  cycleAriaLabel: string;
  onThemeChange?: (theme: Theme) => void;
  onVariantChange?: (theme: Theme) => void;
}

export function SeaBattleLandingBoard({
  initialTheme = 'cyberpunk',
  themeNames,
  label,
  cycleHint,
  cycleAriaLabel,
  onThemeChange,
  onVariantChange,
}: Props) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const themeName =
    themeNames?.[theme] ??
    theme.charAt(0).toUpperCase() + theme.slice(1).replace(/-/g, ' ');

  const cycle = () => {
    const idx = ROTATING_THEMES.indexOf(theme);
    const next =
      ROTATING_THEMES[(idx + 1) % ROTATING_THEMES.length] ?? ROTATING_THEMES[0];
    setTheme(next);
    onThemeChange?.(next);
    onVariantChange?.(next);
  };

  const ariaLabel = cycleAriaLabel.replace('{{variant}}', themeName);

  return (
    <div className={styles.frame}>
      <button
        type="button"
        onClick={cycle}
        className={styles.scaler}
        aria-label={ariaLabel}
        data-testid="sea-battle-landing-board"
      >
        <SeaBattleThemeProvider variant={theme}>
          <SeaBattleThemePreview selectedVariant={theme} cellSize={20} />
        </SeaBattleThemeProvider>
      </button>
      <p className={styles.caption} aria-hidden="true">
        <span className={styles.captionDot} />
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <span className={styles.captionName}>{themeName}</span>
      </p>
      <span className={styles.cycleHint} aria-hidden="true">
        {cycleHint}
      </span>
    </div>
  );
}
