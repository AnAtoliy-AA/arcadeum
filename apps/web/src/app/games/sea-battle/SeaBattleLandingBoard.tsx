'use client';

import { useState } from 'react';
import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';
import styles from './SeaBattleLandingBoard.module.css';

const ROTATING_VARIANTS = [
  'classic',
  'modern',
  'cyber',
  'nebula',
  'pixel',
  'vintage',
] as const;

interface Props {
  initialVariant?: (typeof ROTATING_VARIANTS)[number];
}

/**
 * Hero visual on the SEO landing: the actual in-game board preview
 * (the same component the variant picker uses in the lobby), so the
 * page hero shows what the game really looks like — not a hand-rolled
 * decoration. Cycles through a few themes on hover/tap so visitors
 * see the variety without scrolling to the themes strip below.
 */
export function SeaBattleLandingBoard({ initialVariant = 'classic' }: Props) {
  const [variant, setVariant] = useState<string>(initialVariant);

  const cycle = () => {
    const idx = ROTATING_VARIANTS.indexOf(
      variant as (typeof ROTATING_VARIANTS)[number],
    );
    const next =
      ROTATING_VARIANTS[(idx + 1) % ROTATING_VARIANTS.length] ??
      ROTATING_VARIANTS[0];
    setVariant(next);
  };

  return (
    <div className={styles.frame} aria-hidden="true">
      <button
        type="button"
        onClick={cycle}
        className={styles.scaler}
        aria-label="Cycle theme preview"
        data-testid="sea-battle-landing-board"
      >
        <SeaBattleThemeProvider variant={variant}>
          <SeaBattleThemePreview selectedVariant={variant} cellSize={36} />
        </SeaBattleThemeProvider>
      </button>
    </div>
  );
}
