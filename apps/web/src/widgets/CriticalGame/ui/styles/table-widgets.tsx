import { styled, XStack, Text } from 'tamagui';
import { Button, ButtonProps, GameVariant } from '@arcadeum/ui';
import { getVariantStyles } from './variants';

export const InfoTitle = styled(Text, {
  name: 'InfoTitle',
  fontSize: 14,
  fontWeight: '800',
  color: '$color',
  textTransform: 'uppercase',
  letterSpacing: 1,
  position: 'relative',
  paddingBottom: '$2',

  $sm: {
    fontSize: 12,
    marginBottom: '$1.5',
  },

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).table.actions;
      return {
        ...config?.getTitleStyles?.(),
      };
    },
  } as const,
});

export const ActionsHeader = styled(XStack, {
  name: 'ActionsHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$6',
  position: 'relative',

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).table.actions;
      return {
        ...config?.getContainerStyles?.(),
      };
    },
  } as const,
});

interface ActionsToggleButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: string;
  $variant?: string;
}

export const ActionsToggleButton = ({
  variant,
  $variant,
  ...props
}: ActionsToggleButtonProps) => (
  <Button
    variant="icon"
    size="sm"
    gameVariant={(variant || $variant) as GameVariant}
    {...props}
  />
);
