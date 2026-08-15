import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.crime;

export const tableInfoStyles = {
  getBackground: () => 'rgba(9, 9, 11, 0.85)',
  getBorder: () => `${C.primary}4d`,
  getShadow: () => '0 8px 32px rgba(0, 0, 0, 0.7)',
  getTextGlow: () => C.primary,
  getStatValueColor: (isWarning?: boolean) =>
    isWarning ? '#ef4444' : C.primary,
  getStyles: () => ({
    backdropFilter: 'blur(12px)',
    borderRadius: '4px',
    padding: '1.25rem',
  }),
  getTableStatStyles: () => ({
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 2,
    border: `1px solid ${C.primary}26`,
    hoverStyle: {
      background: 'rgba(0, 0, 0, 0.6)',
      borderColor: C.primary,
    },
  }),
};
