import { VARIANT_COLORS } from '../../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const tableInfoStyles = {
  getBackground: () => 'rgba(2, 6, 23, 0.8)',
  getBorder: () => `${COLORS.primary}33`,
  getShadow: () => '0 12px 48px rgba(0, 0, 0, 0.6)',
  getTextGlow: () => COLORS.primary,
  getStatValueColor: (isWarning?: boolean) =>
    isWarning ? '#ef4444' : COLORS.primary,
  getInfoCardBackground: () => 'rgba(15, 23, 42, 0.9)',
  getInfoCardBorder: () => `${COLORS.primary}26`,
  getInfoCardShadow: () => '0 8px 32px rgba(0, 0, 0, 0.5)',
  getInfoCardPattern: () => 'none',
  getStyles: () => ({
    backdropFilter: 'blur(16px)',
    borderRadius: '8px',
    padding: '1.5rem',
  }),
  getTableStatStyles: () => ({
    background: 'rgba(2, 6, 23, 0.4)',
    borderRadius: 8,
    border: `1px solid ${COLORS.primary}1a`,
    hoverStyle: {
      background: 'rgba(2, 6, 23, 0.6)',
      borderColor: COLORS.primary,
      transform: [{ scale: 1.05 }],
    },
  }),
};
