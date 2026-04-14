import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.adventure;

export const tableInfoStyles = {
  getBackground: () => 'rgba(28, 25, 23, 0.8)',
  getBorder: () => `${C.primary}33`,
  getShadow: () => '0 8px 32px rgba(0, 0, 0, 0.6)',
  getTextGlow: () => C.primary,
  getStatValueColor: (isWarning?: boolean) =>
    isWarning ? '#ef4444' : C.primary,
  getInfoCardBackground: () => 'rgba(41, 37, 34, 0.9)',
  getInfoCardBorder: () => `${C.primary}33`,
  getInfoCardShadow: () => '0 4px 20px rgba(0, 0, 0, 0.5)',
  getInfoCardPattern: () => 'none',
  getStyles: () => ({
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '1.5rem',
  }),
  getTableStatStyles: () => ({
    background: 'rgba(12, 10, 9, 0.4)',
    borderRadius: 8,
    border: `1px solid ${C.primary}26`,
    hoverStyle: {
      background: 'rgba(12, 10, 9, 0.6)',
      borderColor: C.primary,
      transform: [{ scale: 1.05 }],
    },
  }),
};
