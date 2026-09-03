'use client';

import { useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { RulesModal } from './RulesModal';
import { CHECKERS_THEMES } from '../lib/constants';
import type { CheckersOptions, CheckersTheme, Mode } from '../types';
import { MODE_CONFIGS } from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import type { TranslationKey } from '@/shared/lib/useTranslation';

const CHECKERS_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

interface CheckersLobbyProps {
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

function resolveOptions(raw: unknown): CheckersOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    mode: string;
    forcedCaptures: boolean;
    backwardCaptures: boolean;
  }>;
  return {
    theme: (r.theme ?? r.variant ?? 'adventure') as CheckersTheme,
    variant: (r.theme ?? r.variant ?? 'adventure') as CheckersTheme,
    mode: (r.mode ?? 'american') as Mode,
    forcedCaptures: r.forcedCaptures !== false,
    backwardCaptures: r.backwardCaptures === true,
  };
}

const MODE_OPTIONS: Array<{
  id: Mode;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
}> = [
  {
    id: 'american',
    nameKey:
      'games.checkers_v1.lobby.ruleVariants.american.name' as TranslationKey,
    descriptionKey:
      'games.checkers_v1.lobby.ruleVariants.american.description' as TranslationKey,
  },
  {
    id: 'international',
    nameKey:
      'games.checkers_v1.lobby.ruleVariants.international.name' as TranslationKey,
    descriptionKey:
      'games.checkers_v1.lobby.ruleVariants.international.description' as TranslationKey,
  },
  {
    id: 'russian',
    nameKey:
      'games.checkers_v1.lobby.ruleVariants.russian.name' as TranslationKey,
    descriptionKey:
      'games.checkers_v1.lobby.ruleVariants.russian.description' as TranslationKey,
  },
];

export function CheckersLobby({
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
}: CheckersLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const mode = options.mode;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        CHECKERS_THEMES,
        variant,
        CHECKERS_LOBBY_THEME.fallbackLightGradient,
        CHECKERS_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const variantName = useMemo(() => {
    const found = CHECKERS_THEMES.find((v) => v.id === variant);
    return found ? t(found.name) : undefined;
  }, [variant, t]);

  const modeOptions = MODE_OPTIONS.map((rv) => ({
    id: rv.id,
    label: t(rv.nameKey),
    emoji:
      rv.id === 'american' ? '🇺🇸' : rv.id === 'international' ? '🌍' : '🇷🇺',
  }));

  const ruleConfig = MODE_CONFIGS[mode];

  const optionsSlot = (
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.checkers_v1.lobby.ruleVariant')}>
        <LobbyChipGroup
          options={modeOptions}
          value={mode}
          onChange={(v) => setOption({ mode: v })}
          disabled={!isHost}
          accentColor="#2563eb"
          testIdPrefix="checkers-rule-variant"
        />
        <span className="text-[14px] opacity-[0.6] -mt-1">
          {t(MODE_OPTIONS.find((rv) => rv.id === mode)!.descriptionKey)}
        </span>
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.checkers_v1.lobby.rules')}>
        <div className="flex flex-col items-stretch gap-2">
          <label
            className={cx(
              'flex items-center gap-2',
              isHost
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              type="checkbox"
              checked={options.forcedCaptures}
              disabled={!isHost}
              onChange={(e) => setOption({ forcedCaptures: e.target.checked })}
              className="h-4 w-4 accent-[#2563eb]"
            />
            <span className="text-[16px]">
              {t('games.checkers_v1.lobby.forcedCaptures')}
            </span>
          </label>
          <label
            className={cx(
              'flex items-center gap-2',
              isHost
                ? 'cursor-pointer opacity-100'
                : 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              type="checkbox"
              checked={
                options.backwardCaptures || ruleConfig.backwardCapturesForMen
              }
              disabled={!isHost || ruleConfig.backwardCapturesForMen}
              onChange={(e) =>
                setOption({ backwardCaptures: e.target.checked })
              }
              className="h-4 w-4 accent-[#2563eb]"
            />
            <span className="text-[16px]">
              {t('games.checkers_v1.lobby.backwardCaptures')}
              {ruleConfig.backwardCapturesForMen
                ? ` (${t('games.checkers_v1.lobby.alwaysEnabled')})`
                : ''}
            </span>
          </label>
        </div>
      </LobbyOptionSection>
      <span className="text-[14px] opacity-[0.7]">
        {t('games.checkers_v1.rules.steps')}
      </span>
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
        gameName={t('games.checkers_v1.name')}
        gameIcon="♟️"
        variantName={variantName}
        minPlayers={2}
        maxPlayers={2}
        theme={lobbyTheme}
        enableBots
        labels={{
          startWithBotsLabel: t('games.checkers_v1.lobby.startWithBots'),
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
