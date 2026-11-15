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
  moveCells?: { row: number; col: number }[];
  onMoveHover?: (cell: { row: number; col: number } | null) => void;
  onMoveClick?: (cell: { row: number; col: number }) => void;
  onMoveCellsHover?: (cells: { row: number; col: number }[]) => void;
  onMoveCellsClick?: (cells: { row: number; col: number }[]) => void;
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
  moveCells,
  onMoveHover,
  onMoveClick,
  onMoveCellsHover,
  onMoveCellsClick,
}: GameChatRowProps) {
  const isMove =
    !!moveCell || (moveCells !== undefined && moveCells.length > 0);

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

  const effectiveCells = moveCells ?? (moveCell ? [moveCell] : []);

  return (
    <div
      onMouseEnter={
        isMove
          ? () => {
              if (onMoveCellsHover && effectiveCells.length > 1) {
                onMoveCellsHover(effectiveCells);
              } else if (onMoveHover && moveCell) {
                onMoveHover(moveCell);
              }
            }
          : undefined
      }
      onMouseLeave={
        isMove
          ? () => {
              if (onMoveCellsHover && effectiveCells.length > 1) {
                onMoveCellsHover([]);
              } else if (onMoveHover) {
                onMoveHover(null);
              }
            }
          : undefined
      }
      onClick={
        isMove
          ? () => {
              if (onMoveCellsClick && effectiveCells.length > 1) {
                onMoveCellsClick(effectiveCells);
              } else if (onMoveClick && moveCell) {
                onMoveClick(moveCell);
              }
            }
          : undefined
      }
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
