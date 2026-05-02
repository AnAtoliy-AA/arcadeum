import { styled, YStack, TamaguiComponent } from 'tamagui';
import { sharedButtonVariants, sharedButtonSizes } from './SharedButtonStyles';

export const StyledLinkButton = styled(YStack, {
  name: 'LinkButton',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  borderRadius: '$4',
  cursor: 'pointer',

  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
    outlineColor: 'transparent',
  },

  variants: {
    ...sharedButtonSizes,
    ...sharedButtonVariants,

    fullWidth: {
      true: { width: '100%' },
    },
    isActive: {
      true: {
        opacity: 0.8,
        backgroundColor: '$glassBgHover',
      },
    },
    circular: {
      true: {
        borderRadius: 999,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    $uiSize: 'md',
  },
});
