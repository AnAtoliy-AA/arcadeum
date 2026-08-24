'use client';

import '@/features/games/ui/scrollbar.scss';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useFullscreen } from '@/features/games/hooks/useFullscreen';
import { ConnectionOverlay } from '@arcadeum/ui/components/ConnectionOverlay/ConnectionOverlay';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import { GameChat, useGameChatStore } from '@/widgets/GameChat';
import { useEmotes } from '@/features/games/hooks/useEmotes';
import { useGameRoomChat } from '@/features/games/hooks/useGameRoomChat';
import { gameSocket } from '@/shared/lib/socket';
import { ActiveEmotesProvider } from '@/features/games/ui/GameWidgetContainer';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';

import { useGameRematchStore } from '@/features/games/store/gameRematchStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { AutoExitFullscreenOnFinish } from './AutoExitFullscreenOnFinish';
import { roomStyles } from './styles';
import { GameRow, ChatPanel } from './layout-styles';

interface GamePageLayoutProps {
  roomId: string;
  room: GameRoomSummary;
  session?: GameSessionSummary | null;
  inviteCode?: string;
  userId: string | null;
  isAuthenticated?: boolean;

  // Connection overlays
  isDisconnected: boolean;
  isReconnecting: boolean;
  isIdle: boolean;
  onReconnect: () => void;

  // Rules
  onShowRules: () => void;

  // Interactive tutorial (only when the game has one)
  onShowTutorial?: () => void;

  isSpectating?: boolean;

  // The game widget — receives isFullscreen/toggleFullscreen via render prop
  children: (layoutProps: {
    isFullscreen: boolean;
    toggleFullscreen: () => void;
  }) => React.ReactNode;
}

export function GamePageLayout(props: GamePageLayoutProps) {
  const {
    roomId,
    room,
    session,
    inviteCode,
    userId,
    isAuthenticated = false,
    isDisconnected,
    isReconnecting,
    isIdle,
    onReconnect,
    onShowRules,
    onShowTutorial,
    isSpectating,
    children,
  } = props;

  const teamMode = !!(room.gameOptions as { teamMode?: boolean } | undefined)
    ?.teamMode;

  const { t } = useTranslation();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen(
    gameContainerRef,
    {
      enableKeyboard: true,
    },
  );

  // Chat visibility — visible by default on wide screens, hidden on narrow.
  // The initial value is read once from matchMedia; the user can toggle it.
  const [showChat, setShowChat] = useState(() =>
    typeof window === 'undefined'
      ? true
      : window.matchMedia('(min-width: 1151px)').matches,
  );
  const handleToggleChat = useCallback(() => setShowChat((v) => !v), []);

  const { activeEmotes, sendEmote } = useEmotes();

  const resolveDisplayName = useCallback(
    (id?: string, fallback?: string): string | undefined => {
      if (id && userId && id === userId) return t('chat.you');
      const member = room.members?.find((m) => m.id === id);
      return member?.displayName ?? fallback ?? id ?? undefined;
    },
    [room.members, userId, t],
  );

  const resolveEquipped = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      const member = room.members?.find((m) => m.id === id);
      if (member) {
        return {
          equippedAvatarId: member.equippedAvatarId ?? null,
          equippedBadgeId: member.equippedBadgeId ?? null,
          equippedNameColorId: member.equippedNameColorId ?? null,
          equippedFrameId: member.equippedFrameId ?? null,
          equippedAuraId: member.equippedAuraId ?? null,
          equippedBannerId: member.equippedBannerId ?? null,
        };
      }
      if (id === userId) {
        const snap = useSessionStore.getState().snapshot;
        return {
          equippedAvatarId: snap.equippedAvatarId ?? null,
          equippedBadgeId: snap.equippedBadgeId ?? null,
          equippedNameColorId: snap.equippedNameColorId ?? null,
          equippedFrameId: snap.equippedFrameId ?? null,
          equippedAuraId: snap.equippedAuraId ?? null,
          equippedBannerId: snap.equippedBannerId ?? null,
        };
      }
      return null;
    },
    [room.members, userId],
  );

  const gameRegisteredResolver = useGameChatStore((s) => s.resolveDisplayName);
  const resolveDisplayNameForList = useCallback(
    (id?: string, fallback?: string): string | undefined => {
      const fromGame = gameRegisteredResolver?.(id, fallback);
      if (fromGame && fromGame !== 'Unknown') return fromGame;
      return resolveDisplayName(id, fallback);
    },
    [gameRegisteredResolver, resolveDisplayName],
  );

  // Sync layout-owned state into the chat store so GameChatPopupOverlay
  // (mounted inside GameWidgetContainer) can render with full context.
  useEffect(() => {
    useGameChatStore.getState().setCurrentUserId(userId);
  }, [userId]);

  useEffect(() => {
    useGameChatStore.getState().registerResolveEquipped(resolveEquipped);
  }, [resolveEquipped]);

  useEffect(() => {
    useGameChatStore.getState().setChatPanelOpen(showChat);
  }, [showChat]);

  useEffect(() => {
    useGameChatStore
      .getState()
      .registerFallbackResolveDisplayName(resolveDisplayName);
  }, [resolveDisplayName]);

  const { isGameOver, onRematch, rematchLoading } = useGameRematchStore();

  const isLobby = room.status === 'lobby';
  const isHost = room.hostId === userId;
  const isPlayer = !!(
    userId &&
    (isHost || room.members?.some((m) => m.id === userId))
  );

  const { sendMessage: roomChatSend, deleteMessage: roomChatDelete } =
    useGameRoomChat(roomId, userId, isLobby);

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      const log = useGameChatStore
        .getState()
        .logs.find((l) => l.id === messageId);
      if (!log) return;
      if (isLobby && log.type !== 'action') {
        roomChatDelete?.(messageId);
      } else {
        gameSocket.emit('games.session.delete_chat', {
          roomId,
          userId,
          messageId,
        });
      }
    },
    [isLobby, roomChatDelete, roomId, userId],
  );

  // Subscribe to the store's sendMessage so we can detect when a game widget
  // overwrites it with a session-based function.  When that happens we
  // re-register the lobby-level function so chat keeps working in lobby mode.
  const storeSendMessage = useGameChatStore((s) => s.sendMessage);

  useEffect(() => {
    if (isLobby && roomChatSend) {
      useGameChatStore.getState().registerSendMessage(roomChatSend);
    }
  }, [isLobby, roomChatSend, storeSendMessage]);

  // Seed chat store with existing room chat logs when in lobby
  useEffect(() => {
    if (isLobby && Array.isArray(room.chatLogs) && room.chatLogs.length > 0) {
      const logs = room.chatLogs.map((l) => ({
        ...l,
        type: 'message' as const,
        scope: (l.scope || 'all') as import('@/shared/types/games').ChatScope,
      }));
      useGameChatStore.getState().setLogs(logs);
    }
  }, [isLobby, room.chatLogs]);

  return (
    <>
      <style>{roomStyles}</style>
      <div
        ref={gameContainerRef}
        className="games-room-container flex flex-col flex-1 min-h-0 gap-4 max-[800px]:gap-2"
      >
        {/* Drops out of fullscreen shortly after the game finishes so the
            player returns to the normal page chrome (header, rematch, nav). */}
        <AutoExitFullscreenOnFinish
          roomId={roomId}
          isFullscreen={isFullscreen}
          exitFullscreen={exitFullscreen}
          initialSession={session}
        />

        <ConnectionOverlay
          visible={isDisconnected}
          reconnecting={isReconnecting}
          onReconnect={onReconnect}
          title={t('games.connectionOverlay.title')}
          message={t('games.connectionOverlay.message')}
          reconnectingText={t('games.connectionOverlay.reconnecting')}
          testId="connection-overlay-disconnected"
        />

        {!isDisconnected && (
          <ConnectionOverlay
            visible={isIdle}
            title={t('games.idle.title')}
            message={t('games.idle.message')}
            testId="connection-overlay-idle"
          />
        )}

        <GamesControlPanel
          roomId={roomId}
          inviteCode={inviteCode}
          fullscreenContainerRef={gameContainerRef}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          showChat={showChat}
          onToggleChat={handleToggleChat}
          onShowRules={onShowRules}
          onShowTutorial={onShowTutorial}
          isSpectating={isSpectating}
          isGameOver={isGameOver}
          onRematch={onRematch ?? undefined}
          rematchLoading={rematchLoading}
        />

        <GameRow>
          <ActiveEmotesProvider
            value={{
              emotes: activeEmotes,
              resolveDisplayName,
              resolveEquipped,
            }}
          >
            {children({ isFullscreen, toggleFullscreen })}
          </ActiveEmotesProvider>

          <ChatPanel visible={showChat} data-testid="game-chat-area">
            <GameChat
              onClose={() => setShowChat(false)}
              teamMode={teamMode}
              resolveDisplayName={resolveDisplayNameForList}
              resolveEquipped={resolveEquipped}
              currentUserId={userId}
              isPlayer={isPlayer}
              isAuthenticated={isAuthenticated}
              onEmote={sendEmote}
              isHost={isHost}
              onDeleteMessage={handleDeleteMessage}
            />
          </ChatPanel>
        </GameRow>
      </div>
    </>
  );
}
