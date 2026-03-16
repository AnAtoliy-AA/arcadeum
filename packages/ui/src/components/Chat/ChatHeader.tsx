import React, { memo } from 'react';
import { XStack, YStack, styled, ThemeableStack } from 'tamagui';
import { PageTitle } from '../PageTitle/PageTitle';
import { Typography } from '../Typography/Typography';

export type ChatHeaderProps = {
  title: string;
  isConnected: boolean;
  statusText?: string;
};

const HeaderContainer = styled(XStack, {
  name: 'ChatHeader',
  padding: '$4 $5',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
});

const StatusDot = styled(ThemeableStack, {
  width: 10,
  height: 10,
  borderRadius: 5,

  variants: {
    connected: {
      true: {
        backgroundColor: '$green10',
        shadowColor: '$green10',
        shadowRadius: 10,
        animation: 'pulse',
      },
      false: {
        backgroundColor: '$orange10',
      },
    },
  } as const,
});

export const ChatHeader = memo(function ChatHeader({
  title,
  isConnected,
  statusText,
}: ChatHeaderProps) {
  return (
    <HeaderContainer>
      <YStack>
        <PageTitle size="sm" gradient>
          {title || 'Chat'}
        </PageTitle>
        <XStack ai="center" gap="$2">
          <StatusDot connected={isConnected} />
          <Typography uiSize="xs" alpha="high">
            {statusText}
          </Typography>
        </XStack>
      </YStack>
    </HeaderContainer>
  );
});
