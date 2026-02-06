import React, { useCallback, useRef } from 'react';

import {
  CriticalRoom,
  type CriticalRoomHandle,
} from './gameIntegrations/Critical/CriticalRoom';
import {
  TexasHoldemRoom,
  type TexasHoldemRoomHandle,
} from './gameIntegrations/TexasHoldem/TexasHoldemRoom';
import { useGameRoom } from './hooks/useGameRoom';
import { UnsupportedGameView } from './components/GameRoom/UnsupportedGameView';

export default function GameRoomScreen() {
  const integrationRef = useRef<
    CriticalRoomHandle | TexasHoldemRoomHandle | null
  >(null);
  const {
    room,
    setRoom,
    session,
    setSession,
    loading,
    refreshing,
    error,
    isHost,
    deleting,
    leaving,
    fetchRoom,
    handleLeaveRoom,
    handleDeleteRoom,
    handleViewGame,
    fallbackName,
    displayGameId,
    integrationId,
    tokens,
    refreshTokens,
    insets,
  } = useGameRoom(integrationRef);

  const handleRefresh = useCallback(() => fetchRoom('refresh'), [fetchRoom]);

  if (
    integrationId === 'critical_v1' ||
    integrationId === 'exploding_kittens_v1'
  ) {
    return (
      <CriticalRoom
        ref={integrationRef as React.Ref<CriticalRoomHandle>}
        room={room}
        session={session}
        fallbackName={fallbackName}
        gameId={displayGameId}
        tokens={tokens}
        refreshTokens={refreshTokens}
        insetsTop={insets.top}
        fetchRoom={fetchRoom}
        refreshing={refreshing}
        loading={loading}
        error={error}
        isHost={isHost}
        deleting={deleting}
        leaving={leaving}
        onDeleteRoom={handleDeleteRoom}
        onLeaveRoom={handleLeaveRoom}
        onViewGame={handleViewGame}
        setRoom={setRoom}
        setSession={setSession}
      />
    );
  }

  if (integrationId === 'texas_holdem_v1') {
    return (
      <TexasHoldemRoom
        ref={integrationRef as React.Ref<TexasHoldemRoomHandle>}
        room={room}
        session={session}
        fallbackName={fallbackName}
        gameId={displayGameId}
        tokens={tokens}
        refreshTokens={refreshTokens}
        insetsTop={insets.top}
        fetchRoom={fetchRoom}
        refreshing={refreshing}
        loading={loading}
        error={error}
        isHost={isHost}
        deleting={deleting}
        leaving={leaving}
        onDeleteRoom={handleDeleteRoom}
        onLeaveRoom={handleLeaveRoom}
        onViewGame={handleViewGame}
        setRoom={setRoom}
        setSession={setSession}
      />
    );
  }

  return (
    <UnsupportedGameView
      gameId={displayGameId}
      fallbackName={fallbackName}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={handleRefresh}
      onLeaveRoom={handleLeaveRoom}
      onDeleteRoom={isHost ? handleDeleteRoom : undefined}
      isHost={isHost}
      deleting={deleting}
      leaving={leaving}
    />
  );
}
