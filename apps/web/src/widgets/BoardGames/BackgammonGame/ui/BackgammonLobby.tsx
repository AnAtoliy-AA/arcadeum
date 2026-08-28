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
import { BACKGAMMON_VARIANTS } from '../lib/constants';
import type {
  BackgammonOptions,
  BackgammonRuleVariant,
  BackgammonVariant,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

const BACKGAMMON_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
};

const RULE_VARIANT_OPTIONS: Array<{
  id: BackgammonRuleVariant;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  emoji: string;
}> = [
  {
    id: 'standard',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.standard.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.standard.description' as TranslationKey,
    emoji: '🎲',
  },
  {
    id: 'long',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.long.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.long.description' as TranslationKey,
    emoji: '🏃',
  },
  {
    id: 'hyper',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.hyper.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.hyper.description' as TranslationKey,
    emoji: '⚡',
  },
  {
    id: 'tavla',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.tavla.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.tavla.description' as TranslationKey,
    emoji: '🇹🇷',
  },
  {
    id: 'nackgammon',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.nackgammon.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.nackgammon.description' as TranslationKey,
    emoji: '🧠',
  },
  {
    id: 'gulbara',
    nameKey:
      'games.backgammon_v1.lobby.ruleVariants.gulbara.name' as TranslationKey,
    descriptionKey:
      'games.backgammon_v1.lobby.ruleVariants.gulbara.description' as TranslationKey,
    emoji: '🏛️',
  },
];

interface BackgammonLobbyProps {
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

function resolveOptions(raw: unknown): BackgammonOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    ruleVariant: string;
    aiDifficulty: string;
  }>;
  return {
    variant: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonVariant,
    ruleVariant: (r.ruleVariant ?? 'standard') as BackgammonRuleVariant,
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

export function BackgammonLobby({
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
}: BackgammonLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const variant = options.variant;
  const ruleVariant = options.ruleVariant ?? 'standard';

  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        BACKGAMMON_VARIANTS,
        variant,
        BACKGAMMON_LOBBY_THEME.fallbackLightGradient,
        BACKGAMMON_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );

  const variantName = useMemo(() => {
    const found = BACKGAMMON_VARIANTS.find((v) => v.id === variant);
    return found ? t(found.nameKey as TranslationKey) : undefined;
  }, [variant, t]);

  const ruleVariantOptions = useMemo(
    () =>
      RULE_VARIANT_OPTIONS.map((rv) => ({
        id: rv.id,
        label: t(rv.nameKey),
        emoji: rv.emoji,
      })),
    [t],
  );

  const activeRuleVariantMeta =
    RULE_VARIANT_OPTIONS.find((rv) => rv.id === ruleVariant) ??
    RULE_VARIANT_OPTIONS[0];

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
      <LobbyOptionSection title={t('games.backgammon_v1.lobby.ruleVariant')}>
        <LobbyChipGroup
          options={ruleVariantOptions}
          value={ruleVariant}
          onChange={(v) => setOption({ ruleVariant: v })}
          disabled={!isHost}
          accentColor="#a855f7"
          testIdPrefix="backgammon-rule-variant"
        />
        <span className="text-[14px] opacity-60">
          {t(activeRuleVariantMeta.descriptionKey)}
        </span>
      </LobbyOptionSection>
    </div>
  );

  return (
    <>
      <ReusableGameLobby
        enableBots
        gameIcon="🎲"
        gameName={t('games.backgammon_v1.name')}
        isHost={isHost}
        labels={{
          startWithBotsLabel: t('games.backgammon_v1.lobby.startWithBots'),
        }}
        maxPlayers={2}
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
