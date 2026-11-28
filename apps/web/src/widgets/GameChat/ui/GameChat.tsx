'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from 'react';
import { IconButton, CloseIcon, Typography } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

import { scrollbarStyles } from '@/shared/lib/styles';
import { useGameChatStore } from '../store/gameChatStore';
import type { ChatScope, ChatLogEntry } from '../store/gameChatStore';
import { useChatCollapsed } from '../hooks/useChatCollapsed';
import type { EquippedResolver } from './types';
import type { EmoteId } from './EmotePicker';
import { ChatQuickBar } from './ChatQuickBar';
import { ChatLogItem } from './ChatLogItem';
import { logBelongsToScope, lastMessagePreview } from './chatHelpers';
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
} from './GameChat.styles';

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
  /** When true the emote-picker button is hidden (SpectatorReactionsBar handles it). */
  isSpectating?: boolean;
}

const FFA_SCOPES: ChatScope[] = ['all', 'players', 'private'];
const TEAM_SCOPES: ChatScope[] = ['team', 'all', 'private'];

const SCOPE_KEYS = {
  all: { label: 'tabAll', chip: 'chipAll', placeholder: 'toAll' },
  team: { label: 'tabTeam', chip: 'chipTeam', placeholder: 'toTeam' },
  players: { label: 'tabPlayers', chip: 'chipTeam', placeholder: 'toPlayers' },
  private: { label: 'tabWhispers', chip: 'chipDm', placeholder: 'toWhisper' },
} as const;

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

function countIncoming(
  logs: ChatLogEntry[],
  currentUserId?: string | null,
): Record<ChatScope, number> {
  const c: Record<ChatScope, number> = {
    all: 0,
    team: 0,
    players: 0,
    private: 0,
  };
  for (const log of logs) {
    if (log.type !== 'message' || log.senderId === currentUserId) continue;
    const s = (log as ChatLogEntry & { scope?: ChatScope }).scope ?? 'all';
    if (s in c) c[s] += 1;
  }
  return c;
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
  signInPlaceholder,
  isSpectating: _isSpectating = false,
}: GameChatProps) {
  const { t } = useTranslation();
  const tc = (k: string, o?: Record<string, string | number>) =>
    t(`games.chatPanel.${k}` as TranslationKey, o);
  const logs = useGameChatStore((s) => s.logs);
  const sendMessage = useGameChatStore((s) => s.sendMessage);
  const resolveActorColor = useGameChatStore((s) => s.resolveActorColor);
  const inputColor = 'var(--color)';

  const scopes = teamMode ? TEAM_SCOPES : FFA_SCOPES;
  const [draft, setDraft] = useState('');
  const [scope, setScope] = useState<ChatScope>(teamMode ? 'team' : 'all');
  const [collapsed, setCollapsed] = useChatCollapsed();
  const [unread, setUnread] = useState(0);
  const [readCounts, setReadCounts] = useState<Record<ChatScope, number>>(() =>
    countIncoming(logs, currentUserId),
  );
  const lastSeenIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs.length, collapsed]);

  useEffect(() => {
    if (collapsed) return;
    lastSeenIdRef.current = logs.at(-1)?.id ?? null;
    // Opening the chat marks everything as read; this is a reset on an
    // external event (expand), not state derivable during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const incomingCounts = useMemo(
    () => countIncoming(logs, currentUserId),
    [logs, currentUserId],
  );

  const selectScope = (s: ChatScope) => {
    // Mark the tab being left as read so only later messages count as unread.
    setReadCounts((prev) => ({
      ...prev,
      [scope]: incomingCounts[scope],
      [s]: incomingCounts[s],
    }));
    setScope(s);
  };

  const scopeUnread = (s: ChatScope) =>
    s === scope
      ? 0
      : Math.min(99, Math.max(0, incomingCounts[s] - readCounts[s]));

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
        aria-label={tc('expand')}
        onClick={() => setCollapsed(false)}
      >
        <TitleDot />
        <Title>{tc('chat')}</Title>
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
          <Title>{tc('title')}</Title>
          <div className="flex flex-col items-stretch flex-1" />
          <IconButton
            className="p-1"
            size="sm"
            title={tc('settings')}
            aria-label={tc('settings')}
          >
            <span className="text-[14px]">⚙</span>
          </IconButton>
          <IconButton
            className="p-1"
            size="sm"
            onClick={() => setCollapsed(true)}
            title={tc('minimize')}
            aria-label={tc('minimize')}
          >
            <span className="text-[14px]">−</span>
          </IconButton>
          {onClose ? (
            <IconButton
              className="p-1"
              size="sm"
              onClick={onClose}
              title={tc('close')}
              aria-label={tc('close')}
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
                aria-selected={active}
                onClick={() => selectScope(s)}
                data-testid={`chat-tab-${s}`}
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
                  {tc(SCOPE_KEYS[s].label)}
                </TabLabel>
                {scopeUnread(s) > 0 ? (
                  <TabCount
                    aria-label={tc('unread', { count: scopeUnread(s) })}
                    data-testid={`chat-tab-unread-${s}`}
                    style={{
                      ...MONO_STYLE,
                      background: ACCENT_GRADIENT,
                      color: '#06011b',
                      fontWeight: 700,
                    }}
                  >
                    {scopeUnread(s) >= 99 ? '99+' : scopeUnread(s)}
                  </TabCount>
                ) : null}
              </Tab>
            );
          })}
        </TabsRow>
      </Head>

      <Body>
        <div
          className={`overflow-auto flex-1 ${scrollbarStyles.className}`}
          ref={scrollRef}
        >
          {visibleLogs.length === 0 ? (
            <div className="flex flex-col flex-1 items-center justify-center py-10">
              <Typography className={'text-center'} alpha="low" uiSize="sm">
                {tc('empty')}
              </Typography>
            </div>
          ) : (
            <ListGap role="log" aria-live="polite" aria-relevant="additions">
              <Divider>
                <div className="flex flex-col items-stretch h-[1px] flex-1 bg-[rgba(255,255,255,0.06)]" />
                <DividerLabel style={MONO_STYLE}>{tc('match')}</DividerLabel>
                <div className="flex flex-col items-stretch h-[1px] flex-1 bg-[rgba(255,255,255,0.06)]" />
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
                  ? (resolveActorColor?.(log.senderId) ?? undefined)
                  : undefined;
                const targetId = log.targetId;
                const targetName = targetId
                  ? resolveDisplayName
                    ? resolveDisplayName(targetId, undefined)
                    : targetId
                  : undefined;
                const targetColor = targetId
                  ? (resolveActorColor?.(targetId) ?? undefined)
                  : undefined;
                return (
                  <ChatLogItem
                    key={log.id}
                    log={log}
                    senderName={senderName}
                    senderColor={senderColor}
                    targetName={targetName}
                    targetColor={targetColor}
                    currentUserId={currentUserId}
                    resolveEquipped={resolveEquipped}
                    isHost={isHost}
                    onDeleteMessage={onDeleteMessage}
                  />
                );
              })}
            </ListGap>
          )}
        </div>
      </Body>

      <Foot>
        <ChatQuickBar
          onEmote={onEmote}
          onQuickPhrase={(p) => setDraft((d) => (d ? `${d} ${p}` : p))}
          canSend={canSend}
        />

        <InputPill
          style={{
            ...(canSend
              ? {
                  borderColor: `${ACCENT_PINK}88`,
                  backgroundColor: 'rgba(0,0,0,0.32)',
                }
              : undefined),
            opacity: canSend ? 1 : 0.5,
            pointerEvents: canSend ? 'auto' : 'none',
          }}
        >
          <ChannelChip style={MONO_STYLE} color={SCOPE_CHIP_COLOR[scope]}>
            {tc(SCOPE_KEYS[scope].chip)}
          </ChannelChip>
          <input
            value={draft}
            maxLength={240}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              canSend
                ? tc(SCOPE_KEYS[scope].placeholder)
                : (signInPlaceholder ?? tc('signIn'))
            }
            disabled={!canSend}
            aria-label={tc('message')}
            data-testid="chat-input"
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
            className="p-1"
            style={{
              background: draft.trim() && canSend ? ACCENT_GRADIENT : undefined,
              opacity: draft.trim() && canSend ? 1 : 0.4,
              width: 30,
              height: 30,
              borderRadius: 9,
            }}
            size="sm"
            onClick={send}
            disabled={!draft.trim() || !canSend}
            aria-label={tc('send')}
            data-testid="chat-send-btn"
          >
            <span className="text-[14px] text-[#06011b] font-bold">↑</span>
          </IconButton>
        </InputPill>

        <MetaLine>
          <MetaText style={MONO_STYLE}>{draft.length}/240</MetaText>
          <div className="flex flex-row gap-6 items-center">
            <MetaText style={MONO_STYLE}>{tc('hintSend')}</MetaText>
            <MetaText style={MONO_STYLE}>{tc('hintNewline')}</MetaText>
          </div>
        </MetaLine>
      </Foot>
    </Panel>
  );
}
