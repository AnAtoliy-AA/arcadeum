import { useState, useRef, useEffect } from 'react';
import {
  XStack,
  YStack,
  ScrollView,
  Button,
  ChatMessage,
  ChatInput,
  Typography,
  GlassCard,
  CloseIcon,
} from '@arcadeum/ui';
import type { ScrollView as TamaguiScrollView } from 'tamagui';
import { useGameChatStore } from '../store/gameChatStore';
import type { ChatScope } from '../store/gameChatStore';

interface GameChatProps {
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
  onClose?: () => void;
}

const SCOPES: { value: ChatScope; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'players', label: 'Players' },
  { value: 'private', label: 'Private' },
];

export function GameChat({ resolveDisplayName, onClose }: GameChatProps) {
  const logs = useGameChatStore((s) => s.logs);
  const sendMessage = useGameChatStore((s) => s.sendMessage);

  const [chatMessage, setChatMessage] = useState('');
  const [chatScope, setChatScope] = useState<ChatScope>('all');
  const scrollRef = useRef<TamaguiScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [logs.length]);

  const handleSend = () => {
    const trimmed = chatMessage.trim();
    if (!trimmed || !sendMessage) return;
    sendMessage(trimmed, chatScope);
    setChatMessage('');
  };

  return (
    <GlassCard
      flex={1}
      minHeight={350}
      p={0}
      overflow="hidden"
      borderWidth={1}
      borderColor="$glassBorder"
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$glassBorder"
        backgroundColor="$glassBg"
      >
        <Typography uiSize="md" weight="700">
          Table Chat
        </Typography>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onPress={onClose}
            circular
            icon={<CloseIcon size={16} />}
            aria-label="Close Chat"
          />
        )}
      </XStack>

      {/* Scope toggle */}
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$2"
        gap="$2"
        backgroundColor="$glassBg"
        borderBottomWidth={1}
        borderBottomColor="$glassBorder"
      >
        {SCOPES.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={chatScope === value ? 'primary' : 'secondary'}
            onPress={() => setChatScope(value)}
            flex={1}
          >
            {label}
          </Button>
        ))}
      </XStack>

      {/* Messages */}
      <ScrollView
        flex={1}
        ref={scrollRef}
        paddingHorizontal="$4"
        paddingVertical="$2"
      >
        {logs.length === 0 ? (
          <YStack flex={1} ai="center" jc="center" py="$10">
            <Typography alpha="low" textAlign="center" uiSize="sm">
              No messages yet. Break the ice!
            </Typography>
          </YStack>
        ) : (
          <YStack gap="$1">
            {logs.map((log) => (
              <ChatMessage
                key={log.id}
                senderName={
                  resolveDisplayName
                    ? resolveDisplayName(
                        log.senderId ?? undefined,
                        log.senderName ?? undefined,
                      )
                    : (log.senderName ?? undefined)
                }
                content={log.message}
                type={log.type}
                isOwn={false} // Store doesn't track isOwn specifically in logs, but we could add it
              />
            ))}
          </YStack>
        )}
      </ScrollView>

      {/* Input row */}
      <ChatInput
        value={chatMessage}
        onChange={setChatMessage}
        onSend={handleSend}
        placeholder={
          chatScope === 'all'
            ? 'Send to everyone'
            : chatScope === 'players'
              ? 'Send to players'
              : 'Private note'
        }
      />
    </GlassCard>
  );
}
