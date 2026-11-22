'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import type { GameRoomSummary } from '@/shared/types/games';
import { useGlimwormLobbyState } from './useGlimwormLobbyState';
import {
  GLIMWORM_THEME,
  GlimwormLobbyOptionsPanel,
} from './GlimwormLobbyOptions';

const MIN_PLAYERS = 2;

interface GlimwormLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  currentUserId: string;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
}

export function GlimwormLobby({
  room,
  isHost,
  currentUserId,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onReorderPlayers,
}: GlimwormLobbyProps): React.JSX.Element {
  const { t } = useTranslation();
  const state = useGlimwormLobbyState(room.id, currentUserId);
  const variantInfo = GLIMWORM_VARIANTS.find((v) => v.id === state.variant);

  return (
    <ReusableGameLobby
      room={room}
      userId={currentUserId}
      isHost={isHost}
      startBusy={state.busy}
      onStartGame={state.handleStartGame}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onLeaveRoom={onLeaveRoom}
      config={{
        gameName: t('games.glimworm_v1.name' as TranslationKey),
        gameIcon: '🐛',
        roomIcon: variantInfo?.emoji ?? '✨',
        variantName: variantInfo?.name
          ? t(variantInfo.name as TranslationKey)
          : undefined,
        seats: { min: MIN_PLAYERS },
        bots: { enabled: true, showDifficulty: false },
        theme: GLIMWORM_THEME,
        labels: {
          waitingLabel: t('games.glimworm_v1.lobby.waitingForPlayers'),
          startWithBotsLabel: t('games.glimworm_v1.lobby.fillWithBots'),
        },
      }}
      optionsSlot={
        <GlimwormLobbyOptionsPanel
          room={room}
          isHost={isHost}
          userId={currentUserId}
          state={state}
        />
      }
      onReorderPlayers={onReorderPlayers}
    />
  );
}
