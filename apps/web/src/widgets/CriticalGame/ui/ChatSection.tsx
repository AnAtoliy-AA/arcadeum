'use client';

import { type RefObject } from 'react';
import type { CriticalSnapshot, ChatScope } from '../types';
import { TranslationKey } from '@/shared/lib/useTranslation';
import {
  ChatCard,
  ChatMessages,
  LogEntry,
  ScopeToggle,
  ScopeOption,
  ChatInput,
  ChatControls,
  ChatHint,
  ChatTurnStatus,
  ChatSendButton,
  InfoTitle,
  ChatCloseButton,
} from './styles';

type GameLog = NonNullable<CriticalSnapshot['logs']>[number];

interface ChatSectionProps {
  logs: GameLog[];
  chatMessagesRef: RefObject<HTMLDivElement | null>;
  chatMessage: string;
  onChatMessageChange: (value: string) => void;
  chatScope: ChatScope;
  onChatScopeChange: (scope: ChatScope) => void;
  onSendMessage: () => void;
  currentUserId: string | null;
  turnStatus: string;
  resolveDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string | undefined;
  formatLogMessage: (message: string) => string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  cardVariant?: string;
  onClose?: () => void;
}

const getUserColor = (userId: string) => {
  const colors = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#84CC16', // lime
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#EC4899', // pink
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function ChatSection({
  logs,
  chatMessagesRef,
  chatMessage,
  onChatMessageChange,
  chatScope,
  onChatScopeChange,
  onSendMessage,
  currentUserId,
  turnStatus,
  resolveDisplayName,
  formatLogMessage,
  t,
  cardVariant,
  onClose,
}: ChatSectionProps) {
  const canSendChatMessage = chatMessage.trim().length > 0;

  return (
    <ChatCard $variant={cardVariant}>
      <InfoTitle>{t('games.table.chat.title') || 'Table Chat'}</InfoTitle>
      {onClose && (
        <ChatCloseButton onClick={onClose} aria-label="Close Chat">
          ✕
        </ChatCloseButton>
      )}
      <ChatTurnStatus $variant={cardVariant}>{turnStatus}</ChatTurnStatus>
      {logs && logs.length > 0 ? (
        <ChatMessages ref={chatMessagesRef}>
          {logs.map((log) => (
            <LogEntry
              key={log.id}
              $type={log.type}
              $scope={log.scope}
              $variant={cardVariant}
            >
              {resolveDisplayName(
                log.senderId ?? undefined,
                log.senderName ?? undefined,
              ) && (
                <strong
                  style={{
                    color: getUserColor(log.senderId || log.senderName || ''),
                  }}
                >
                  {resolveDisplayName(
                    log.senderId ?? undefined,
                    log.senderName ?? undefined,
                  )}
                  :{' '}
                </strong>
              )}
              {formatLogMessage(log.message)}
            </LogEntry>
          ))}
        </ChatMessages>
      ) : (
        <ChatHint>
          {t('games.table.chat.empty') || 'No messages yet. Break the ice!'}
        </ChatHint>
      )}
      <ScopeToggle>
        <ScopeOption
          type="button"
          $active={chatScope === 'all'}
          onClick={() => onChatScopeChange('all')}
          $variant={cardVariant}
        >
          {t('games.table.chat.scope.all') || 'All'}
        </ScopeOption>
        <ScopeOption
          type="button"
          $active={chatScope === 'players'}
          onClick={() => onChatScopeChange('players')}
          $variant={cardVariant}
        >
          {t('games.table.chat.scope.players') || 'Players'}
        </ScopeOption>
        <ScopeOption
          type="button"
          $active={chatScope === 'private'}
          onClick={() => onChatScopeChange('private')}
          $variant={cardVariant}
        >
          {t('games.table.chat.scope.private') || 'Private'}
        </ScopeOption>
      </ScopeToggle>
      <ChatInput
        value={chatMessage}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChatMessageChange(e.target.value)
        }
        placeholder={
          chatScope === 'all'
            ? t('games.table.chat.placeholderAll') || 'Send a note to everyone'
            : chatScope === 'players'
              ? t('games.table.chat.placeholderPlayers') ||
                'Send a note to players'
              : t('games.table.chat.placeholderPrivate') ||
                'Send a private note to yourself'
        }
        disabled={!currentUserId}
        $variant={cardVariant}
      />
      <ChatControls>
        <ChatHint>
          {chatScope === 'all'
            ? t('games.table.chat.hintAll') || 'Visible to everyone'
            : chatScope === 'players'
              ? t('games.table.chat.hintPlayers') || 'Visible to players only'
              : t('games.table.chat.hintPrivate') || 'Only you can see this'}
        </ChatHint>
        <ChatSendButton
          type="button"
          onClick={onSendMessage}
          disabled={!currentUserId || !canSendChatMessage}
          $variant={cardVariant}
        >
          {t('games.table.chat.send') || 'Send'}
        </ChatSendButton>
      </ChatControls>
    </ChatCard>
  );
}
