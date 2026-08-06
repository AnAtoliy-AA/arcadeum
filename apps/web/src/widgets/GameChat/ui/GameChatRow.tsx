'use client';

import type { ReactNode } from 'react';
import { ChatMessage } from '@arcadeum/ui';
import { ChatSenderLabel } from './ChatSenderLabel';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
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
  const isMove = !!moveCell;

  const resolved = senderId ? (resolveEquipped?.(senderId) ?? null) : null;
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: resolved?.equippedAvatarId,
    equippedBadgeId: resolved?.equippedBadgeId,
    equippedNameColorId: resolved?.equippedNameColorId,
    equippedFrameId: resolved?.equippedFrameId,
    equippedAuraId: resolved?.equippedAuraId,
    equippedBannerId: resolved?.equippedBannerId,
  });
  const nameStyleProps = nameColorRenderProps(nameColor);

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
        senderColor={nameStyleProps.color ?? senderColor}
        senderNameStyle={nameStyleProps.style}
        targetName={targetName}
        targetColor={targetColor}
        content={content}
        contentNode={contentNode}
        type={type}
        isOwn={isOwn}
        senderAvatar={
          senderName ? (
            <ChatSenderLabel
              senderName={senderName}
              senderId={senderId}
              resolveEquipped={resolveEquipped}
            />
          ) : undefined
        }
      />
    </div>
  );
}
