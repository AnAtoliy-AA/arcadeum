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
  gap: '$3',
  paddingHorizontal: '$7',
  paddingVertical: '$2',
  height: 50,
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  marginHorizontal: -28,
  marginTop: -28,
  position: 'relative',
  zIndex: 30,
  flexShrink: 0,
  overflow: 'hidden',

  $sm: {
    paddingHorizontal: '$4',
    paddingVertical: '$2',
    marginHorizontal: 0,
    marginTop: 0,
    gap: '$2',
    height: 42,
  },

  variants: {
    $variant: (val: string, { theme }: { theme: TamaguiTheme }) => {
      const config = getVariantStyles(val).header;
      return {
        backgroundColor: config.getBackground(theme),
        borderBottomColor: config.getBorder(theme),
        // web-only: Tamagui passes pseudo-element objects to the CSS layer on web
        before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 28,
          right: 28,
          height: 2,
          background: config.getLineBackground(),
          boxShadow: config.getLineShadow(),
          borderRadius: 1,
        },
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

export const GameInfo = styled(XStack, {
  name: 'GameInfo',
  alignItems: 'center',
  gap: '$2',
  minWidth: 0,
  flex: 1,
});

export const GameTitle = styled(Text, {
  name: 'GameTitle',
  margin: 0,
  fontSize: 16,
  fontWeight: '800',
  letterSpacing: -0.3,
  position: 'relative',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  $sm: {
    fontSize: 14,
  },

  variants: {
    $variant: (_val: string) => ({}),
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

export const TurnStatusPill = styled(XStack, {
  name: 'TurnStatusPill',
  borderRadius: 20,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderWidth: 1,
  alignItems: 'center',
  flexShrink: 0,

  variants: {
    $status: {
      yourTurn: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: 'rgba(16,185,129,0.4)',
      },
      waiting: {
        backgroundColor: 'rgba(234,179,8,0.1)',
        borderColor: 'rgba(234,179,8,0.35)',
      },
      completed: {
        backgroundColor: 'rgba(148,163,184,0.1)',
        borderColor: 'rgba(148,163,184,0.25)',
      },
      default: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
      },
    },
  } as const,

  defaultVariants: {
    $status: 'default',
  },
});

export const VariantIconBadge = styled(YStack, {
  name: 'VariantIconBadge',
  width: 30,
  height: 30,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  flexShrink: 0,

  $sm: {
    width: 24,
    height: 24,
  },
});

export const StartButton = (props: ButtonProps) => (
  <Button variant="secondary" $sm={{ size: 'sm', scale: 0.9 }} {...props} />
);

export const FullscreenButton = (props: ButtonProps) => (
  <IconButton
    size="sm"
    padding="$2"
    pressStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
    $sm={{ scale: 0.85, padding: '$1' }}
    {...props}
  />
);
