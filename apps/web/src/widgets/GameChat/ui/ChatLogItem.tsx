'use client';

import type { ChatLogEntry } from '../store/gameChatStore';
import { useGameChatStore } from '../store/gameChatStore';
import { GameChatRow } from './GameChatRow';
import { GameChatSystemRow, GameChatEmoteRow } from './GameChatSystemRow';
import type { EquippedResolver } from './types';
import {
  inferSysKind,
  parseEmoteMessage,
  parseMoveCell,
  renderResultHighlights,
} from './chatHelpers';

interface ChatLogItemProps {
  log: ChatLogEntry;
  senderName?: string;
  senderColor?: string;
  targetName?: string;
  targetColor?: string;
  currentUserId?: string | null;
  resolveEquipped?: EquippedResolver;
  isHost?: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

const DELETE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  background: 'rgba(239,68,68,0.8)',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  width: 20,
  height: 20,
  fontSize: 12,
  lineHeight: '20px',
  cursor: 'pointer',
  transition: 'opacity 120ms ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

function DeleteButton({
  messageId,
  onDelete,
}: {
  messageId: string;
  onDelete: (id: string) => void;
}) {
  return (
    <button
      className="chat-delete-btn opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      onClick={() => onDelete(messageId)}
      title="Delete message"
      aria-label="Delete message"
      style={DELETE_STYLE}
    >
      ×
    </button>
  );
}

export function ChatLogItem({
  log,
  senderName,
  senderColor,
  targetName,
  targetColor,
  currentUserId,
  resolveEquipped,
  isHost,
  onDeleteMessage,
}: ChatLogItemProps) {
  if (log.type === 'system' || log.type === 'action') {
    const moveCell = parseMoveCell(log.message);
    if (moveCell) {
      return (
        <GameChatRow
          senderId={log.senderId ?? null}
          senderName={log.senderId ? senderName : undefined}
          senderColor={senderColor}
          content={log.message}
          type="action"
          isOwn={false}
          resolveEquipped={resolveEquipped}
          moveCell={moveCell}
          onMoveHover={(cell) =>
            useGameChatStore.getState().setHighlightedCell(cell)
          }
          onMoveClick={(cell) =>
            useGameChatStore.getState().setPersistedCell(cell)
          }
        />
      );
    }
    const emote = parseEmoteMessage(log.message);
    if (emote) {
      return (
        <GameChatEmoteRow
          emoji={emote.emoji}
          senderName={senderName}
          senderColor={senderColor}
          senderId={log.senderId ?? null}
          resolveEquipped={resolveEquipped}
        />
      );
    }
    return (
      <GameChatSystemRow
        kind={inferSysKind(log)}
        content={renderResultHighlights(log.message)}
        senderName={senderName}
        senderColor={senderColor}
        targetName={targetName}
        targetColor={targetColor}
      />
    );
  }

  const isOwn = !!currentUserId && log.senderId === currentUserId;
  const emote = parseEmoteMessage(log.message);
  const canDelete = isHost || log.senderId === currentUserId;

  if (emote) {
    return (
      <div className="chat-msg-row group" style={{ position: 'relative' }}>
        <GameChatEmoteRow
          emoji={emote.emoji}
          senderName={senderName}
          senderColor={senderColor}
          senderId={log.senderId ?? null}
          resolveEquipped={resolveEquipped}
        />
        {canDelete && onDeleteMessage && (
          <DeleteButton messageId={log.id} onDelete={onDeleteMessage} />
        )}
      </div>
    );
  }

  return (
    <div className="chat-msg-row group" style={{ position: 'relative' }}>
      <GameChatRow
        senderId={log.senderId ?? null}
        senderName={log.senderId ? senderName : undefined}
        senderColor={senderColor}
        targetName={targetName}
        targetColor={targetColor}
        content={log.message}
        type={log.type}
        isOwn={isOwn}
        resolveEquipped={resolveEquipped}
      />
      {canDelete &&
        onDeleteMessage &&
        (log.type === 'message' || log.type === 'action') && (
          <DeleteButton messageId={log.id} onDelete={onDeleteMessage} />
        )}
    </div>
  );
}
