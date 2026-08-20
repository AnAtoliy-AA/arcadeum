'use client';

import { useState } from 'react';
import { SeaBattleThemeProvider } from '@/widgets/StrategyGames/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattleThemePreview';
import styles from './SeaBattleLandingBoard.module.scss';

const ROTATING_VARIANTS = [
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

type Variant = (typeof ROTATING_VARIANTS)[number];

interface Props {
  initialVariant?: Variant;
  variantNames?: Partial<Record<Variant, string>>;
  label: string;
  cycleHint: string;
  cycleAriaLabel: string;
  onVariantChange?: (variant: Variant) => void;
}

export function SeaBattleLandingBoard({
  initialVariant = 'cyberpunk',
  variantNames,
  label,
  cycleHint,
  cycleAriaLabel,
  onVariantChange,
}: Props) {
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const variantName =
    variantNames?.[variant] ??
    variant.charAt(0).toUpperCase() + variant.slice(1).replace(/-/g, ' ');

  const cycle = () => {
    const idx = ROTATING_VARIANTS.indexOf(variant);
    const next =
      ROTATING_VARIANTS[(idx + 1) % ROTATING_VARIANTS.length] ??
      ROTATING_VARIANTS[0];
    setVariant(next);
    onVariantChange?.(next);
  };

  const ariaLabel = cycleAriaLabel.replace('{{variant}}', variantName);

  return (
    <div className={styles.frame}>
      <button
        type="button"
        onClick={cycle}
        className={styles.scaler}
        aria-label={ariaLabel}
        data-testid="sea-battle-landing-board"
      >
        <SeaBattleThemeProvider variant={variant}>
          <SeaBattleThemePreview selectedVariant={variant} cellSize={20} />
        </SeaBattleThemeProvider>
      </button>
      <p className={styles.caption} aria-hidden="true">
        <span className={styles.captionDot} />
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <span className={styles.captionName}>{variantName}</span>
      </p>
      <span className={styles.cycleHint} aria-hidden="true">
        {cycleHint}
      </span>
    </div>
  );
}
