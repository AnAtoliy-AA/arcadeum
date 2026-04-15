import { styled, YStack, XStack, Text, TextArea } from 'tamagui';
import { Button, ButtonProps, GameVariant } from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { TamaguiTheme } from './variants/types';

export const ScopeToggle = styled(XStack, {
  name: 'ScopeToggle',
  gap: '$2',
  flexWrap: 'wrap',
});

interface ScopeOptionProps extends Omit<ButtonProps, 'variant'> {
  isActive?: boolean;
  variant?: string; // string variant from game options
}

export const ScopeOption = ({
  isActive,
  $active,
  variant,
  $variant,
  ...props
}: ScopeOptionProps & { $active?: boolean; $variant?: string }) => (
  <Button
    variant={isActive || $active ? 'primary' : 'secondary'}
    size="sm"
    isActive={isActive || $active}
    gameVariant={(variant || $variant) as GameVariant}
    flex={1}
    minWidth={120}
    $xs={{ minWidth: 80 }}
    {...props}
  />
);

export const ChatInput = styled(TextArea, {
  name: 'ChatInput',
  width: '100%',
  minHeight: 90,
  borderRadius: 12,
  padding: '$3',
  fontSize: 14,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,

  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
  },

  $short: {
    minHeight: 60,
    padding: '$2',
  },

  variants: {
    $variant: (val: string, { theme }: { theme: TamaguiTheme }) => {
      const config = getVariantStyles(val).chat;
      return {
        backgroundColor: config.getInputBackground?.(theme),
        borderColor: config.getInputBorder?.(theme),
        ...config.getInputStyles?.(),
        focusStyle: {
          borderColor: config.getInputFocusBorder?.(theme),
          boxShadow: config.getInputFocusShadow?.(),
        },
      };
    },
  } as const,
});

export const ChatControls = styled(XStack, {
  name: 'ChatControls',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$3',
  flexWrap: 'wrap',
  flexShrink: 0,
});

export const ChatHint = styled(Text, {
  name: 'ChatHint',
  fontSize: 12,
  color: '$color',
  opacity: 0.7,
});

export const ChatTurnStatus = styled(Text, {
  name: 'ChatTurnStatus',
  padding: '$2 $3',
  backgroundColor: '$glassBg',
  borderRadius: 8,
  borderLeftWidth: 3,
  borderLeftColor: '$primary',
  marginBottom: '$1',

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).chat;
      return {
        ...config.getTurnStatusStyles?.(),
      };
    },
  } as const,
});

export const ChatSendButton = ({
  variant,
  $variant,
  ...props
}: ButtonProps & { variant?: string; $variant?: string }) => (
  <Button
    variant="primary"
    size="sm"
    gameVariant={(variant || $variant) as GameVariant}
    {...props}
  />
);

export const EmptyState = styled(YStack, {
  name: 'EmptyState',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$4',
  padding: '$9',
});

const StyledChatBubbleContainer = styled(YStack, {
  name: 'ChatBubbleContainer',
  position: 'absolute',
  backgroundColor: '$background',
  padding: '$2 $3',
  borderRadius: 12,
  elevation: 5,
  borderWidth: 1,
  borderColor: '$borderColor',
  maxWidth: 180,
  zIndex: 100,

  variants: {
    $visible: {
      true: { opacity: 1, scale: 1 },
      false: { opacity: 0, scale: 0.9, pointerEvents: 'none' },
    },
    $position: {
      top: { bottom: '100%', left: '50%', x: '-50%', marginBottom: 12 },
      bottom: { top: '100%', left: '50%', x: '-50%', marginTop: 12 },
      left: { top: '50%', right: '100%', y: '-50%', marginRight: 12 },
      right: { top: '50%', left: '100%', y: '-50%', marginLeft: 12 },
    },
    $variant: (_val: unknown) => ({}),
  } as const,
});

import { memo, type ReactElement, type ReactNode } from 'react';

interface ChatBubbleContainerProps {
  $visible: boolean;
  $position?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode;
  $variant?: string;
}

export const ChatBubbleContainer = memo(function ChatBubbleContainer({
  $visible,
  $position,
  $variant,
  ...props
}: ChatBubbleContainerProps): ReactElement {
  return (
    <StyledChatBubbleContainer
      $visible={$visible}
      $position={$position}
      $variant={$variant}
      {...props}
    />
  );
});

export const LogSender = styled(Text, {
  name: 'LogSender',
  fontWeight: '700',

  variants: {
    $color: (_val: unknown) => ({
      color: '$$color',
    }),
    $variant: (_val: unknown) => ({}),
  } as const,
});
