import { VARIANT_COLORS } from '../../variant-palette';

export const tableInfoStyles = {
  getBackground: (): string =>
    `linear-gradient(135deg, ${VARIANT_COLORS.cyberpunk.background}f2, ${VARIANT_COLORS.cyberpunk.cardBack}e6)`,
  getBorder: (): string => `${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getShadow: (): string =>
    `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 0 1px ${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getTextGlow: (): string => VARIANT_COLORS.cyberpunk.primary,
  getStatValueColor: (): string => VARIANT_COLORS.cyberpunk.primary,
  getStyles: () => ({
    background: 'transparent',
    backdropFilter: 'none',
    boxShadow: 'none',
    padding: 0,
    gap: '0.25rem',
    top: '1.5rem',
    right: '1.5rem',
    borderWidth: 0,
  }),
  getTableStatStyles: () => ({
    background: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: `${VARIANT_COLORS.cyberpunk.primary}4d`,
    borderLeftWidth: 2,
    borderLeftColor: VARIANT_COLORS.cyberpunk.primary,
    borderRadius: 2,
    padding: '0.3rem 0.5rem',
    gap: '0.5rem',

    '--stat-hover-bg': `${VARIANT_COLORS.cyberpunk.primary}1a`,
    '--stat-hover-border': `${VARIANT_COLORS.cyberpunk.primary}99`,
    '--stat-hover-transform': 'translateX(-2px)',
  }),
};
