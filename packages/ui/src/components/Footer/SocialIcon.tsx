import { styled, Anchor } from 'tamagui';

export const SocialIcon = styled(Anchor, {
  name: 'SocialIcon',
  display: 'flex',
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$color',
  opacity: 0.8,
  hoverStyle: {
    backgroundColor: '$glassBgHover',
    borderColor: '$primary',
    color: '$primary',
    scale: 1.1,
    rotate: '8deg',
    opacity: 1,
    shadowColor: '$primary',
    shadowRadius: 12,
    shadowOpacity: 0.15,
  },
  pressStyle: {
    scale: 0.95,
  },
}, {
  defaultProps: {
    animation: 'quick',
  },
});
