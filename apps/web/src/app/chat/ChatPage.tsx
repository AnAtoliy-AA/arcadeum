'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PageLayout, Container, Button, Input } from '@/shared/ui';
import { chatApi } from '@/features/chat/api';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { formatSafeTime } from '@/shared/lib/date';

const ChatContainer = styled(Container)`
  height: 100vh;
  gap: 0;
`;

const Header = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const Status = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const StatusDot = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $connected }) => ($connected ? '#22c55e' : '#f59e0b')};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  max-width: 70%;
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: ${({ $isOwn, theme }) =>
    $isOwn
      ? theme.buttons.primary.gradientStart
      : theme.surfaces.card.background};
  color: ${({ $isOwn, theme }) =>
    $isOwn ? theme.buttons.primary.text : theme.text.primary};
  border: ${({ $isOwn, theme }) =>
    $isOwn ? 'none' : `1px solid ${theme.surfaces.card.border}`};
`;

const MessageSender = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.muted};
  margin-bottom: 0.25rem;
`;

const MessageContent = styled.div`
  word-wrap: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 0.25rem;
`;

const InputContainer = styled.div`
  padding: 1rem 0;
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  gap: 0.75rem;
`;

const ChatInput = styled(Input)`
  flex: 1;
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

export function ChatPage() {
  const searchParams = useSearchParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const chatId = searchParams?.get('chatId') || null;
  const receiverIds = searchParams?.get('receiverIds') || '';
  const title = searchParams?.get('title') || 'Chat';

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store
  const { messages, isConnected, setMessages, reset } = useChatStore();

  // Socket Hook
  const { sendMessage } = useChatSocket({ chatId, receiverIds });

  // Initial fetch
  useEffect(() => {
    if (!chatId || !snapshot.accessToken) return;

    chatApi
      .getMessages(chatId, { token: snapshot.accessToken })
      .then(setMessages)
      .catch((err) => console.error(err));

    // Cleanup on unmount (optional, but good if we want fresh state on next visit)
    return () => {
      reset();
    };
  }, [chatId, snapshot.accessToken, setMessages, reset]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  if (!chatId) {
    return (
      <PageLayout>
        <ChatContainer size="md">
          <EmptyMessage>{t('chat.notFound') || 'Chat not found'}</EmptyMessage>
        </ChatContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ChatContainer size="md">
        <Header>
          <Title>{title}</Title>
          <Status>
            <StatusDot
              $connected={isConnected}
              aria-label={
                isConnected
                  ? t('chat.status.connected') || 'Connected'
                  : t('chat.status.connecting') || 'Connecting'
              }
            />
            {isConnected
              ? t('chat.status.connected') || 'Connected'
              : t('chat.status.connecting') || 'Connecting...'}
          </Status>
        </Header>

        <MessagesContainer>
          {messages.map((msg) => {
            const isEncrypted = !msg.content && '__encrypted' in msg;
            if (!msg || (!msg.content && !isEncrypted)) return null;

            const isOwn = msg.senderId === snapshot.userId;

            return (
              <Message key={msg.id} $isOwn={isOwn}>
                {!isOwn && (
                  <MessageSender>
                    {msg.senderUsername || 'Unknown'}
                  </MessageSender>
                )}
                <MessageBubble $isOwn={isOwn}>
                  <MessageContent>
                    {isEncrypted ? '[Encrypted Message]' : msg.content || ''}
                  </MessageContent>
                </MessageBubble>
                <MessageTime>{formatSafeTime(msg.timestamp)}</MessageTime>
              </Message>
            );
          })}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <ChatInput
            type="text"
            placeholder={t('chat.input.placeholder') || 'Type a message...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!isConnected}
            aria-label={t('chat.input.ariaLabel') || 'Message input'}
          />
          <Button
            onClick={handleSend}
            disabled={!isConnected || !inputValue.trim()}
            aria-label={t('chat.send') || 'Send message'}
          >
            {t('chat.send') || 'Send'}
          </Button>
        </InputContainer>
      </ChatContainer>
    </PageLayout>
  );
}
