import { styled, XStack, YStack, Text } from 'tamagui';
import { Button, IconButton } from '@arcadeum/ui';
import type { ButtonProps } from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { TamaguiTheme } from './variants/types';

// Header Components
export const GameHeader = styled(XStack, {
  name: 'GameHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$4',
  paddingHorizontal: '$7',
  paddingVertical: '$4',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  marginHorizontal: -28, // Match $7 (28px) padding
  marginTop: -28,
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: 30,
  flexShrink: 0,

  $sm: {
    paddingHorizontal: '$4',
    paddingVertical: '$3',
    marginHorizontal: -8, // Match $2 (8px) padding
    marginTop: -8,
  },

  variants: {
    $variant: (val: string, { theme }: { theme: TamaguiTheme }) => {
      const config = getVariantStyles(val).header;
      return {
        backgroundColor: config.getBackground(theme),
        borderBottomColor: config.getBorder(theme),
      };
    },
  } as const,
});

export const HeaderActions = styled(XStack, {
  name: 'HeaderActions',
  gap: '$2',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
});

export const TimerControlsWrapper = styled(XStack, {
  name: 'TimerControlsWrapper',
  alignItems: 'center',
  gap: 8,
  zIndex: 10,
});

export const GameInfo = styled(YStack, {
  name: 'GameInfo',
  width: '100%',
  alignItems: 'center',
  marginTop: '$4',
  gap: '$2',
});

export const GameTitle = styled(Text, {
  name: 'GameTitle',
  margin: 0,
  fontSize: 24, // 1.5rem
  fontWeight: '800',
  letterSpacing: -0.3,
  position: 'relative',

  $sm: {
    fontSize: 20, // 1.25rem
  },

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).header;
      return {
        backgroundColor: config.getTitleBackground(),
        ...config.getTitleTextStyles?.(),
      };
    },
  } as const,
});

export const TurnStatus = styled(Text, {
  name: 'TurnStatus',
  fontSize: 14, // 0.875rem
  fontWeight: '600',

  variants: {
    $status: {
      yourTurn: { color: '$success' },
      waiting: { color: '$warning' },
      completed: { color: '$secondary' },
      default: { color: '$color', opacity: 0.7 },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});

export const StartButton = (props: ButtonProps) => (
  <Button variant="secondary" {...props} />
);

export const FullscreenButton = (props: ButtonProps) => (
  <IconButton
    size="sm"
    padding="$2"
    borderRadius={8}
    pressStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
    {...props}
  />
);

export const ChatToggleButton = ({ isActive, ...props }: ButtonProps) => (
  <Button
    variant="secondary"
    size="sm"
    paddingHorizontal="$4"
    paddingVertical="$2"
    borderRadius={8}
    borderWidth={1}
    borderColor="rgba(255, 255, 255, 0.2)"
    isActive={isActive}
    {...props}
  />
);
