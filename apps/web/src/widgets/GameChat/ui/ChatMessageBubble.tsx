'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Text, View } from 'tamagui';
import type { ChatScope } from '../store/gameChatStore';

interface ChatMessageBubbleProps {
  senderId?: string | null;
  senderName?: string | null;
  message: string;
  type: 'system' | 'action' | 'message';
  scope?: ChatScope;
  isOwn?: boolean;
}

const getUserColor = (id: string) => {
  const colors = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#84CC16',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function ChatMessageBubble({
  senderId,
  senderName,
  message,
  type,
  isOwn,
}: ChatMessageBubbleProps) {
  if (type === 'system' || type === 'action') {
    return (
      <XStack paddingVertical="$2" paddingHorizontal="$3" opacity={0.7}>
        <Text fontSize="$3" fontStyle="italic" color="$colorSubtle">
          {message}
        </Text>
      </XStack>
    );
  }

  const initial = (senderName ?? senderId ?? '?').charAt(0).toUpperCase();
  const avatarColor = getUserColor(senderId ?? senderName ?? '?');

  return (
    <XStack
      gap="$2"
      paddingVertical="$2"
      paddingHorizontal="$3"
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      alignItems="flex-start"
    >
      <View
        width={38}
        height={38}
        borderRadius="$3"
        backgroundColor={avatarColor}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Text fontSize="$4" fontWeight="700" color="white">
          {initial}
        </Text>
      </View>
      <YStack
        flex={1}
        gap="$1"
        backgroundColor="rgba(15,23,42,0.8)"
        borderRadius="$4"
        borderWidth={1}
        borderColor="rgba(99,102,241,0.3)"
        paddingHorizontal="$3"
        paddingVertical="$2"
      >
        {senderName && (
          <Text
            fontSize="$2"
            fontWeight="600"
            textTransform="uppercase"
            color="#a5b4fc"
            letterSpacing={0.5}
          >
            {senderName}
          </Text>
        )}
        <Text fontSize="$4" color="$color">
          {message}
        </Text>
      </YStack>
    </XStack>
  );
}
