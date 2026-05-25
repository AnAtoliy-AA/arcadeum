'use client';

import '@/features/games/ui/scrollbar.css';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useFullscreen } from '@/features/games/hooks/useFullscreen';
import { ConnectionOverlay } from '@arcadeum/ui/components/ConnectionOverlay/ConnectionOverlay';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import { GameChat, useGameChatStore } from '@/widgets/GameChat';
import type { GameRoomSummary } from '@/shared/types/games';

import { Container, fullscreenStyles } from './styles';
import { GameRow, ChatPanel } from './layoutStyles';

interface GamePageLayoutProps {
  roomId: string;
  room: GameRoomSummary;
  inviteCode?: string;
  userId: string | null;

  // Connection overlays
  isDisconnected: boolean;
  isReconnecting: boolean;
  isIdle: boolean;
  onReconnect: () => void;

  // Rules
  onShowRules: () => void;

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
    inviteCode,
    userId,
    isDisconnected,
    isReconnecting,
    isIdle,
    onReconnect,
    onShowRules,
    isSpectating,
    children,
  } = props;

  const teamMode = !!(room.gameOptions as { teamMode?: boolean } | undefined)
    ?.teamMode;

  const { t } = useTranslation();
  const media = useMedia();
  const roomFlexDirection = media.gtMd ? 'row' : 'column';
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(gameContainerRef, {
    enableKeyboard: true,
  });

  // Chat visibility — wide screens default visible, narrow hidden
  const [showChat, setShowChat] = useState(false);
  const handleToggleChat = useCallback(() => setShowChat((v) => !v), []);

  useEffect(() => {
    queueMicrotask(() => {
      setShowChat(media.gtMd);
    });
  }, [media.gtMd]);

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
      if (!member) return null;
      return {
        equippedAvatarId: member.equippedAvatarId ?? null,
        equippedBadgeId: member.equippedBadgeId ?? null,
        equippedNameColorId: member.equippedNameColorId ?? null,
        equippedFrameId: member.equippedFrameId ?? null,
        equippedAuraId: member.equippedAuraId ?? null,
        equippedBannerId: member.equippedBannerId ?? null,
      };
    },
    [room.members],
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

  return (
    <>
      <style>{fullscreenStyles}</style>
      <Container
        ref={gameContainerRef as React.RefObject<never>}
        className="games-room-container"
      >
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
          isSpectating={isSpectating}
        />

        <GameRow flexDirection={roomFlexDirection}>
          {children({ isFullscreen, toggleFullscreen })}

          <ChatPanel visible={showChat} data-testid="game-chat-area">
            <GameChat
              onClose={() => setShowChat(false)}
              teamMode={teamMode}
              resolveDisplayName={resolveDisplayNameForList}
              resolveEquipped={resolveEquipped}
              currentUserId={userId}
            />
          </ChatPanel>
        </GameRow>
      </Container>
    </>
  );
}
