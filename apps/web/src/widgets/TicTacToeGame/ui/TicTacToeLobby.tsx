'use client';

import { useMemo, useState } from 'react';
import { YStack, XStack, Text, Switch } from 'tamagui';
import { useMutation } from '@/shared/hooks/useMutation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { VariantSelector } from './VariantSelector';
import { BoardSizeSelector } from './BoardSizeSelector';
import { TicTacToeTeamPanel } from './TicTacToeTeamPanel';
import { RulesModal } from './RulesModal';
import { TIC_TAC_TOE_VARIANTS } from '../lib/constants';
import {
  BOARD_SIZES,
  type BoardSize,
  type TicTacToeOptions,
  type TicTacToeVariant,
  WIN_LENGTHS,
} from '../types';

const getTicTacToeTheme = (variantId?: string): GameLobbyTheme => {
  const variant = TIC_TAC_TOE_VARIANTS.find((v) => v.id === variantId);
  const lightGradient =
    variant?.lightGradient ??
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)';
  return {
    titleGradient: lightGradient,
    variantGradient: lightGradient,
    buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  };
};

interface TicTacToeLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

function resolveOptions(raw: unknown): TicTacToeOptions {
  const r = (raw ?? {}) as Partial<{
    variant: string;
    boardSize: number;
    teamMode: boolean;
  }>;
  const isAllowedSize = (n: number | undefined): n is BoardSize =>
    n === 3 || n === 5 || n === 7 || n === 9;
  return {
    variant: (r.variant ?? 'classic') as TicTacToeVariant,
    boardSize: isAllowedSize(r.boardSize) ? r.boardSize : 3,
    teamMode: !!r.teamMode,
  };
}

export function TicTacToeLobby({
  room,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: TicTacToeLobbyProps) {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();

  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(() => getTicTacToeTheme(variant), [variant]);
  const variantName = useMemo(() => {
    const found = TIC_TAC_TOE_VARIANTS.find((v) => v.id === variant);
    return found ? t(found.name) : undefined;
  }, [variant, t]);

  const [internalTeamMode, setInternalTeamMode] = useState(options.teamMode);

  const teamModeMutation = useMutation({
    mutationFn: (val: boolean) =>
      gamesApi.updateRoomOptions(
        room.id,
        { teamMode: val },
        { token: snapshot.accessToken ?? undefined },
      ),
    onError: () => setInternalTeamMode(options.teamMode),
  });

  const handleTeamModeToggle = (val: boolean) => {
    if (!isHost) return;
    setInternalTeamMode(val);
    void teamModeMutation.mutate(val);
  };

  const optionsSlot = (
    <YStack gap="$4">
      <VariantSelector
        roomId={room.id}
        currentVariant={variant}
        disabled={!isHost}
      />
      <BoardSizeSelector
        roomId={room.id}
        currentSize={options.boardSize}
        disabled={!isHost}
      />
      <XStack alignItems="center" gap="$3">
        <Text fontWeight="600">{t('games.tic_tac_toe_v1.lobby.teamMode')}</Text>
        <Switch
          checked={internalTeamMode}
          onCheckedChange={handleTeamModeToggle}
          disabled={!isHost || teamModeMutation.isLoading}
          size="$2"
        >
          <Switch.Thumb />
        </Switch>
      </XStack>
      {internalTeamMode ? (
        <TicTacToeTeamPanel room={room} isHost={isHost} />
      ) : null}
      <Text fontSize="$2" opacity={0.7}>
        {t('games.tic_tac_toe_v1.rules.winLengths')}
      </Text>
    </YStack>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={onStartGame}
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.tic_tac_toe_v1.name')}
        gameIcon="❌⭕"
        variantName={variantName}
        minPlayers={2}
        theme={lobbyTheme}
        enableBots
        labels={{
          startWithBotsLabel: t('games.tic_tac_toe_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls={false}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        boardSize={options.boardSize}
        winLength={WIN_LENGTHS[options.boardSize]}
      />
    </>
  );
}

// Reference to satisfy unused-variable check if BOARD_SIZES is only used by other modules
void BOARD_SIZES;
