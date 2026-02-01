/**
 * CriticalTable styles - modular barrel export.
 *
 * This module composes all style sub-modules and re-exports
 * the unified createStyles function and types.
 */
import type { Palette } from '@/hooks/useThemedStyles';
import { createThemeContext, type StyleThemeContext } from './theme';
import { createShadows, type ShadowPresets } from './shadows';
import { createCardStyles, type CardStyles } from './card.styles';
import { createHeaderStyles, type HeaderStyles } from './header.styles';
import { createTableStyles, type TableStyles } from './table.styles';
import { createEffectStyles, type EffectStyles } from './effect.styles';
import { createSeatStyles, type SeatStyles } from './seat.styles';
import { createHandStyles, type HandStyles } from './hand.styles';
import { createComboStyles, type ComboStyles } from './combo.styles';
import { createButtonStyles, type ButtonStyles } from './button.styles';
import { createLogsStyles, type LogsStyles } from './logs.styles';
import { createFormStyles, type FormStyles } from './form.styles';

export type CriticalTableStyles = CardStyles &
  HeaderStyles &
  TableStyles &
  EffectStyles &
  SeatStyles &
  HandStyles &
  ComboStyles &
  ButtonStyles &
  LogsStyles &
  FormStyles;

/**
 * Create all CriticalTable styles from palette.
 */
export function createStyles(palette: Palette): CriticalTableStyles {
  const ctx = createThemeContext(palette);
  const shadows = createShadows(ctx);

  return {
    ...createCardStyles(ctx, shadows),
    ...createHeaderStyles(ctx),
    ...createTableStyles(ctx, shadows),
    ...createEffectStyles(ctx),
    ...createSeatStyles(ctx),
    ...createHandStyles(ctx, shadows),
    ...createComboStyles(ctx, shadows),
    ...createButtonStyles(ctx),
    ...createLogsStyles(ctx),
    ...createFormStyles(ctx),
  };
}

// Re-export theme context and shadows for components that need them directly
export { createThemeContext, createShadows };
export type { StyleThemeContext, ShadowPresets };
