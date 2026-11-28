'use client';

import { type GameLobbyTheme } from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
  LobbySwitchRow,
} from '@/features/games/ui/LobbyOptionKit';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import type { GlimwormVariant } from '../types';
import type { GlimwormLobbyState } from './useGlimwormLobbyState';

export const PALETTE = [
  '#ff5e5e',
  '#ffb05e',
  '#ffe65e',
  '#7cff5e',
  '#5effb6',
  '#5ee0ff',
  '#5e8cff',
  '#b15eff',
  '#ff5ed4',
  '#a0ffea',
];

export const GLIMWORM_THEME: GameLobbyTheme = {
  titleGradient:
    'linear-gradient(90deg, #7cff5e 0%, #5ee0ff 50%, #b15eff 100%)',
  variantGradient: 'linear-gradient(135deg, #5ee0ff 0%, #b15eff 100%)',
  buttonGradient: 'linear-gradient(135deg, #5ee0ff 0%, #7c5cff 100%)',
};

export function GlimwormLobbyOptionsPanel({
  room,
  isHost,
  userId,
  state,
}: {
  room: GameRoomSummary;
  isHost: boolean;
  userId: string;
  state: GlimwormLobbyState;
}) {
  const {
    variant,
    setVariant,
    powerupsEnabled,
    setPowerupsEnabled,
    error,
    visibleVariants,
    takenColors,
    effectiveSelectedColor,
    handleColor,
  } = state;
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  const equippedTheme = useEquippedGameTheme() ?? 'adventure';
  const variantItems = visibleVariants.map((v) => ({
    id: v.id,
    label: t(v.name as TranslationKey),
    emoji: v.emoji,
    disabled: v.comingSoon,
    badge: v.comingSoon ? t('games.lobby.comingSoon') : undefined,
    testId: `glimworm-variant-${v.id}`,
  }));

  if (room.status !== 'lobby') return null;
  return (
    <LobbyOptionStack>
      <LobbyHostOnlyNote show={!isHost} />
      <LobbyOptionGroup title={t('games.glimworm_v1.lobby.variant')}>
        <LobbyChoice
          aria-label={t('games.glimworm_v1.lobby.variant')}
          items={variantItems}
          value={variant}
          onChange={(v) => setVariant(v as GlimwormVariant)}
          disabled={!isHost}
        />
      </LobbyOptionGroup>

      <LobbySwitchRow
        testId="glimworm-powerups-switch"
        label={t('games.glimworm_v1.lobby.powerups')}
        hint={t('games.glimworm_v1.lobby.powerupsHint')}
        checked={powerupsEnabled}
        disabled={!isHost}
        onCheckedChange={(on) => setPowerupsEnabled(on)}
      />

      <LobbyOptionGroup
        title={t('games.glimworm_v1.lobby.pickColor')}
        hint={t('games.glimworm_v1.lobby.pickColorHint')}
      >
        <div
          role="group"
          aria-label={t('games.glimworm_v1.lobby.pickColor')}
          className="flex flex-row flex-wrap gap-1"
        >
          {PALETTE.map((color) => {
            const isSelected = color === effectiveSelectedColor;
            const isTaken = takenColors.has(color) && !isSelected;
            return (
              <button
                type="button"
                key={color}
                disabled={isTaken}
                aria-label={color}
                aria-pressed={isSelected}
                title={
                  isTaken ? t('games.glimworm_v1.lobby.colorTaken') : color
                }
                onClick={() => !isTaken && handleColor(color)}
                className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed"
              >
                <span
                  aria-hidden
                  className={`block h-8 w-8 rounded-full border-2 transition-transform motion-reduce:transition-none ${
                    isSelected
                      ? 'scale-110 border-[var(--textPrimary)] ring-2 ring-[var(--primary)]'
                      : 'border-[var(--glassBorder)]'
                  } ${isTaken ? 'opacity-30' : 'opacity-100'}`}
                  style={{ backgroundColor: color }}
                />
              </button>
            );
          })}
        </div>
      </LobbyOptionGroup>

      <LobbyOptionGroup title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={(room.gameOptions?.theme as string) || equippedTheme}
          onSelect={(themeId) => setOption({ theme: themeId })}
          disabled={!isHost}
        />
      </LobbyOptionGroup>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--textPrimary)]"
        >
          {error}
        </p>
      )}
    </LobbyOptionStack>
  );
}
