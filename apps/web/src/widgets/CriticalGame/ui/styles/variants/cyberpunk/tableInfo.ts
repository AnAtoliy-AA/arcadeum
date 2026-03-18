import { VARIANT_COLORS } from '../../variant-palette';

export const tableInfoStyles = {
  getBackground: (): string =>
    `linear-gradient(135deg, ${VARIANT_COLORS.cyberpunk.background}f2, ${VARIANT_COLORS.cyberpunk.cardBack}e6)`,
  getBorder: (): string => `${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getShadow: (): string =>
    `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 0 1px ${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getTextGlow: (): string => VARIANT_COLORS.cyberpunk.primary,
  getStatValueColor: (): string => VARIANT_COLORS.cyberpunk.primary,
  getInfoCardBackground: (): string =>
    `linear-gradient(135deg, ${VARIANT_COLORS.cyberpunk.background}f2, ${VARIANT_COLORS.cyberpunk.cardBack}e6)`,
  getInfoCardBorder: (): string => `${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getInfoCardShadow: (): string =>
    `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 0 1px ${VARIANT_COLORS.cyberpunk.secondary}4d`,
  getInfoCardPattern: (): string => `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    ${VARIANT_COLORS.cyberpunk.secondary}08 10px,
    ${VARIANT_COLORS.cyberpunk.secondary}08 20px
  )`,
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

    hoverStyle: {
      background: `${VARIANT_COLORS.cyberpunk.primary}1a`,
      borderColor: `${VARIANT_COLORS.cyberpunk.primary}99`,
      transform: [{ translateX: -2 }],
    },
  }),
  getInfoCardStyles: () => ({
    background: 'rgba(10, 5, 20, 0.7)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: `${VARIANT_COLORS.cyberpunk.primary}4d`,
    borderRadius: 4,
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    clipPath:
      'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',

    after: {
      content: '""',
      position: 'absolute',
      inset: -1,
      background: `
        linear-gradient(
          135deg,
          rgba(236, 72, 153, 0) 90%,
          rgba(236, 72, 153, 0.1) 100%
        ),
        linear-gradient(
            to right,
            ${VARIANT_COLORS.cyberpunk.primary} 2px,
            transparent 2px
          )
          0 0 / 20px 20px no-repeat,
        linear-gradient(
            to bottom,
            ${VARIANT_COLORS.cyberpunk.primary} 2px,
            transparent 2px
          )
          0 0 / 20px 20px no-repeat,
        linear-gradient(
            to left,
            ${VARIANT_COLORS.cyberpunk.primary} 2px,
            transparent 2px
          )
          100% 0 / 20px 20px no-repeat,
        linear-gradient(
            to bottom,
            ${VARIANT_COLORS.cyberpunk.primary} 2px,
            transparent 2px
          )
          100% 0 / 20px 20px no-repeat
      `,
      pointerEvents: 'none',
    },
  }),
};
