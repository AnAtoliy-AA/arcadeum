import React, { memo } from 'react';
import { XStack, YStack, styled, ThemeableStack } from 'tamagui';
import { Avatar } from '../Avatar/Avatar';
import { Typography } from '../Typography/Typography';

export type ChatMessageProps = {
  content: string;
  senderName?: string;
  timestamp: string;
  isOwn: boolean;
  avatarUrl?: string;
  isEncrypted?: boolean;
};

const MessageGroup = (styled(ThemeableStack, {
  name: 'MessageGroup',
  flexDirection: 'column',
  gap: '$1',
  maxWidth: '85%',
  enterStyle: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  
  variants: {
    isOwn: {
      true: {
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
      },
      false: {
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
      },
    },
  } as const,
}) as any);

const MessageBubble = styled(YStack, {
  padding: '$3 $4',
  
  hoverStyle: {
    scale: 1.01,
  },
  
  variants: {
    isOwn: {
      true: {
        borderRadius: '$4',
        borderBottomRightRadius: '$1',
        background: 'linear-gradient(135deg, $primaryGradientStart 0%, $primaryGradientEnd 100%)',
        shadowColor: '$primary',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      false: {
        borderRadius: '$4',
        borderBottomLeftRadius: '$1',
        backgroundColor: '$glassBg',
        borderWidth: 1,
        borderColor: '$glassBorder',
        backdropFilter: 'blur(8px)',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    },
  } as const,
});

export const ChatMessage = memo(function ChatMessage({
  content,
  senderName,
  timestamp,
  isOwn,
  avatarUrl,
  isEncrypted,
}: ChatMessageProps) {
  return (
    <MessageGroup isOwn={isOwn} animation="medium">
      {!isOwn && (
        <XStack ai="center" gap="$2" mb="$1" px="$2">
          <Avatar name={senderName || ''} size="sm" src={avatarUrl} />
          <Typography uiSize="xs" weight="600" alpha="medium">
            {senderName || 'Unknown'}
          </Typography>
        </XStack>
      )}
      <MessageBubble isOwn={isOwn}>
        <Typography 
          uiSize="sm" 
          color={isOwn ? 'white' : '$color'}
        >
          {isEncrypted ? '[Encrypted Message]' : content}
        </Typography>
        <Typography 
          uiSize="xs" 
          alpha="low" 
          color={isOwn ? 'white' : '$color'}
          mt="$1"
        >
          {timestamp}
        </Typography>
      </MessageBubble>
    </MessageGroup>
  );
});
