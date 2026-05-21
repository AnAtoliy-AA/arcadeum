'use client';

import { useGameChatStore } from '../store/gameChatStore';
import { useLatestChatMessage } from '../hooks/useLatestChatMessage';
import { ChatMessagePopup } from './ChatMessagePopup';

export function GameChatPopupOverlay() {
  const logs = useGameChatStore((s) => s.logs);
  const gameResolveDisplayName = useGameChatStore((s) => s.resolveDisplayName);
  const fallbackResolveDisplayName = useGameChatStore(
    (s) => s.fallbackResolveDisplayName,
  );
  const resolveEquipped = useGameChatStore((s) => s.resolveEquipped);
  const currentUserId = useGameChatStore((s) => s.currentUserId);
  const chatPanelOpen = useGameChatStore((s) => s.chatPanelOpen);

  const { latestMessage, dismiss } = useLatestChatMessage(logs);

  if (chatPanelOpen) return null;
  if (!latestMessage) return null;

  const fromGame = gameResolveDisplayName?.(
    latestMessage.senderId,
    latestMessage.senderName,
  );
  const senderName =
    fromGame && fromGame !== 'Unknown'
      ? fromGame
      : (fallbackResolveDisplayName?.(
          latestMessage.senderId,
          latestMessage.senderName,
        ) ?? latestMessage.senderName);

  const equipped = resolveEquipped?.(latestMessage.senderId ?? null) ?? null;

  const isOwn =
    !!currentUserId &&
    !!latestMessage.senderId &&
    latestMessage.senderId === currentUserId;

  return (
    <ChatMessagePopup
      key={latestMessage.id}
      senderId={latestMessage.senderId ?? null}
      senderName={senderName}
      senderEquippedAvatarId={equipped?.equippedAvatarId ?? null}
      senderEquippedBadgeId={equipped?.equippedBadgeId ?? null}
      senderEquippedNameColorId={equipped?.equippedNameColorId ?? null}
      senderEquippedFrameId={equipped?.equippedFrameId ?? null}
      senderEquippedAuraId={equipped?.equippedAuraId ?? null}
      senderEquippedBannerId={equipped?.equippedBannerId ?? null}
      message={latestMessage.message}
      visible
      onDismiss={dismiss}
      isOwn={isOwn}
    />
  );
}
