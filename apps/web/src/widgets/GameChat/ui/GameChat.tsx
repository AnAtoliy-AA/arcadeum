'use client';

import { useState, useRef, useEffect } from 'react';
import { XStack, YStack, ScrollView, Button, Input } from '@arcadeum/ui';
import { Text } from 'tamagui';
import type { ScrollView as TamaguiScrollView } from 'tamagui';
import { useGameChatStore } from '../store/gameChatStore';
import type { ChatScope } from '../store/gameChatStore';
import { ChatMessageBubble } from './ChatMessageBubble';

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
    // scrollToEnd works on both web and native ScrollView
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [logs.length]);

  const handleSend = () => {
    const trimmed = chatMessage.trim();
    if (!trimmed || !sendMessage) return;
    sendMessage(trimmed, chatScope);
    setChatMessage('');
  };

  const canSend = chatMessage.trim().length > 0 && !!sendMessage;

  return (
    <YStack
      flex={1}
      minHeight={350}
      backgroundColor="rgba(10,14,30,0.95)"
      borderRadius="$4"
      borderWidth={1}
      borderColor="rgba(99,102,241,0.3)"
      overflow="hidden"
    >
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="rgba(99,102,241,0.2)"
        flexShrink={0}
      >
        <Text fontSize="$5" fontWeight="700" color="$color">
          Table Chat
        </Text>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onPress={onClose}
            aria-label="Close Chat"
          >
            ✕
          </Button>
        )}
      </XStack>

      {/* Messages */}
      <ScrollView flex={1} ref={scrollRef}>
        {logs.length === 0 ? (
          <Text
            padding="$4"
            color="$colorSubtle"
            textAlign="center"
            fontSize="$3"
          >
            No messages yet. Break the ice!
          </Text>
        ) : (
          <YStack gap="$1" paddingVertical="$2">
            {logs.map((log) => (
              <ChatMessageBubble
                key={log.id}
                senderId={log.senderId ?? undefined}
                senderName={
                  resolveDisplayName
                    ? resolveDisplayName(
                        log.senderId ?? undefined,
                        log.senderName ?? undefined,
                      )
                    : (log.senderName ?? undefined)
                }
                message={log.message}
                type={log.type}
                scope={log.scope}
              />
            ))}
          </YStack>
        )}
      </ScrollView>

      {/* Scope toggle */}
      <XStack
        paddingHorizontal="$3"
        paddingVertical="$2"
        gap="$2"
        borderTopWidth={1}
        borderTopColor="rgba(99,102,241,0.15)"
        flexShrink={0}
      >
        {SCOPES.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={chatScope === value ? 'secondary' : 'ghost'}
            onPress={() => setChatScope(value)}
            flex={1}
          >
            {label}
          </Button>
        ))}
      </XStack>

      {/* Input row */}
      <XStack
        paddingHorizontal="$4"
        paddingBottom="$4"
        paddingTop="$3"
        gap="$3"
        alignItems="center"
        borderTopWidth={1}
        borderTopColor="rgba(99,102,241,0.15)"
        flexShrink={0}
      >
        <Input
          flex={1}
          value={chatMessage}
          onChangeText={setChatMessage}
          placeholder={
            chatScope === 'all'
              ? 'Send a note to everyone'
              : chatScope === 'players'
                ? 'Send a note to players'
                : 'Send a private note to yourself'
          }
          onSubmitEditing={handleSend}
          size="md"
        />
        <Button
          variant="secondary"
          size="md"
          onPress={handleSend}
          disabled={!canSend}
        >
          Send
        </Button>
      </XStack>
    </YStack>
  );
}
