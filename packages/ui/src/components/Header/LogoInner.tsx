import { styled, XStack } from 'tamagui';

export const LogoInner = styled(XStack, {
  name: 'LogoInner',
  alignItems: 'center',
  gap: '$3',
  flexShrink: 0,
  cursor: 'pointer',
  hoverStyle: {
    scale: 1.02,
    opacity: 0.95,
  },
}, {
  defaultProps: {
    animation: 'quick',
    'data-testid': 'logo-inner',
  },
});
