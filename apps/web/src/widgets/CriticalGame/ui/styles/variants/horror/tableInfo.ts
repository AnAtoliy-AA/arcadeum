import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.horror;

export const tableInfoStyles = {
  getBackground: () => 'rgba(2, 6, 23, 0.9)',
  getBorder: () => `${C.primary}26`,
  getShadow: () => '0 12px 48px rgba(0, 0, 0, 0.9)',
  getTextGlow: () => C.primary,
  getStatValueColor: (isWarning?: boolean) =>
    isWarning ? '#ef4444' : C.primary,
  getInfoCardBackground: () => 'rgba(15, 23, 42, 0.95)',
  getInfoCardBorder: () => `1px solid ${C.primary}1a`,
  getInfoCardShadow: () => '0 8px 32px rgba(0, 0, 0, 0.7)',
  getInfoCardPattern: () => 'none',
  getStyles: () => ({
    backdropFilter: 'blur(20px)',
    borderRadius: '2px',
    padding: '1.5rem',
  }),
  getTableStatStyles: () => ({
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 0,
    border: `1px solid ${C.primary}1a`,
    hoverStyle: {
      background: 'rgba(0, 0, 0, 0.8)',
      borderColor: C.primary,
      transform: [{ scale: 1.02 }],
    },
  }),
};
