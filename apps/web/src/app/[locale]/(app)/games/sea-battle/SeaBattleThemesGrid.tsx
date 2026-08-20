'use client';

import { SeaBattleThemeProvider } from '@/widgets/StrategyGames/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattleThemePreview';
import styles from './SeaBattleThemesGrid.module.scss';

const VARIANTS = [
  'adventure',
  'cyberpunk',
  'underwater',
  'crime',
  'horror',
  'high-altitude-hike',
  'galaxy',
  'fantasy',
  'western',
  'egypt',
  'steampunk',
  'zen',
] as const;

interface Props {
  names: Partial<Record<(typeof VARIANTS)[number], string>>;
}

/**
 * Real-colors theme strip on the SEO landing. Each tile is the same
 * SeaBattleThemePreview the lobby variant picker uses, wrapped in its
 * own SeaBattleThemeProvider so the canonical theme palette (board
 * background, ship/hit/miss/empty colors, border, etc.) is what shows
 * — not a hand-picked approximation. cellSize stays small to keep
 * ten tiles readable in one strip.
 */
export function SeaBattleThemesGrid({ names }: Props) {
  return (
    <div className={styles.grid}>
      {VARIANTS.map((variant) => (
        <figure key={variant} className={styles.chip}>
          <SeaBattleThemeProvider variant={variant}>
            <SeaBattleThemePreview selectedVariant={variant} cellSize={12} />
          </SeaBattleThemeProvider>
          <figcaption className={styles.name}>
            {names[variant] ?? variant}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
