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
import { scrollbarStyles } from '@/shared/lib/styles';
import { useGameChatStore } from '../store/gameChatStore';
import type { ChatScope } from '../store/gameChatStore';

interface GameChatProps {
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
  currentUserId?: string | null;
  onClose?: () => void;
  teamMode?: boolean;
}

const FFA_SCOPES: { value: ChatScope; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'players', label: 'Players' },
  { value: 'private', label: 'Private' },
];

const TEAM_SCOPES: { value: ChatScope; label: string }[] = [
  { value: 'team', label: 'Team' },
  { value: 'all', label: 'All' },
  { value: 'private', label: 'Private' },
];

export function GameChat({
  resolveDisplayName,
  currentUserId,
  onClose,
  teamMode,
}: GameChatProps) {
  const logs = useGameChatStore((s) => s.logs);
  const sendMessage = useGameChatStore((s) => s.sendMessage);

  const scopes = teamMode ? TEAM_SCOPES : FFA_SCOPES;
  const [chatMessage, setChatMessage] = useState('');
  const [chatScope, setChatScope] = useState<ChatScope>(
    teamMode ? 'team' : 'all',
  );
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
            onClick={onClose}
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
        {scopes.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={chatScope === value ? 'primary' : 'secondary'}
            onClick={() => setChatScope(value)}
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
        className={scrollbarStyles.className}
      >
        {logs.length === 0 ? (
          <YStack flex={1} ai="center" jc="center" py="$10">
            <Typography alpha="low" textAlign="center" uiSize="sm">
              No messages yet. Break the ice!
            </Typography>
          </YStack>
        ) : (
          <YStack gap="$1">
            {logs.map((log) => {
              const isOwn = !!currentUserId && log.senderId === currentUserId;
              const senderName = resolveDisplayName
                ? resolveDisplayName(
                    log.senderId ?? undefined,
                    log.senderName ?? undefined,
                  )
                : (log.senderName ?? undefined);
              return (
                <ChatMessage
                  key={log.id}
                  senderName={senderName}
                  content={log.message}
                  type={log.type}
                  isOwn={isOwn}
                />
              );
            })}
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
              : chatScope === 'team'
                ? 'Send to team'
                : 'Private note'
        }
      />
    </GlassCard>
  );
}
