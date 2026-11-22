'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import type { BotDifficulty } from '@/features/games/ui/DifficultySelector';
import type { GameLobbyHostProps } from '@/features/games/ui/ReusableGameLobby.types';
import { RulesModal } from './RulesModal';
import {
  CHESS_LOBBY_THEME,
  ChessLobbyOptionsPanel,
  useChessLobbyOptions,
  useChessPersonalities,
} from './ChessLobbyOptions';

type ChessLobbyProps = GameLobbyHostProps<{
  withBots?: boolean;
  botCount?: number;
  botDifficulty?: BotDifficulty;
  botPersonality?: string;
}>;

export function ChessLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onReorderPlayers,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: ChessLobbyProps) {
  const { t } = useTranslation();
  const [personality, setPersonality] = useState<string | null>(null);
  const personalityOptions = useChessPersonalities();
  const { options, variantLabel } = useChessLobbyOptions(room.gameOptions);

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        config={{
          gameName: t('games.chess_v1.name'),
          gameIcon: '♟',
          variantName: variantLabel,
          seats: { min: 2, max: 2 },
          bots: { enabled: true, showDifficulty: false },
          theme: CHESS_LOBBY_THEME,
          labels: {
            startWithBotsLabel: t('games.chess_v1.lobby.startWithBots'),
          },
        }}
        optionsSlot={
          <ChessLobbyOptionsPanel
            options={options}
            roomId={room.id}
            userId={userId}
            isHost={isHost}
            startBusy={startBusy}
            personalityOptions={personalityOptions}
            selectedPersonality={personality}
            onSelectPersonality={setPersonality}
          />
        }
        onStartGame={(opts) =>
          onStartGame({
            ...opts,
            botDifficulty: opts?.difficulty ?? 'medium',
            botPersonality: personality ?? undefined,
          })
        }
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal
        open={!!showRulesOpen}
        onClose={onShowRulesClose ?? (() => {})}
      />
    </>
  );
}
