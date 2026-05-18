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

type Variant = (typeof ROTATING_VARIANTS)[number];

interface Props {
  initialVariant?: Variant;
  /** Localised display name per variant (from sea_battle_v1.variants.{id}.name). */
  variantNames: Partial<Record<Variant, string>>;
  /** Localised "Live preview" label. */
  label: string;
  /** Localised "Click to change theme" hover hint. */
  cycleHint: string;
  /** Localised aria-label template containing `{{variant}}`. */
  cycleAriaLabel: string;
  /** Bubble the cycled variant up to the parent so Quickplay can use it. */
  onVariantChange?: (variant: Variant) => void;
}

export function SeaBattleLandingBoard({
  initialVariant = 'classic',
  variantNames,
  label,
  cycleHint,
  cycleAriaLabel,
  onVariantChange,
}: Props) {
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const variantName = variantNames[variant] ?? variant;

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
          <SeaBattleThemePreview selectedVariant={variant} cellSize={36} />
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
