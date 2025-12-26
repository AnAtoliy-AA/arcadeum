'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PageLayout, Container, Button, Input } from '@/shared/ui';

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

const StatusDot = styled.span<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ connected }) => (connected ? '#22c55e' : '#f59e0b')};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div<{ isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: ${({ isOwn }) => (isOwn ? 'flex-end' : 'flex-start')};
  max-width: 70%;
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: ${({ isOwn, theme }) =>
    isOwn
      ? theme.buttons.primary.gradientStart
      : theme.surfaces.card.background};
  color: ${({ isOwn, theme }) =>
    isOwn ? theme.buttons.primary.text : theme.text.primary};
  border: ${({ isOwn, theme }) =>
    isOwn ? 'none' : `1px solid ${theme.surfaces.card.border}`};
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

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  receiverIds: string[];
  content: string;
  timestamp: string;
}

export function ChatPage() {
  const searchParams = useSearchParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const chatId = searchParams?.get('chatId') || null;
  const receiverIds = searchParams?.get('receiverIds') || '';
  const title = searchParams?.get('title') || 'Chat';

  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAuthenticatedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  useEffect(() => {
    if (!chatId || !snapshot.accessToken) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const url = resolveApiUrl(`/chat/${chatId}/messages`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessagesList(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();

    // Connect to WebSocket
    const wsUrl = resolveApiUrl('/').replace('http', 'ws');
    const ws = new WebSocket(wsUrl);
    isAuthenticatedRef.current = false;

    ws.onopen = () => {
      // Send authentication message after connection
      ws.send(
        JSON.stringify({
          type: 'authenticate',
          token: snapshot.accessToken,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'authenticated') {
          isAuthenticatedRef.current = true;
          setIsConnected(true);
          // Join chat after authentication
          ws.send(
            JSON.stringify({
              type: 'joinChat',
              chatId,
              currentUserId: snapshot.userId,
              users: [snapshot.userId, ...receiverIds.split(',')],
            }),
          );
        } else if (data.type === 'message') {
          setMessagesList((prev) => [...prev, data.message]);
        } else if (data.type === 'chatMessages') {
          setMessagesList(data.messages || []);
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.message);
          setIsConnected(false);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      isAuthenticatedRef.current = false;
    };

    socketRef.current = ws;

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      socketRef.current = null;
    };
  }, [chatId, snapshot.accessToken, snapshot.userId, receiverIds]);

  const handleSend = useCallback(async () => {
    if (
      !inputValue.trim() ||
      !chatId ||
      !snapshot.accessToken ||
      !socketRef.current
    )
      return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: snapshot.userId || '',
      senderUsername: snapshot.displayName || snapshot.username || 'You',
      receiverIds: receiverIds.split(',').filter(Boolean),
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      socketRef.current.send(
        JSON.stringify({
          type: 'message',
          chatId,
          senderId: message.senderId,
          senderUsername: message.senderUsername,
          receiverIds: message.receiverIds,
          content: message.content,
        }),
      );

      setMessagesList((prev) => [...prev, message]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [inputValue, chatId, snapshot, receiverIds]);

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
              connected={isConnected}
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
          {messagesList.map((msg) => {
            const isOwn = msg.senderId === snapshot.userId;
            return (
              <Message key={msg.id} isOwn={isOwn}>
                {!isOwn && <MessageSender>{msg.senderUsername}</MessageSender>}
                <MessageBubble isOwn={isOwn}>
                  <MessageContent>{msg.content}</MessageContent>
                </MessageBubble>
                <MessageTime>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </MessageTime>
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
