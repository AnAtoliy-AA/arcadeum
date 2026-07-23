'use client';

import { useMemo, useState } from 'react';
import { YStack, XStack, Text, Switch } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
  LobbyOptionSection,
} from '@/features/games/ui';
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
  type InfinityMargin,
  type InfinityWinLength,
  WIN_LENGTHS,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import type { BotDifficulty } from '@/features/games/ui/DifficultySelector';

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
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    difficulty?: BotDifficulty;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
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
    boardSize: number | string;
    teamMode: boolean;
    expansionMargin: number;
    infinityWinLength: number;
  }>;
  const isAllowedSize = (n: number | string | undefined): n is BoardSize =>
    n === 3 || n === 5 || n === 7 || n === 9 || n === 'infinity';
  const isMargin = (n: number | undefined): n is 1 | 2 | 3 =>
    n === 1 || n === 2 || n === 3;
  const isWinLen = (n: number | undefined): n is 4 | 5 => n === 4 || n === 5;
  return {
    variant: (r.variant ?? 'classic') as TicTacToeVariant,
    boardSize: isAllowedSize(r.boardSize) ? r.boardSize : 3,
    teamMode: !!r.teamMode,
    expansionMargin: isMargin(r.expansionMargin) ? r.expansionMargin : 3,
    infinityWinLength: isWinLen(r.infinityWinLength) ? r.infinityWinLength : 5,
  };
}

export function TicTacToeLobby({
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
}: TicTacToeLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

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

  const handleTeamModeToggle = (val: boolean) => {
    if (!isHost) return;
    setInternalTeamMode(val);
    setOption({ teamMode: val });
  };

  const handleMarginChange = (margin: InfinityMargin) => {
    setOption({ expansionMargin: margin });
  };

  const handleWinLengthChange = (winLength: InfinityWinLength) => {
    setOption({ infinityWinLength: winLength });
  };

  const optionsSlot = (
    <YStack gap="$4">
      <VariantSelector
        roomId={room.id}
        hostId={userId}
        currentVariant={variant}
        disabled={!isHost}
      />
      <BoardSizeSelector
        roomId={room.id}
        hostId={userId}
        currentSize={options.boardSize}
        currentMargin={options.expansionMargin}
        currentWinLength={options.infinityWinLength}
        disabled={!isHost}
        onMarginChange={handleMarginChange}
        onWinLengthChange={handleWinLengthChange}
      />
      <LobbyOptionSection title={t('games.tic_tac_toe_v1.lobby.teamMode')}>
        <XStack alignItems="center" gap="$3">
          <Switch
            checked={internalTeamMode}
            onCheckedChange={handleTeamModeToggle}
            disabled={!isHost}
            size="$2"
          >
            <Switch.Thumb />
          </Switch>
        </XStack>
      </LobbyOptionSection>
      {internalTeamMode ? (
        <TicTacToeTeamPanel room={room} isHost={isHost} />
      ) : null}
      <Text fontSize="$3" opacity={0.7}>
        {options.boardSize === 'infinity'
          ? t('games.tic_tac_toe_v1.lobby.winCondition')
          : t('games.tic_tac_toe_v1.rules.winLengths')}
      </Text>
    </YStack>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={(opts) =>
          onStartGame({ ...opts, difficulty: opts?.difficulty ?? 'medium' })
        }
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
        showReorderControls
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        boardSize={options.boardSize}
        winLength={
          options.boardSize === 'infinity'
            ? options.infinityWinLength
            : WIN_LENGTHS[options.boardSize]
        }
        expansionMargin={options.expansionMargin}
      />
    </>
  );
}

// Reference to satisfy unused-variable check if BOARD_SIZES is only used by other modules
void BOARD_SIZES;
