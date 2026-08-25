'use client';

import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  PageLayout,
  Container,
  GlassCard,
  EmptyState,
  Button,
  Spinner,
} from '@arcadeum/ui';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  chatApi,
  type ChatMessage as ChatMessageData,
} from '@/features/chat/api';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { formatSafeTime } from '@/shared/lib/date';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const chatId = searchParams?.get('chatId') || null;
  const receiverIds = searchParams?.get('receiverIds') || '';
  const title = searchParams?.get('title') || 'Chat';

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store — field-level selectors keep unrelated chat-store writes from
  // re-rendering the page.
  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);
  const reset = useChatStore((s) => s.reset);
  const isLoading = useChatStore((s) => s.loading);
  const setLoading = useChatStore((s) => s.setLoading);

  // Handle chatId changes: reset messages and set loading state
  // We do this during render to avoid cascading renders in useEffect
  const [prevChatId, setPrevChatId] = useState(chatId);
  if (chatId !== prevChatId) {
    setPrevChatId(chatId);
    setLoading(true);
    reset();
  }

  // Socket Hook
  const { sendMessage, isConnected } = useChatSocket({ chatId, receiverIds });

  // Initial fetch
  useEffect(() => {
    if (!chatId || !snapshot.accessToken) return;

    chatApi
      .getMessages(chatId, { token: snapshot.accessToken })
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chatId, snapshot.accessToken, setMessages, setLoading]);

  // Reset messages on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
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

  // Authentication barrier
  if (!snapshot.accessToken) {
    return (
      <PageLayout>
        <Container
          className={'flex-1 justify-center items-center p-10'}
          size="md"
        >
          <GlassCard className={'p-10 items-center gap-5'}>
            <EmptyState
              icon="🔒"
              message={
                t('chat.loginRequired') || 'Login required to view messages'
              }
            />
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/auth')}
            >
              Log In
            </Button>
          </GlassCard>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-stretch absolute top-0 left-0 right-0 h-full z-[-1] opacity-[0.3] bg-[radial-gradient(circle_at_10%_20%,_var(--primaryGradientStart)_0%,_transparent_40%),_radial-gradient(circle_at_90%_80%,_var(--secondaryGradientStart)_0%,_transparent_40%)] pointer-events-none" />
      <Container className={'flex-1 pb-4 pt-4'} size="md">
        <GlassCard
          className={'flex-1 p-0 gap-0 border border-[var(--glassBorder)]'}
        >
          <ChatHeader
            title={title}
            isConnected={isConnected}
            statusText={
              isConnected
                ? t('chat.status.connected') || 'Connected'
                : t('chat.status.connecting') || 'Connecting...'
            }
          />

          <div
            className="overflow-auto flex-1 px-4 py-4"
            data-testid="chat-scroll-view"
          >
            <div
              className="flex flex-col items-stretch gap-4"
              data-testid="chat-messages-list"
            >
              {isLoading && messages.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center py-10">
                  <Spinner
                    className={'text-[var(--primary)]'}
                    data-testid="chat-loading-spinner"
                    size="large"
                  />
                </div>
              ) : (
                messages.map((msg: ChatMessageData) => {
                  if (!msg) return null;
                  const isEncrypted = !msg.content && '__encrypted' in msg;
                  if (!msg.content && !isEncrypted) return null;

                  const isOwn = msg.senderId === snapshot.userId;

                  return (
                    <ChatMessageRow
                      key={msg.id}
                      msg={msg}
                      isOwn={isOwn}
                      isEncrypted={isEncrypted}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={!isConnected}
            placeholder={t('chat.input.placeholder') || 'Type a message...'}
          />
        </GlassCard>
      </Container>
    </PageLayout>
  );
}

/**
 * Per-message wrapper so we can call useEquippedCosmetics inside the .map.
 * The hook reads from a module-level catalog cache, so spawning one per
 * message is cheap (no duplicate fetches).
 */
function ChatMessageRow({
  msg,
  isOwn,
  isEncrypted,
}: {
  msg: ChatMessageData;
  isOwn: boolean;
  isEncrypted: boolean;
}) {
  // The hook resolves name-color (used in the sender label outside the
  // avatar slot). Avatar/badge/frame/aura come back through PlayerAvatar.
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: msg.senderEquippedAvatarId,
    equippedBadgeId: msg.senderEquippedBadgeId,
    equippedNameColorId: msg.senderEquippedNameColorId,
    equippedFrameId: msg.senderEquippedFrameId,
    equippedAuraId: msg.senderEquippedAuraId,
    equippedBannerId: msg.senderEquippedBannerId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  return (
    <ChatMessage
      content={msg.content || ''}
      senderName={msg.senderUsername}
      senderColor={nameProps.color}
      senderNameStyle={nameProps.style}
      senderAvatar={
        <EquippedPlayerAvatar
          name={msg.senderUsername}
          size="sm"
          equippedAvatarId={msg.senderEquippedAvatarId}
          equippedBadgeId={msg.senderEquippedBadgeId}
          equippedNameColorId={msg.senderEquippedNameColorId}
          equippedFrameId={msg.senderEquippedFrameId}
          equippedAuraId={msg.senderEquippedAuraId}
          equippedBannerId={msg.senderEquippedBannerId}
        />
      }
      timestamp={formatSafeTime(msg.timestamp)}
      isOwn={isOwn}
      isEncrypted={isEncrypted}
    />
  );
}
