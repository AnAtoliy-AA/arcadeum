import { styled, Anchor } from 'tamagui';

export const FooterLink = styled(Anchor, {
  name: 'FooterLink',
  color: '$color',
  opacity: 0.6,
  fontSize: 14,
  lineHeight: 20,
  textDecorationLine: 'none',

  variants: {
    alpha: {
      low: { opacity: 0.4 },
      medium: { opacity: 0.6 },
      high: { opacity: 0.8 },
    },
  } as const,

  hoverStyle: {
    opacity: 1,
    color: '$primary',
  },
});
