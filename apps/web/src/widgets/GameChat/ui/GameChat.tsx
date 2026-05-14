import { useState, useRef, useEffect, type ReactNode } from 'react';
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
import { getPlayerColor } from '@/shared/lib/playerColors';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { useGameChatStore } from '../store/gameChatStore';
import type { ChatScope } from '../store/gameChatStore';

export interface ResolvedEquipped {
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
}

export type EquippedResolver = (id?: string | null) => ResolvedEquipped | null;

interface GameChatProps {
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
  /**
   * Maps a senderId to that user's currently-equipped shop cosmetics, used
   * to render avatars and inline badges in chat rows. Caller is expected to
   * derive this from the lobby's room.members payload (which now carries
   * equippedAvatarId / equippedBadgeId per member).
   */
  resolveEquipped?: EquippedResolver;
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

const RESULT_COLORS: Record<string, string> = {
  HIT: '#F97316', // orange
  MISS: '#94A3B8', // slate
  SUNK: '#EF4444', // red
};

const RESULT_PATTERN = /\b(HIT|MISS|SUNK)\b/;

function renderResultHighlights(message: string): ReactNode {
  // Split on the first occurrence of a result keyword; wrap that keyword
  // in a colored, bold span. The rest of the message stays as-is.
  const match = RESULT_PATTERN.exec(message);
  if (!match) return message;
  const idx = match.index;
  const keyword = match[0];
  const color = RESULT_COLORS[keyword];
  return (
    <>
      {message.slice(0, idx)}
      <span style={{ color, fontWeight: 800, fontStyle: 'normal' }}>
        {keyword}
      </span>
      {message.slice(idx + keyword.length)}
    </>
  );
}

export function GameChat({
  resolveDisplayName,
  resolveEquipped,
  currentUserId,
  onClose,
  teamMode,
}: GameChatProps) {
  const logs = useGameChatStore((s) => s.logs);
  const sendMessage = useGameChatStore((s) => s.sendMessage);
  const resolveActorColor = useGameChatStore((s) => s.resolveActorColor);

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
              const senderColor = log.senderId
                ? (resolveActorColor?.(log.senderId) ??
                  getPlayerColor(log.senderId))
                : undefined;
              const targetId = log.targetId;
              const targetName =
                targetId && resolveDisplayName
                  ? resolveDisplayName(targetId, undefined)
                  : (targetId ?? undefined);
              const targetColor = targetId
                ? (resolveActorColor?.(targetId) ?? getPlayerColor(targetId))
                : undefined;
              const contentNode =
                log.type === 'action' || log.type === 'system'
                  ? renderResultHighlights(log.message)
                  : undefined;
              return (
                <GameChatRow
                  key={log.id}
                  senderId={log.senderId ?? null}
                  senderName={log.senderId ? senderName : undefined}
                  senderColor={senderColor}
                  targetName={targetId ? targetName : undefined}
                  targetColor={targetColor}
                  content={log.message}
                  contentNode={contentNode}
                  type={log.type}
                  isOwn={isOwn}
                  resolveEquipped={resolveEquipped}
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

function GameChatRow({
  senderId,
  senderName,
  senderColor,
  targetName,
  targetColor,
  content,
  contentNode,
  type,
  isOwn,
  resolveEquipped,
}: {
  senderId: string | null;
  senderName?: string;
  senderColor?: string;
  targetName?: string;
  targetColor?: string;
  content: string;
  contentNode?: ReactNode;
  type: 'system' | 'action' | 'message';
  isOwn: boolean;
  resolveEquipped?: EquippedResolver;
}) {
  const resolved = senderId ? (resolveEquipped?.(senderId) ?? null) : null;
  const { avatarUrl, badgeUrl } = useEquippedCosmetics({
    equippedAvatarId: resolved?.equippedAvatarId,
    equippedBadgeId: resolved?.equippedBadgeId,
  });
  return (
    <ChatMessage
      senderName={senderName}
      senderColor={senderColor}
      targetName={targetName}
      targetColor={targetColor}
      content={content}
      contentNode={contentNode}
      type={type}
      isOwn={isOwn}
      avatarUrl={avatarUrl ?? undefined}
      badgeUrl={badgeUrl ?? undefined}
    />
  );
}
