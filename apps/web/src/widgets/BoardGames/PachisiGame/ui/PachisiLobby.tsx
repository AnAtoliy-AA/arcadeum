'use client';

import { useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { RulesModal } from './RulesModal';
import { PACHISI_THEMES } from '../lib/constants';
import type { PachisiOptions, PachisiMode, PachisiTheme } from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

const PACHISI_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

const MODE_OPTIONS: Array<{
  id: PachisiMode;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  emoji: string;
}> = [
  {
    id: 'standard',
    nameKey:
      'games.pachisi_v1.lobby.ruleVariants.standard.name' as TranslationKey,
    descriptionKey:
      'games.pachisi_v1.lobby.ruleVariants.standard.description' as TranslationKey,
    emoji: '🎲',
  },
  {
    id: 'quick',
    nameKey: 'games.pachisi_v1.lobby.ruleVariants.quick.name' as TranslationKey,
    descriptionKey:
      'games.pachisi_v1.lobby.ruleVariants.quick.description' as TranslationKey,
    emoji: '⚡',
  },
];

interface PachisiLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    botDifficulty?: string;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

function resolveOptions(raw: unknown): PachisiOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    aiDifficulty: string;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? 'adventure') as PachisiTheme,
    variant: (r.theme ?? r.variant ?? 'adventure') as PachisiTheme,
    mode: (r.mode ?? 'standard') as PachisiMode,
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

export function PachisiLobby({
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
}: PachisiLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const variant = options.variant;
  const mode = options.mode ?? 'standard';

  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        PACHISI_THEMES,
        variant,
        PACHISI_LOBBY_THEME.fallbackLightGradient,
        PACHISI_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );

  const variantName = useMemo(() => {
    const found = PACHISI_THEMES.find((v) => v.id === variant);
    return found ? t(found.nameKey as TranslationKey) : undefined;
  }, [variant, t]);

  const modeOptions = useMemo(
    () =>
      MODE_OPTIONS.map((rv) => ({
        id: rv.id,
        label: t(rv.nameKey),
        emoji: rv.emoji,
      })),
    [t],
  );

  const activeModeMeta =
    MODE_OPTIONS.find((rv) => rv.id === mode) ?? MODE_OPTIONS[0];

  const optionsSlot = (
    <div className="flex flex-col gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.pachisi_v1.lobby.ruleVariant')}>
        <LobbyChipGroup
          options={modeOptions}
          value={mode}
          onChange={(v) => setOption({ mode: v })}
          disabled={!isHost}
          accentColor="#f59e0b"
          testIdPrefix="pachisi-rule-variant"
        />
        <span className="text-[14px] opacity-60">
          {t(activeModeMeta.descriptionKey)}
        </span>
      </LobbyOptionSection>
    </div>
  );

  return (
    <>
      <ReusableGameLobby
        enableBots
        gameIcon="🎲"
        gameName={t('games.pachisi_v1.name')}
        isHost={isHost}
        labels={{
          startWithBotsLabel: t('games.pachisi_v1.lobby.startWithBots'),
        }}
        maxPlayers={4}
        minPlayers={2}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onLeaveRoom={onLeaveRoom}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
        onStartGame={(opts) =>
          onStartGame({ ...opts, botDifficulty: opts?.difficulty ?? 'medium' })
        }
        optionsSlot={optionsSlot}
        room={room}
        showInvitedPlayers
        showReorderControls
        startBusy={startBusy}
        theme={lobbyTheme}
        userId={userId}
        variantName={variantName}
      />
      <RulesModal onClose={onShowRulesClose} open={showRulesOpen} />
    </>
  );
}
