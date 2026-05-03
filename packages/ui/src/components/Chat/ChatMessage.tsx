import { memo } from 'react';
import { XStack, YStack, styled, ThemeableStack, GetProps } from 'tamagui';
import { Avatar } from '../Avatar/Avatar';
import { Typography } from '../Typography/Typography';

export type ChatMessageProps = {
  content: string;
  senderName?: string;
  timestamp?: string;
  isOwn?: boolean;
  avatarUrl?: string;
  isEncrypted?: boolean;
  type?: 'system' | 'action' | 'message';
};

const MessageGroup = styled(ThemeableStack, {
  name: 'MessageGroup',
  flexDirection: 'column',
  gap: '$1',
  maxWidth: '85%',
  
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
    type: {
      system: {
        maxWidth: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        opacity: 0.8,
      },
      action: {
        maxWidth: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        opacity: 0.9,
      },
      message: {},
    },
  } as const,
  
  defaultVariants: {
    type: 'message',
  },
});

type MessageGroupProps = GetProps<typeof MessageGroup>;

const MessageBubble = styled(YStack, {
  paddingHorizontal: '$4',
  paddingVertical: '$2.5',
  
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
        borderBottomLeftRadius: '$2',
        backgroundColor: '$glassBg',
        borderWidth: 1,
        borderColor: '$glassBorder',
        backdropFilter: 'blur(16px)',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    },
    type: {
      system: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingVertical: '$1',
        paddingHorizontal: '$2',
      },
      action: {
        backgroundColor: '$glassBg',
        borderRadius: '$6',
        paddingVertical: '$1.5',
        paddingHorizontal: '$4',
        borderWidth: 1,
        borderColor: '$glassBorder',
        borderStyle: 'dashed',
      },
      message: {},
    },
  } as const,
});

export const ChatMessage = memo(function ChatMessage({
  content,
  senderName,
  timestamp,
  isOwn = false,
  avatarUrl,
  isEncrypted,
  type = 'message',
}: ChatMessageProps) {
  const isSystem = type === 'system' || type === 'action';

  return (
    <MessageGroup 
      isOwn={isOwn} 
      type={type}
      enterStyle={{ opacity: 0, scale: 0.9, y: 15 }}
    >
      {!isOwn && !isSystem && senderName && (
        <XStack ai="center" gap="$2" mb="$1" px="$2">
          <Avatar name={senderName} size="sm" src={avatarUrl} />
          <Typography uiSize="xs" weight="600" alpha="medium" letterSpacing={0.5} textTransform="uppercase">
            {senderName}
          </Typography>
        </XStack>
      )}
      <MessageBubble isOwn={isOwn} type={type} data-testid="chat-message">
        <Typography 
          uiSize={isSystem ? 'xs' : 'sm'} 
          color={isOwn && !isSystem ? 'white' : '$color'}
          textAlign={isSystem ? 'center' : 'left'}
          fontStyle={isSystem ? 'italic' : 'normal'}
        >
          {isEncrypted ? '[Encrypted Message]' : content}
        </Typography>
        {timestamp && !isSystem && (
          <Typography 
            uiSize="xs" 
            alpha="low" 
            color={isOwn ? 'white' : '$color'}
            mt="$1"
            opacity={0.7}
          >
            {timestamp}
          </Typography>
        )}
      </MessageBubble>
    </MessageGroup>
  );
});
