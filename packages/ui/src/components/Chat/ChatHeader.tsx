import { memo } from 'react';
import { XStack, YStack, styled, View } from 'tamagui';
import { PageTitle } from '../PageTitle/PageTitle';
import { Typography } from '../Typography/Typography';

export type ChatHeaderProps = {
  title: string;
  isConnected: boolean;
  statusText?: string;
  onBack?: () => void;
};

const HeaderContainer = styled(XStack, {
  name: 'ChatHeaderContainer',
  padding: '$3 $5',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(24px)',
});

const StatusDot = styled(View, {
  width: 8,
  height: 8,
  borderRadius: 4,

  variants: {
    connected: {
      true: {
        backgroundColor: '$success',
        shadowColor: '$success',
        shadowRadius: 8,
        shadowOpacity: 0.5,
      },
      false: {
        backgroundColor: '$warning',
        shadowColor: '$warning',
        shadowRadius: 8,
        shadowOpacity: 0.3,
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
      <YStack gap="$1">
        <PageTitle size="sm" gradient>
          {title || 'Chat'}
        </PageTitle>
        <XStack ai="center" gap="$2" opacity={0.8}>
          <StatusDot connected={isConnected} />
          <Typography uiSize="xs" weight="600" alpha="medium" textTransform="uppercase" letterSpacing={1}>
            {statusText}
          </Typography>
        </XStack>
      </YStack>
    </HeaderContainer>
  );
});
