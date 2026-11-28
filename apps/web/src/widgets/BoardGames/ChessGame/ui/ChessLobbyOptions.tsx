'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { type GameLobbyTheme } from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
} from '@/features/games/ui/LobbyOptionKit';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import type { GameRoomSummary } from '@/shared/types/games';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { useEquippedGameTheme } from '@/features/games/hooks/useEquippedGameTheme';
import type { ChessTheme, TimeControl } from '../types';
import { BotSelector, type BotPersonalityOption } from './BotSelector';
import { PgnImportModal } from './PgnImportModal';
import { QuickPlayPanel } from './QuickPlayPanel';
import { BOT_PERSONALITIES } from '@arcadeum/games-core/games/chess/chess-bot-personalities';
import { apiClient } from '@/shared/lib/api-client';

export const CHESS_LOBBY_THEME: GameLobbyTheme = {
  titleGradient: 'linear-gradient(90deg, var(--color) 0%, var(--primary) 100%)',
  variantGradient:
    'linear-gradient(90deg, var(--color) 0%, var(--primary) 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

/** Bot personalities the admin settings allow for this game. */
export function useChessPersonalities(): BotPersonalityOption[] {
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>(
    () => BOT_PERSONALITIES.map((p) => p.difficulty),
  );

  useEffect(() => {
    apiClient
      .get<{ settings: Record<string, Record<string, unknown>> }>(
        '/admin/game-settings',
      )
      .then((data) => {
        const chessSettings = data.settings?.chess_v1;
        if (chessSettings?.availableDifficulties) {
          setAvailableDifficulties(
            chessSettings.availableDifficulties as string[],
          );
        }
      })
      .catch(() => {
        // Use default (all difficulties)
      });
  }, []);

  const personalityOptions: BotPersonalityOption[] = useMemo(
    () =>
      BOT_PERSONALITIES.filter((p) =>
        availableDifficulties.includes(p.difficulty),
      ).map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        rating: p.rating,
        style: p.style,
      })),
    [availableDifficulties],
  );
  return personalityOptions;
}

/** Resolves display options and the variant label from the room options. */
export function useChessLobbyOptions(
  gameOptions: GameRoomSummary['gameOptions'],
) {
  const { t } = useTranslation();
  const equippedTheme = useEquippedGameTheme();
  const options = useMemo(() => {
    const raw = (gameOptions ?? {}) as Partial<{
      theme: string;
      variant: string;
      timeControl: TimeControl | null;
    }>;
    const validVariants = [
      'standard',
      'chess960',
      'king_of_the_hill',
      'three_check',
      'crazyhouse',
      'atomic',
    ];
    const variant = validVariants.includes(raw.variant ?? '')
      ? (raw.variant as ChessTheme)
      : 'standard';
    return {
      theme: (raw.theme as string) || equippedTheme || 'adventure',
      variant,
      timeControl: (raw.timeControl ?? {
        type: 'rapid',
        initialSeconds: 600,
        incrementSeconds: 0,
      }) as TimeControl | null,
    };
  }, [gameOptions, equippedTheme]);

  const variantLabel =
    options.variant === 'chess960'
      ? 'Chess960'
      : options.variant === 'king_of_the_hill'
        ? t('games.chess_v1.lobby.kingOfTheHill')
        : options.variant === 'three_check'
          ? t('games.chess_v1.lobby.threeCheck')
          : options.variant === 'crazyhouse'
            ? t('games.chess_v1.lobby.crazyhouse')
            : options.variant === 'atomic'
              ? t('games.chess_v1.lobby.atomic')
              : t('games.chess_v1.lobby.standard');

  return { options, variantLabel };
}

export function ChessLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
  startBusy,
  personalityOptions,
  selectedPersonality,
  onSelectPersonality,
}: {
  options: ReturnType<typeof useChessLobbyOptions>['options'];
  roomId: string;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  personalityOptions: BotPersonalityOption[];
  selectedPersonality: string | null;
  onSelectPersonality: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  const [showPgnImport, setShowPgnImport] = useState(false);
  const variantItems = [
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
    {
      id: 'king_of_the_hill',
      label: t('games.chess_v1.lobby.kingOfTheHill'),
      description: t('games.chess_v1.lobby.kingOfTheHillDesc'),
    },
    {
      id: 'three_check',
      label: t('games.chess_v1.lobby.threeCheck'),
      description: t('games.chess_v1.lobby.threeCheckDesc'),
    },
    {
      id: 'crazyhouse',
      label: t('games.chess_v1.lobby.crazyhouse'),
      description: t('games.chess_v1.lobby.crazyhouseDesc'),
    },
    {
      id: 'atomic',
      label: t('games.chess_v1.lobby.atomic'),
      description: t('games.chess_v1.lobby.atomicDesc'),
    },
  ];

  return (
    <>
      <LobbyOptionStack>
        <LobbyHostOnlyNote show={!isHost} />
        <LobbyOptionGroup title={t('games.chess_v1.lobby.variant')}>
          <LobbyChoice
            aria-label={t('games.chess_v1.lobby.variant')}
            items={variantItems}
            value={options.variant}
            onChange={(v) => setOption({ variant: v })}
            disabled={!isHost}
            testIdPrefix="chess-variant"
          />
        </LobbyOptionGroup>

        <QuickPlayPanel
          selectedTimeControl={options.timeControl}
          disabled={!isHost || startBusy}
          onSelectTimeControl={(tc) => {
            setOption({ timeControl: tc });
          }}
        />

        <LobbyOptionGroup title={t('games.create.sectionVariant')}>
          <GameThemePicker
            selectedTheme={options.theme}
            onSelect={(themeId) => setOption({ theme: themeId })}
            disabled={!isHost}
          />
        </LobbyOptionGroup>

        <LobbyOptionGroup title={t('games.chess_v1.lobby.botPersonality')}>
          <BotSelector
            personalities={personalityOptions}
            selectedId={selectedPersonality}
            onSelect={onSelectPersonality}
            disabled={!isHost}
          />
        </LobbyOptionGroup>

        <button
          type="button"
          onClick={() => setShowPgnImport(true)}
          className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-4 text-sm font-semibold text-[var(--textPrimary)] transition-colors hover:bg-[var(--glassBgHover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
        >
          {t('games.chess_v1.actions.importPgn')}
        </button>
      </LobbyOptionStack>

      <PgnImportModal
        isOpen={showPgnImport}
        onClose={() => setShowPgnImport(false)}
        onImport={(_moves, _variant) => {
          // PGN import creates a new room with the imported position
        }}
      />
    </>
  );
}
