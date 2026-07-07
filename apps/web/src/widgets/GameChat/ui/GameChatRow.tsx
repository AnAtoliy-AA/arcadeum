'use client';

import type { ReactNode } from 'react';
import { ChatMessage } from '@arcadeum/ui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { EquippedResolver } from './types';

interface GameChatRowProps {
  senderId: string | null;
  senderName?: string;
  senderColor?: string;
  targetName?: string;
  targetColor?: string;
  content: string;
  contentNode?: ReactNode;
  type: 'system' | 'action' | 'message';
  isOwn: boolean;
  resolveEquipped?: EquippedResolver;
  moveCell?: { row: number; col: number } | null;
  onMoveHover?: (cell: { row: number; col: number } | null) => void;
  onMoveClick?: (cell: { row: number; col: number }) => void;
}

export function GameChatRow({
  senderId,
  senderName,
  senderColor,
  targetName,
  targetColor,
  content,
  contentNode,
  type,
  isOwn,
  resolveEquipped,
  moveCell,
  onMoveHover,
  onMoveClick,
}: GameChatRowProps) {
  const resolved = senderId ? (resolveEquipped?.(senderId) ?? null) : null;
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: resolved?.equippedAvatarId,
    equippedBadgeId: resolved?.equippedBadgeId,
    equippedNameColorId: resolved?.equippedNameColorId,
    equippedFrameId: resolved?.equippedFrameId,
    equippedAuraId: resolved?.equippedAuraId,
    equippedBannerId: resolved?.equippedBannerId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  const resolvedSenderColor = nameProps.color ?? senderColor;

  const isMove = !!moveCell;

  return (
    <div
      onMouseEnter={
        isMove && onMoveHover ? () => onMoveHover(moveCell) : undefined
      }
      onMouseLeave={isMove && onMoveHover ? () => onMoveHover(null) : undefined}
      onClick={isMove && onMoveClick ? () => onMoveClick(moveCell!) : undefined}
      style={
        isMove
          ? {
              cursor: 'pointer',
              borderRadius: 6,
              transition: 'background-color 120ms ease',
            }
          : undefined
      }
    >
      <ChatMessage
        senderName={senderName}
        senderColor={resolvedSenderColor}
        senderNameStyle={nameProps.style}
        targetName={targetName}
        targetColor={targetColor}
        content={content}
        contentNode={contentNode}
        type={type}
        isOwn={isOwn}
        senderAvatar={
          senderName ? (
            <EquippedPlayerAvatar
              name={senderName}
              size="sm"
              equippedAvatarId={resolved?.equippedAvatarId ?? null}
              equippedBadgeId={resolved?.equippedBadgeId ?? null}
              equippedNameColorId={resolved?.equippedNameColorId}
              equippedFrameId={resolved?.equippedFrameId}
              equippedAuraId={resolved?.equippedAuraId}
              equippedBannerId={resolved?.equippedBannerId}
            />
          ) : undefined
        }
      />
    </div>
  );
}
