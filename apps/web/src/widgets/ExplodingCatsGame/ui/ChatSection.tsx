'use client';

import type { RefObject } from 'react';
import type { ExplodingCatsSnapshot } from '../types';
import {
  ChatCard,
  ChatMessages,
  LogEntry,
  ScopeToggle,
  ScopeOption,
  ChatInput,
  ChatControls,
  ChatHint,
  ChatSendButton,
  InfoTitle,
} from './styles';

export type ChatScope = 'all' | 'players';

type GameLog = NonNullable<ExplodingCatsSnapshot['logs']>[number];

interface ChatSectionProps {
  logs: GameLog[];
  chatMessagesRef: RefObject<HTMLDivElement | null>;
  chatMessage: string;
  onChatMessageChange: (value: string) => void;
  chatScope: ChatScope;
  onChatScopeChange: (scope: ChatScope) => void;
  onSendMessage: () => void;
  currentUserId: string | null;
  resolveDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string | undefined;
  formatLogMessage: (message: string) => string;
  t: (key: string) => string;
}

export function ChatSection({
  logs,
  chatMessagesRef,
  chatMessage,
  onChatMessageChange,
  chatScope,
  onChatScopeChange,
  onSendMessage,
  currentUserId,
  resolveDisplayName,
  formatLogMessage,
  t,
}: ChatSectionProps) {
  const canSendChatMessage = chatMessage.trim().length > 0;

  return (
    <ChatCard>
      <InfoTitle>{t('games.table.chat.title') || 'Table Chat'}</InfoTitle>
      {logs && logs.length > 0 ? (
        <ChatMessages ref={chatMessagesRef}>
          {logs.map((log) => (
            <LogEntry key={log.id} $type={log.type}>
              {resolveDisplayName(
                log.senderId ?? undefined,
                log.senderName ?? undefined,
              ) && (
                <strong>
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
        >
          {t('games.table.chat.scope.all') || 'All'}
        </ScopeOption>
        <ScopeOption
          type="button"
          $active={chatScope === 'players'}
          onClick={() => onChatScopeChange('players')}
        >
          {t('games.table.chat.scope.players') || 'Players'}
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
            : t('games.table.chat.placeholderPlayers') ||
              'Send a note to players'
        }
        disabled={!currentUserId}
      />
      <ChatControls>
        <ChatHint>
          {chatScope === 'all'
            ? t('games.table.chat.hintAll') || 'Visible to everyone'
            : t('games.table.chat.hintPlayers') || 'Visible to players only'}
        </ChatHint>
        <ChatSendButton
          type="button"
          onClick={onSendMessage}
          disabled={!currentUserId || !canSendChatMessage}
        >
          {t('games.table.chat.send') || 'Send'}
        </ChatSendButton>
      </ChatControls>
    </ChatCard>
  );
}
