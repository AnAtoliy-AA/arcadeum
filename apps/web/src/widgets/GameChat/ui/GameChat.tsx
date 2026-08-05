'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from 'react';
import { XStack, YStack, ScrollView, Text, useTheme } from 'tamagui';
import { IconButton, CloseIcon, Typography } from '@arcadeum/ui';
import type { ScrollView as TamaguiScrollView } from 'tamagui';
import { scrollbarStyles } from '@/shared/lib/styles';
import { getPlayerColor } from '@/shared/lib/playerColors';
import { useGameChatStore } from '../store/gameChatStore';
import type { ChatScope, ChatLogEntry } from '../store/gameChatStore';
import { useChatCollapsed } from '../hooks/useChatCollapsed';
import { GameChatRow } from './GameChatRow';
import { GameChatSystemRow, type SystemRowKind, GameChatEmoteRow } from './GameChatSystemRow';
import type { EquippedResolver } from './types';
import type { EmoteId } from './EmotePicker';
import { ChatQuickBar } from './ChatQuickBar';
import {
  ACCENT_GRADIENT,
  ACCENT_PINK,
  Body,
  ChannelChip,
  CollapsedPreview,
  CollapsedShell,
  Divider,
  DividerLabel,
  Foot,
  Head,
  HeadRow,
  InputPill,
  ListGap,
  MetaLine,
  MetaText,
  Panel,
  Tab,
  TabCount,
  TabLabel,
  TabsRow,
  Title,
  TitleDot,
  UnreadBadge,
} from './GameChat.styled';
import { parseMoveCell, renderResultHighlights } from './chatHelpers';

export type { ResolvedEquipped, EquippedResolver } from './types';

interface GameChatProps {
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
  resolveEquipped?: EquippedResolver;
  currentUserId?: string | null;
  isAuthenticated?: boolean;
  isPlayer?: boolean;
  onClose?: () => void;
  teamMode?: boolean;
  onEmote?: (emoteId: EmoteId) => void;
  isHost?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  signInPlaceholder?: string;
}

const FFA_SCOPES: ChatScope[] = ['all', 'players', 'private'];
const TEAM_SCOPES: ChatScope[] = ['team', 'all', 'private'];

const SCOPE_LABEL: Record<ChatScope, string> = {
  all: 'All',
  team: 'Team',
  players: 'Players',
  private: 'Whispers',
};

const SCOPE_CHIP: Record<ChatScope, string> = {
  all: 'ALL',
  team: 'TEAM',
  players: 'TEAM',
  private: 'DM',
};

const SCOPE_PLACEHOLDER: Record<ChatScope, string> = {
  all: 'Send to everyone',
  team: 'Send to team',
  players: 'Send to players',
  private: 'Private note',
};

const SCOPE_CHIP_COLOR: Record<ChatScope, string> = {
  all: '#9CA3AF',
  team: '#22D3EE',
  players: '#22D3EE',
  private: '#A78BFA',
};

const MONO_STYLE: React.CSSProperties = {
  fontFamily:
    "ui-monospace, SFMono-Regular, 'JetBrains Mono', 'Menlo', monospace",
};

function inferSysKind(log: ChatLogEntry): SystemRowKind {
  const msg = log.message?.toLowerCase() ?? '';
  if (msg.includes('round')) return 'round';
  if (msg.includes('combo')) return 'combo';
  if (msg.includes('join') || msg.includes('placing') || msg.includes('left '))
    return 'join';
  return log.type === 'action' ? 'combo' : 'elim';
}

const EMOJI_STARTER = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

function parseEmoteMessage(message: string): { emoji: string; name: string } | null {
  const firstCodePoint = message.codePointAt(0);
  if (firstCodePoint === undefined) return null;
  const firstChar = String.fromCodePoint(firstCodePoint);
  if (!EMOJI_STARTER.test(firstChar)) return null;
  const spaceIdx = message.indexOf(' ');
  if (spaceIdx === -1) return { emoji: message, name: '' };
  return {
    emoji: message.slice(0, spaceIdx),
    name: message.slice(spaceIdx + 1),
  };
}

function logBelongsToScope(log: ChatLogEntry, scope: ChatScope): boolean {
  if (log.type !== 'message') return scope === 'all';
  const logScope = (log as ChatLogEntry & { scope?: ChatScope }).scope;
  if (!logScope) return scope === 'all';
  return logScope === scope;
}

function lastMessagePreview(logs: ChatLogEntry[]): string {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (log.type === 'message') {
      const name = log.senderName ?? 'Someone';
      const text = log.message ?? '';
      return `${name}: ${text}`;
    }
  }
  return 'No messages yet';
}

export function GameChat({
  resolveDisplayName,
  resolveEquipped,
  currentUserId,
  isAuthenticated = false,
  isPlayer = false,
  onClose,
  teamMode,
  onEmote,
  isHost,
  onDeleteMessage,
  signInPlaceholder = 'Sign in to chat',
}: GameChatProps) {
  const logs = useGameChatStore((s) => s.logs);
  const sendMessage = useGameChatStore((s) => s.sendMessage);
  const resolveActorColor = useGameChatStore((s) => s.resolveActorColor);
  const theme = useTheme();
  const inputColor = (theme.color?.get?.() as string | undefined) ?? '#ecefee';

  const scopes = teamMode ? TEAM_SCOPES : FFA_SCOPES;
  const [draft, setDraft] = useState('');
  const [scope, setScope] = useState<ChatScope>(teamMode ? 'team' : 'all');
  const [collapsed, setCollapsed] = useChatCollapsed();
  const [unread, setUnread] = useState(0);
  const lastSeenIdRef = useRef<string | null>(null);
  const scrollRef = useRef<TamaguiScrollView>(null);

  useEffect(() => {
    if (!collapsed) scrollRef.current?.scrollToEnd({ animated: true });
  }, [logs.length, collapsed]);

  useEffect(() => {
    if (collapsed) return;
    lastSeenIdRef.current = logs.at(-1)?.id ?? null;
    setUnread(0);
  }, [collapsed, logs]);

  useEffect(() => {
    if (!collapsed) return;
    const seenId = lastSeenIdRef.current;
    const lastIdx = seenId ? logs.findIndex((l) => l.id === seenId) : -1;
    const newOnes = logs
      .slice(lastIdx + 1)
      .filter((l) => l.type === 'message' && l.senderId !== currentUserId);
    if (newOnes.length > 0) {
      setUnread((u) => Math.min(99, u + newOnes.length));
      lastSeenIdRef.current = logs.at(-1)?.id ?? seenId;
    }
  }, [logs, collapsed, currentUserId]);

  const counts = useMemo(() => {
    const c: Record<ChatScope, number> = {
      all: 0,
      team: 0,
      players: 0,
      private: 0,
    };
    for (const log of logs) {
      if (log.type !== 'message') continue;
      const s = (log as ChatLogEntry & { scope?: ChatScope }).scope ?? 'all';
      if (s in c) c[s]! += 1;
    }
    return c;
  }, [logs]);

  const visibleLogs = useMemo(
    () => logs.filter((l) => logBelongsToScope(l, scope)),
    [logs, scope],
  );

  const canSend = isPlayer || isAuthenticated;
  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed || !sendMessage || !canSend) return;
    sendMessage(trimmed, scope);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) send();
    }
  };

  if (collapsed) {
    return (
      <CollapsedShell
        role="button"
        aria-label="Expand chat"
        onPress={() => setCollapsed(false)}
      >
        <TitleDot />
        <Title>Chat</Title>
        <CollapsedPreview>{lastMessagePreview(logs)}</CollapsedPreview>
        {unread > 0 ? (
          <UnreadBadge
            style={{
              ...MONO_STYLE,
              background: ACCENT_GRADIENT,
            }}
          >
            {unread >= 99 ? '99+' : String(unread)}
          </UnreadBadge>
        ) : null}
      </CollapsedShell>
    );
  }

  return (
    <Panel data-testid="game-chat-panel">
      <style>{`.chat-msg-row:hover .chat-delete-btn { opacity: 1 !important; }`}</style>
      <Head>
        <HeadRow>
          <TitleDot />
          <Title>Table Chat</Title>
          <YStack flex={1} />
          <IconButton
            size="sm"
            padding="$1"
            title="Settings"
            aria-label="Chat settings"
          >
            <Text fontSize={14}>⚙</Text>
          </IconButton>
          <IconButton
            size="sm"
            padding="$1"
            onClick={() => setCollapsed(true)}
            title="Minimize"
            aria-label="Minimize chat"
          >
            <Text fontSize={14}>—</Text>
          </IconButton>
          {onClose ? (
            <IconButton
              size="sm"
              padding="$1"
              onClick={onClose}
              title="Close"
              aria-label="Close chat"
            >
              <CloseIcon size={14} />
            </IconButton>
          ) : null}
        </HeadRow>

        <TabsRow role="tablist">
          {scopes.map((s) => {
            const active = s === scope;
            return (
              <Tab
                key={s}
                role="tab"
                aria-selected={active}
                onPress={() => setScope(s)}
                style={
                  active
                    ? {
                        background: ACCENT_GRADIENT,
                        boxShadow: `0 4px 12px -4px ${ACCENT_PINK}80, 0 0 0 1px rgba(255,255,255,0.18) inset`,
                      }
                    : undefined
                }
              >
                <TabLabel color={active ? '#06011b' : undefined}>
                  {SCOPE_LABEL[s]}
                </TabLabel>
                {counts[s] > 0 ? (
                  <TabCount
                    style={MONO_STYLE}
                    backgroundColor={
                      active ? 'rgba(6,1,27,0.25)' : 'rgba(255,255,255,0.08)'
                    }
                    color={
                      active ? 'rgba(6,1,27,0.9)' : 'rgba(255,255,255,0.7)'
                    }
                  >
                    {counts[s]}
                  </TabCount>
                ) : null}
              </Tab>
            );
          })}
        </TabsRow>
      </Head>

      <Body>
        <ScrollView
          ref={scrollRef}
          flex={1}
          className={scrollbarStyles.className}
        >
          {visibleLogs.length === 0 ? (
            <YStack flex={1} ai="center" jc="center" py="$10">
              <Typography alpha="low" textAlign="center" uiSize="sm">
                No messages yet. Break the ice!
              </Typography>
            </YStack>
          ) : (
            <ListGap role="log" aria-live="polite" aria-relevant="additions">
              <Divider>
                <YStack
                  height={1}
                  flex={1}
                  backgroundColor="rgba(255,255,255,0.06)"
                />
                <DividerLabel style={MONO_STYLE}>Match</DividerLabel>
                <YStack
                  height={1}
                  flex={1}
                  backgroundColor="rgba(255,255,255,0.06)"
                />
              </Divider>
              {visibleLogs.map((log) => {
                const senderName = log.senderId
                  ? resolveDisplayName
                    ? resolveDisplayName(
                        log.senderId ?? undefined,
                        log.senderName ?? undefined,
                      )
                    : (log.senderName ?? undefined)
                  : undefined;
                const senderColor = log.senderId
                  ? (resolveActorColor?.(log.senderId) ??
                    getPlayerColor(log.senderId))
                  : undefined;
                const targetId = log.targetId;
                const targetName = targetId
                  ? resolveDisplayName
                    ? resolveDisplayName(targetId, undefined)
                    : targetId
                  : undefined;
                const targetColor = targetId
                  ? (resolveActorColor?.(targetId) ?? getPlayerColor(targetId))
                  : undefined;
                if (log.type === 'system' || log.type === 'action') {
                  const moveCell = parseMoveCell(log.message);
                  if (moveCell) {
                    return (
                      <GameChatRow
                        key={log.id}
                        senderId={log.senderId ?? null}
                        senderName={log.senderId ? senderName : undefined}
                        senderColor={senderColor}
                        content={log.message}
                        type="action"
                        isOwn={false}
                        resolveEquipped={resolveEquipped}
                        moveCell={moveCell}
                        onMoveHover={(cell) =>
                          useGameChatStore.getState().setHighlightedCell(cell)
                        }
                        onMoveClick={(cell) =>
                          useGameChatStore.getState().setPersistedCell(cell)
                        }
                      />
                    );
                  }
                  const emote = parseEmoteMessage(log.message);
                  if (emote) {
                    return (
                      <GameChatEmoteRow
                        key={log.id}
                        emoji={emote.emoji}
                        senderName={senderName}
                        senderColor={senderColor}
                        senderId={log.senderId ?? null}
                        resolveEquipped={resolveEquipped}
                      />
                    );
                  }
                  return (
                    <GameChatSystemRow
                      key={log.id}
                      kind={inferSysKind(log)}
                      content={renderResultHighlights(log.message)}
                      senderName={senderName}
                      senderColor={senderColor}
                      targetName={targetName}
                      targetColor={targetColor}
                    />
                  );
                }
                const isOwn = !!currentUserId && log.senderId === currentUserId;
                const emote = parseEmoteMessage(log.message);
                if (emote) {
                  return (
                    <div
                      key={log.id}
                      className="chat-msg-row"
                      style={{ position: 'relative' }}
                    >
                      <GameChatEmoteRow
                        emoji={emote.emoji}
                        senderName={senderName}
                        senderColor={senderColor}
                        senderId={log.senderId ?? null}
                        resolveEquipped={resolveEquipped}
                      />
                      {(isHost || log.senderId === currentUserId) && onDeleteMessage && (
                        <button
                          className="chat-delete-btn"
                          onClick={() => onDeleteMessage(log.id)}
                          title="Delete message"
                          aria-label="Delete message"
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(239,68,68,0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            lineHeight: '20px',
                            cursor: 'pointer',
                            opacity: 0,
                            transition: 'opacity 120ms ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = '1')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = '0')
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={log.id}
                    className="chat-msg-row"
                    style={{ position: 'relative' }}
                  >
                    <GameChatRow
                      senderId={log.senderId ?? null}
                      senderName={log.senderId ? senderName : undefined}
                      senderColor={senderColor}
                      targetName={targetId ? targetName : undefined}
                      targetColor={targetColor}
                      content={log.message}
                      type={log.type}
                      isOwn={isOwn}
                      resolveEquipped={resolveEquipped}
                    />
                    {(isHost || log.senderId === currentUserId) && onDeleteMessage && (log.type === 'message' || log.type === 'action') && (
                      <button
                        className="chat-delete-btn"
                        onClick={() => onDeleteMessage(log.id)}
                        title="Delete message"
                        aria-label="Delete message"
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(239,68,68,0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          width: 20,
                          height: 20,
                          fontSize: 12,
                          lineHeight: '20px',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 120ms ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = '1')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = '0')
                        }
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </ListGap>
          )}
        </ScrollView>
      </Body>

      <Foot>
        <ChatQuickBar
          onEmote={onEmote}
          onQuickPhrase={(p) => setDraft((d) => (d ? `${d} ${p}` : p))}
        />

        <InputPill
          focusStyle={
            canSend
              ? {
                  borderColor: `${ACCENT_PINK}88`,
                  backgroundColor: 'rgba(0,0,0,0.32)',
                }
              : undefined
          }
          opacity={canSend ? 1 : 0.5}
          pointerEvents={canSend ? 'auto' : 'none'}
        >
          <ChannelChip style={MONO_STYLE} color={SCOPE_CHIP_COLOR[scope]}>
            {SCOPE_CHIP[scope]}
          </ChannelChip>
          <input
            value={draft}
            maxLength={240}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              canSend
                ? SCOPE_PLACEHOLDER[scope]
                : signInPlaceholder
            }
            disabled={!canSend}
            aria-label="Message"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: inputColor,
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />
          <IconButton
            size="sm"
            padding="$1"
            onClick={send}
            disabled={!draft.trim() || !canSend}
            aria-label="Send message"
            style={{
              background: draft.trim() && canSend ? ACCENT_GRADIENT : undefined,
              opacity: draft.trim() && canSend ? 1 : 0.4,
              width: 30,
              height: 30,
              borderRadius: 9,
            }}
          >
            <Text fontSize={14} color="#06011b" fontWeight="700">
              ↑
            </Text>
          </IconButton>
        </InputPill>

        <MetaLine>
          <MetaText style={MONO_STYLE}>{draft.length}/240</MetaText>
          <XStack gap={6} alignItems="center">
            <MetaText style={MONO_STYLE}>↵ send</MetaText>
            <MetaText style={MONO_STYLE}>⇧↵ newline</MetaText>
          </XStack>
        </MetaLine>
      </Foot>
    </Panel>
  );
}
