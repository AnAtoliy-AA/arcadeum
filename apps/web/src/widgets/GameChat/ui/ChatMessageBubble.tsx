'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Text, View } from 'tamagui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { ChatScope } from '../store/gameChatStore';

interface ChatMessageBubbleProps {
  senderId?: string | null;
  senderName?: string | null;
  /** Sender's currently-equipped avatar id (from chat message payload). */
  senderEquippedAvatarId?: string | null;
  /** Sender's currently-equipped badge id (from chat message payload). */
  senderEquippedBadgeId?: string | null;
  /** Sender's currently-equipped name-color id (from chat message payload). */
  senderEquippedNameColorId?: string | null;
  /** Sender's currently-equipped frame id (from chat message payload). */
  senderEquippedFrameId?: string | null;
  /** Sender's currently-equipped aura id (from chat message payload). */
  senderEquippedAuraId?: string | null;
  /** Sender's currently-equipped banner id (from chat message payload). */
  senderEquippedBannerId?: string | null;
  message: string;
  type: 'system' | 'action' | 'message';
  scope?: ChatScope;
  isOwn?: boolean;
}

export function ChatMessageBubble({
  senderId,
  senderName,
  senderEquippedAvatarId,
  senderEquippedBadgeId,
  senderEquippedNameColorId,
  senderEquippedFrameId,
  senderEquippedAuraId,
  senderEquippedBannerId,
  message,
  type,
  isOwn,
}: ChatMessageBubbleProps) {
  // The hook resolves the name-color (used in the sender label outside the
  // PlayerAvatar slot). Avatar/badge/frame/aura come through PlayerAvatar.
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: senderEquippedAvatarId,
    equippedBadgeId: senderEquippedBadgeId,
    equippedNameColorId: senderEquippedNameColorId,
    equippedFrameId: senderEquippedFrameId,
    equippedAuraId: senderEquippedAuraId,
    equippedBannerId: senderEquippedBannerId,
  });
  const nameColorProps = nameColorRenderProps(nameColor);

  if (type === 'system' || type === 'action') {
    return (
      <XStack paddingVertical="$2" paddingHorizontal="$3" opacity={0.7}>
        <Text fontSize="$3" fontStyle="italic" color="$colorSubtle">
          {message}
        </Text>
      </XStack>
    );
  }

  const displayName = senderName ?? senderId ?? '?';

  return (
    <XStack
      gap="$2"
      paddingVertical="$2"
      paddingHorizontal="$3"
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      alignItems="flex-start"
    >
      <View flexShrink={0}>
        <EquippedPlayerAvatar
          name={displayName}
          size="sm"
          equippedAvatarId={senderEquippedAvatarId ?? null}
          equippedBadgeId={senderEquippedBadgeId ?? null}
          equippedNameColorId={senderEquippedNameColorId}
          equippedFrameId={senderEquippedFrameId}
          equippedAuraId={senderEquippedAuraId}
          equippedBannerId={senderEquippedBannerId}
        />
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
              color={nameColorProps.color ?? '#a5b4fc'}
              style={nameColorProps.style}
              letterSpacing={0.5}
            >
              {senderName}
            </Text>
          </XStack>
        )}
        <Text fontSize="$4" color="$color">
          {message}
        </Text>
      </YStack>
    </XStack>
  );
}
