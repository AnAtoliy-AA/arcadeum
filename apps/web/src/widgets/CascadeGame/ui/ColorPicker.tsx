'use client';

import { useCascadeTheme } from '../lib/CascadeThemeContext';
import { ACTIVE_COLORS, type ActiveColor } from '../types';
import styles from './CascadeGame.module.css';

interface ColorPickerProps {
  open: boolean;
  onPick: (color: ActiveColor) => void;
}

export function ColorPicker({ open, onPick }: ColorPickerProps) {
  const theme = useCascadeTheme();
  if (!open) return null;

  return (
    <div className={styles.pickerBackdrop}>
      <div
        role="dialog"
        aria-label="Choose active color"
        className={styles.pickerPanel}
      >
        <span className={styles.pickerTitle}>Choose a color</span>
        <div className={styles.pickerRow}>
          {ACTIVE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPick(c)}
              aria-label={`Pick ${c}`}
              className={styles.swatch}
              style={{ '--swatch-bg': theme.palette[c] } as React.CSSProperties}
            >
              <span className={styles.swatchLabel}>{theme.colorNames[c]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
