'use client';

import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';
import styles from './SeaBattleThemesGrid.module.scss';

// Order matches the i18n variants block in sea-battle messages.
const VARIANTS = [
  'classic',
  'modern',
  'pixel',
  'cartoon',
  'cyber',
  'vintage',
  'nebula',
  'forest',
  'sunset',
  'monochrome',
] as const;

interface Props {
  /** Display name per variant, keyed by variant id — taken straight
   * from the existing sea_battle_v1.variants.{variant}.name i18n keys. */
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
