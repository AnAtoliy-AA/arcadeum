import { VARIANT_COLORS } from '../../variant-palette';

export const tableInfoStyles = {
  getBackground: () => 'rgba(2, 6, 23, 0.7)',
  getBorder: () => `${VARIANT_COLORS.underwater.primary}33`,
  getShadow: () => '0 8px 32px rgba(0, 0, 0, 0.5)',
  getTextGlow: () => VARIANT_COLORS.underwater.primary,
  getStatValueColor: (isWarning?: boolean) =>
    isWarning ? '#ef4444' : VARIANT_COLORS.underwater.primary,
  getStyles: () => ({
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '1.5rem',
  }),
  getTableStatStyles: () => ({
    background: 'rgba(2, 6, 23, 0.4)',
    borderRadius: '12px',
    border: `1px solid ${VARIANT_COLORS.underwater.primary}26`,
    '--stat-hover-bg': 'rgba(2, 6, 23, 0.6)',
    '--stat-hover-border': VARIANT_COLORS.underwater.primary,
    '--stat-hover-transform': 'scale(1.05)',
  }),
};
