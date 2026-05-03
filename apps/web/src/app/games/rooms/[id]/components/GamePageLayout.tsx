'use client';

import '@/features/games/ui/scrollbar.css';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useFullscreen } from '@/features/games/hooks/useFullscreen';
import { ConnectionOverlay } from '@arcadeum/ui/components/ConnectionOverlay/ConnectionOverlay';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import {
  GameChat,
  useGameChatStore,
  ChatMessagePopup,
  useLatestChatMessage,
} from '@/widgets/GameChat';
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
    room: _room,
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

  const { t } = useTranslation();
  const media = useMedia();
  const roomFlexDirection = media.gtMd ? 'row' : 'column';
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(gameContainerRef);

  // Chat visibility — wide screens default visible, narrow hidden
  const [showChat, setShowChat] = useState(false);
  const handleToggleChat = useCallback(() => setShowChat((v) => !v), []);

  useEffect(() => {
    queueMicrotask(() => {
      setShowChat(media.gtMd);
    });
  }, [media.gtMd]);

  // Chat message popup — reads from global store written by game widgets
  const logs = useGameChatStore((s) => s.logs);
  const { latestMessage, dismiss: dismissPopup } = useLatestChatMessage(logs);

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
            <GameChat onClose={() => setShowChat(false)} />
          </ChatPanel>
        </GameRow>

        {latestMessage && (
          <ChatMessagePopup
            key={latestMessage.id}
            senderName={latestMessage.senderName}
            message={latestMessage.message}
            visible={!!latestMessage}
            onDismiss={dismissPopup}
            isOwn={latestMessage.senderId === userId}
          />
        )}
      </Container>
    </>
  );
}
