'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
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
import { GameChatSystemRow, type SystemRowKind } from './GameChatSystemRow';
import type { EquippedResolver } from './types';
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
  QuickButton,
  QuickButtonText,
  QuickRow,
  Tab,
  TabCount,
  TabLabel,
  TabsRow,
  Title,
  TitleDot,
  UnreadBadge,
} from './GameChat.styled';

export type { ResolvedEquipped, EquippedResolver } from './types';

interface GameChatProps {
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
  resolveEquipped?: EquippedResolver;
  currentUserId?: string | null;
  onClose?: () => void;
  teamMode?: boolean;
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

const QUICK_PHRASES = ['gl hf', 'nice play', 'thinking…', 'gg'];

const RESULT_COLORS: Record<string, string> = {
  HIT: '#F97316',
  MISS: '#94A3B8',
  SUNK: '#EF4444',
};

const RESULT_PATTERN = /\b(HIT|MISS|SUNK)\b/;

const MONO_STYLE: React.CSSProperties = {
  fontFamily:
    "ui-monospace, SFMono-Regular, 'JetBrains Mono', 'Menlo', monospace",
};

function renderResultHighlights(message: string): ReactNode {
  const match = RESULT_PATTERN.exec(message);
  if (!match) return message;
  const idx = match.index;
  const keyword = match[0];
  const color = RESULT_COLORS[keyword];
  return (
    <>
      {message.slice(0, idx)}
      <span style={{ color, fontWeight: 800 }}>{keyword}</span>
      {message.slice(idx + keyword.length)}
    </>
  );
}

function inferSysKind(log: ChatLogEntry): SystemRowKind {
  const msg = log.message?.toLowerCase() ?? '';
  if (msg.includes('round')) return 'round';
  if (msg.includes('combo')) return 'combo';
  if (msg.includes('join') || msg.includes('placing') || msg.includes('left '))
    return 'join';
  return log.type === 'action' ? 'combo' : 'elim';
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
  onClose,
  teamMode,
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

  const send = () => {
    const trimmed = draft.trim();
    if (!trimmed || !sendMessage) return;
    sendMessage(trimmed, scope);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
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
                return (
                  <GameChatRow
                    key={log.id}
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
                );
              })}
            </ListGap>
          )}
        </ScrollView>
      </Body>

      <Foot>
        <QuickRow role="toolbar" aria-label="Quick phrases">
          {QUICK_PHRASES.map((p) => (
            <QuickButton
              key={p}
              onPress={() => setDraft((d) => (d ? `${d} ${p}` : p))}
              aria-label={p}
            >
              <QuickButtonText>{p}</QuickButtonText>
            </QuickButton>
          ))}
        </QuickRow>

        <InputPill
          focusStyle={{
            borderColor: `${ACCENT_PINK}88`,
            backgroundColor: 'rgba(0,0,0,0.32)',
          }}
        >
          <ChannelChip style={MONO_STYLE} color={SCOPE_CHIP_COLOR[scope]}>
            {SCOPE_CHIP[scope]}
          </ChannelChip>
          <input
            value={draft}
            maxLength={240}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={SCOPE_PLACEHOLDER[scope]}
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
            disabled={!draft.trim()}
            aria-label="Send message"
            style={{
              background: draft.trim() ? ACCENT_GRADIENT : undefined,
              opacity: draft.trim() ? 1 : 0.4,
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
