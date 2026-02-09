'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  PageLayout,
  Container,
  Button,
  Input,
  GlassCard,
  Avatar,
  EmptyState,
  PageTitle,
} from '@/shared/ui';
import { chatApi } from '@/features/chat/api';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { formatSafeTime } from '@/shared/lib/date';

const ChatLayout = styled(Container)`
  height: calc(100vh - 4rem); /* Adjust based on navbar height if needed */
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
`;

const ChatCard = styled(GlassCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  gap: 0;
`;

const Header = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.surfaces.card.background}80;
  backdrop-filter: blur(10px);
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Status = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.muted};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $connected }) => ($connected ? '#22c55e' : '#f59e0b')};
  box-shadow: 0 0 8px
    ${({ $connected }) => ($connected ? '#22c55e80' : 'transparent')};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.surfaces.card.border};
    border-radius: 3px;
  }
`;

const MessageGroup = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
  max-width: 75%;
  align-self: ${({ $isOwn }) => ($isOwn ? 'flex-end' : 'flex-start')};
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: ${({ $isOwn }) =>
    $isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${({ $isOwn, theme }) =>
    $isOwn
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart})`
      : theme.surfaces.card.background};
  color: ${({ $isOwn, theme }) =>
    $isOwn ? theme.buttons.primary.text : theme.text.primary};
  border: ${({ $isOwn, theme }) =>
    $isOwn ? 'none' : `1px solid ${theme.surfaces.card.border}`};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  padding: 0 0.5rem;
`;

const SenderName = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.muted};
`;

const MessageContent = styled.div`
  word-wrap: break-word;
  line-height: 1.5;
`;

const MessageTime = styled.span<{ $isOwn: boolean }>`
  font-size: 0.7rem;
  color: ${({ $isOwn, theme }) =>
    $isOwn ? 'rgba(255, 255, 255, 0.7)' : theme.text.muted};
  margin-left: 0.5rem;
  display: inline-block;
`;

const InputArea = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  gap: 1rem;
  align-items: center;
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
        <Container size="md">
          <GlassCard>
            <EmptyState message={t('chat.notFound') || 'Chat not found'} />
          </GlassCard>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ChatLayout size="md">
        <ChatCard>
          <Header>
            <HeaderInfo>
              <PageTitle size="sm" gradient>
                {title}
              </PageTitle>
              <Status>
                <StatusDot $connected={isConnected} />
                {isConnected
                  ? t('chat.status.connected') || 'Connected'
                  : t('chat.status.connecting') || 'Connecting...'}
              </Status>
            </HeaderInfo>
          </Header>

          <MessagesContainer>
            {messages.map((msg) => {
              const isEncrypted = !msg.content && '__encrypted' in msg;
              if (!msg || (!msg.content && !isEncrypted)) return null;

              const isOwn = msg.senderId === snapshot.userId;

              return (
                <MessageGroup key={msg.id} $isOwn={isOwn}>
                  {!isOwn && (
                    <MessageMeta>
                      <Avatar name={msg.senderUsername} size="sm" />
                      <SenderName>{msg.senderUsername || 'Unknown'}</SenderName>
                    </MessageMeta>
                  )}
                  <MessageBubble $isOwn={isOwn}>
                    <MessageContent>
                      {isEncrypted ? '[Encrypted Message]' : msg.content || ''}
                      <MessageTime $isOwn={isOwn}>
                        {formatSafeTime(msg.timestamp)}
                      </MessageTime>
                    </MessageContent>
                  </MessageBubble>
                </MessageGroup>
              );
            })}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea>
            <Input
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
              fullWidth
            />
            <Button
              onClick={handleSend}
              disabled={!isConnected || !inputValue.trim()}
              aria-label={t('chat.send') || 'Send message'}
            >
              {t('chat.send') || 'Send'}
            </Button>
          </InputArea>
        </ChatCard>
      </ChatLayout>
    </PageLayout>
  );
}
