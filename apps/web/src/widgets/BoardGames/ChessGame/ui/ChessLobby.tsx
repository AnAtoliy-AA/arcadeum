'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  type GameLobbyTheme,
  ReusableGameLobby,
} from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import type { GameRoomSummary } from '@/shared/types/games';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import type { BotDifficulty } from '@/features/games/ui/DifficultySelector';
import type { ChessTheme, TimeControl } from '../types';
import { TIME_CONTROLS } from '../types';
import { RulesModal } from './RulesModal';

const LOBBY_THEME: GameLobbyTheme = {
  titleGradient: 'linear-gradient(90deg, var(--color) 0%, var(--primary) 100%)',
  variantGradient:
    'linear-gradient(90deg, var(--color) 0%, var(--primary) 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

function formatTimeControl(tc: TimeControl | null): string {
  if (!tc) return 'No clock';
  const mins = Math.floor(tc.initialSeconds / 60);
  return tc.incrementSeconds > 0
    ? `${mins}+${tc.incrementSeconds}`
    : `${mins}|0`;
}

interface ChessLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    botDifficulty?: BotDifficulty;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

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
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(() => {
    const raw = (room.gameOptions ?? {}) as Partial<{
      theme: string;
      variant: string;
      timeControl: TimeControl | null;
    }>;
    return {
      theme: (raw.theme as string) || 'adventure',
      variant: (raw.variant ?? 'standard') as ChessTheme,
      timeControl: (raw.timeControl ?? null) as TimeControl | null,
    };
  }, [room.gameOptions]);

  const variantLabel = options.variant === 'chess960' ? 'Chess960' : 'Standard';

  const variantOptions = [
    {
      id: 'standard',
      label: t('games.chess_v1.lobby.standard'),
      description: t('games.chess_v1.lobby.standardDesc'),
    },
    {
      id: 'chess960',
      label: t('games.chess_v1.lobby.chess960'),
      description: t('games.chess_v1.lobby.chess960Desc'),
    },
  ];

  const timeControlOptions = [
    ...TIME_CONTROLS.map((tc) => ({
      id: `tc-${tc.initialSeconds}-${tc.incrementSeconds}`,
      label: formatTimeControl(tc),
      description:
        tc.type === 'blitz'
          ? t('games.chess_v1.lobby.blitz')
          : tc.type === 'rapid'
            ? t('games.chess_v1.lobby.rapid')
            : t('games.chess_v1.lobby.classical'),
    })),
    {
      id: 'no-clock',
      label: t('games.chess_v1.lobby.noClock'),
      description: t('games.chess_v1.lobby.unlimitedTime'),
    },
  ];

  const getSelectedTimeControl = () => {
    if (options.timeControl === null) return 'no-clock';
    return `tc-${options.timeControl.initialSeconds}-${options.timeControl.incrementSeconds}`;
  };

  const handleTimeControlChange = (value: string) => {
    if (value === 'no-clock') {
      setOption({ timeControl: null });
    } else {
      const [, initial, increment] = value.split('-');
      const tc = TIME_CONTROLS.find(
        (t) =>
          t.initialSeconds === Number(initial) &&
          t.incrementSeconds === Number(increment),
      );
      if (tc) setOption({ timeControl: tc });
    }
  };

  const optionsSlot = (
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={options.theme}
          onSelect={(themeId) => setOption({ theme: themeId })}
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.chess_v1.lobby.variant')}>
        <LobbyChipGroup
          options={variantOptions}
          value={options.variant}
          onChange={(v) => setOption({ variant: v })}
          disabled={!isHost}
          accentColor="#6366f1"
          testIdPrefix="chess-variant"
        />
      </LobbyOptionSection>

      <LobbyOptionSection title={t('games.chess_v1.lobby.timeControl')}>
        <LobbyChipGroup
          options={timeControlOptions}
          value={getSelectedTimeControl()}
          onChange={handleTimeControlChange}
          disabled={!isHost}
          accentColor="#6366f1"
          testIdPrefix="chess-time"
        />
      </LobbyOptionSection>
    </div>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={(opts) =>
          onStartGame({ ...opts, botDifficulty: opts?.difficulty ?? 'medium' })
        }
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.chess_v1.name')}
        gameIcon="♟"
        variantName={variantLabel}
        minPlayers={2}
        maxPlayers={2}
        theme={LOBBY_THEME}
        enableBots
        labels={{
          startWithBotsLabel: t('games.chess_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );
}
