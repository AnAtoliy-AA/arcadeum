'use client';

import React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { type GameLobbyTheme } from '@/features/games/ui/ReusableGameLobby';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { Typography } from '@arcadeum/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import { CARD_VARIANTS, RANDOM_VARIANT } from '../lib/constants';
import { TranslationKey } from '@/shared/i18n/useTranslation';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const getCriticalTheme = (variant?: string): GameLobbyTheme => {
  const variantConfig = CARD_VARIANTS.find((v) => v.id === variant);
  const gradient =
    variantConfig?.gradient ||
    'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)';

  return {
    titleGradient: gradient,
    variantGradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
    buttonGradient:
      'linear-gradient(135deg, #c7aa2f 0%, #c7aa2f 50%, #8B7500 100%)',
  };
};

export const getVariantInfo = (variant?: string) => {
  if (variant === 'random') {
    return { name: RANDOM_VARIANT.name, emoji: RANDOM_VARIANT.emoji };
  }
  const variantConfig = CARD_VARIANTS.find((v) => v.id === variant);
  return {
    name: variantConfig?.name || 'Classic',
    emoji: variantConfig?.emoji || '🎲',
  };
};

export interface CriticalLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  isFullscreen: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  onToggleFullscreen: () => void;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  onRefresh?: () => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

/** Card variant from room options, falling back to the equipped theme. */
export function resolveCardVariant(
  gameOptions: GameRoomSummary['gameOptions'],
  equippedTheme: string,
): string {
  return (
    (gameOptions?.theme as string) ||
    (gameOptions?.cardVariant as string) ||
    (gameOptions?.variant as string) ||
    equippedTheme
  );
}

export function getCriticalSubtitle(
  room: GameRoomSummary,
  isHost: boolean,
  t: CriticalLobbyProps['t'],
): string {
  if (room.status !== 'lobby') return t('games.table.lobby.gameLoading');
  if (room.playerCount === 1) return t('games.lobby.playWithBotsNotice');
  if (room.playerCount < 2) return t('games.table.lobby.needTwoPlayers');
  if (isHost) return t('games.table.lobby.hostCanStart');
  return t('games.table.lobby.waitingForHost');
}

export function CriticalLobbyOptionsPanel({
  room,
  userId,
  isHost,
  cardVariant,
  ruleComingSoon,
  t,
}: {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  cardVariant: string;
  ruleComingSoon: Map<string, boolean>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  if (room.status !== 'lobby') return null;
  return (
    <LobbyOptionSection title={t('games.create.sectionVariant')}>
      <GameThemePicker
        selectedTheme={cardVariant}
        onSelect={(themeId) =>
          setOption({
            theme: themeId,
            cardVariant: themeId,
            variant: themeId,
          })
        }
        disabled={!isHost}
      />
      {isHost ? (
        <div className="flex flex-row items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={
              !!(room.gameOptions as Record<string, unknown>)
                ?.allowActionCardCombos
            }
            disabled={!!ruleComingSoon.get('combos')}
            onChange={(e) =>
              setOption({ allowActionCardCombos: e.target.checked })
            }
            aria-label={
              t('games.create.houseRuleActionCardCombos') ||
              'Action Card Combos'
            }
            className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
          />
          <Typography
            uiSize="sm"
            className={cx(
              ruleComingSoon.get('combos') ? 'opacity-40' : 'opacity-100',
            )}
          >
            {t('games.create.houseRuleActionCardCombos') ||
              'Action Card Combos'}
          </Typography>
          {ruleComingSoon.get('combos') && (
            <Typography uiSize="xs" weight="600" className="text-[#f59e0b]">
              {t('games.create.comingSoon') || 'Coming Soon'}
            </Typography>
          )}
        </div>
      ) : null}
    </LobbyOptionSection>
  );
}
