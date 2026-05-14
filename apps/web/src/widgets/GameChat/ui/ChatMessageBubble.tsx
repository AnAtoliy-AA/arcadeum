'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Text, View } from 'tamagui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import type { ChatScope } from '../store/gameChatStore';

interface ChatMessageBubbleProps {
  senderId?: string | null;
  senderName?: string | null;
  /** Sender's currently-equipped avatar id (from chat message payload). */
  senderEquippedAvatarId?: string | null;
  /** Sender's currently-equipped badge id (from chat message payload). */
  senderEquippedBadgeId?: string | null;
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
  senderEquippedAvatarId,
  senderEquippedBadgeId,
  message,
  type,
  isOwn,
}: ChatMessageBubbleProps) {
  // Resolve sender's equipped cosmetics via the shop catalog. Cheap — module-
  // level cached map; safe to call even when the ids are null (returns nulls).
  const { avatarUrl, badgeUrl } = useEquippedCosmetics({
    equippedAvatarId: senderEquippedAvatarId,
    equippedBadgeId: senderEquippedBadgeId,
  });

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
        backgroundColor={avatarUrl ? 'rgba(0,0,0,0.2)' : avatarColor}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        overflow="hidden"
      >
        {avatarUrl ? (
          // Equipped shop avatar (asset URL). Plain <img> on purpose — Avatar
          // primitive is square-aware but designed for the header chip; here
          // we want the existing 38x38 rounded slot.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            style={{ width: 38, height: 38, objectFit: 'cover' }}
          />
        ) : (
          <Text fontSize="$4" fontWeight="700" color="white">
            {initial}
          </Text>
        )}
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
          <XStack alignItems="center" gap="$2">
            <Text
              fontSize="$2"
              fontWeight="600"
              textTransform="uppercase"
              color="#a5b4fc"
              letterSpacing={0.5}
            >
              {senderName}
            </Text>
            {badgeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={badgeUrl}
                alt=""
                width={16}
                height={16}
                style={{ objectFit: 'contain' }}
              />
            ) : null}
          </XStack>
        )}
        <Text fontSize="$4" color="$color">
          {message}
        </Text>
      </YStack>
    </XStack>
  );
}
