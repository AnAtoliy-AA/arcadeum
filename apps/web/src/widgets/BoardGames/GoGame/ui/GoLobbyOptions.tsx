'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbyOptionStack,
  LobbySubAdvanced,
} from '@/features/games/ui/LobbyOptionKit';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { GO_BOARD_SIZES, resolveGoOptions } from '../lib/constants';

export const GO_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

const AI_DIFFICULTY_OPTIONS = [
  { id: 'easy', emoji: '🌱' },
  { id: 'medium', emoji: '🌿' },
  { id: 'hard', emoji: '🌳' },
  { id: 'expert', emoji: '🏔️' },
] as const;

export function GoLobbyOptionsPanel({
  options,
  roomId,
  userId,
  isHost,
}: {
  options: ReturnType<typeof resolveGoOptions>;
  roomId: string;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId, userId });
  const variant = options.variant;
  const currentDifficulty = options.aiDifficulty ?? 'medium';
  const sizeItems = GO_BOARD_SIZES.map(({ size, label }) => ({
    id: String(size),
    label,
    testId: `go-board-size-${size}`,
  }));
  const diffLabels = {
    easy: t('games.lobby.difficultyEasy'),
    medium: t('games.lobby.difficultyMedium'),
    hard: t('games.lobby.difficultyHard'),
    expert: t('games.lobby.difficultyExpert'),
  };
  const diffDescriptions = {
    easy: t('games.go_v1.lobby.aiEasyDesc'),
    medium: t('games.go_v1.lobby.aiMediumDesc'),
    hard: t('games.go_v1.lobby.aiHardDesc'),
    expert: t('games.go_v1.lobby.aiExpertDesc'),
  };
  const diffItems = AI_DIFFICULTY_OPTIONS.map((d) => ({
    id: d.id,
    emoji: d.emoji,
    label: diffLabels[d.id],
    description: diffDescriptions[d.id],
    testId: `go-ai-difficulty-${d.id}`,
  }));

  return (
    <LobbyOptionStack>
      <LobbyHostOnlyNote show={!isHost} />
      <LobbyOptionGroup
        data-testid="go-board-size-section"
        title={t('games.go_v1.lobby.boardSize')}
        hint={t('games.go_v1.lobby.boardSizeHint')}
      >
        <LobbyChoice
          aria-label={t('games.go_v1.lobby.boardSize')}
          items={sizeItems}
          value={String(options.boardSize)}
          disabled={!isHost}
          onChange={(id) => setOption({ boardSize: Number(id) })}
        />
      </LobbyOptionGroup>
      <LobbyOptionGroup title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionGroup>
      <LobbySubAdvanced
        testId="go-ai-difficulty-section"
        title={t('games.go_v1.lobby.aiDifficulty')}
      >
        <LobbyOptionGroup
          title={t('games.go_v1.lobby.aiDifficulty')}
          hint={t('games.go_v1.lobby.aiDifficultyHint')}
        >
          <LobbyChoice
            aria-label={t('games.go_v1.lobby.aiDifficulty')}
            items={diffItems}
            value={currentDifficulty}
            disabled={!isHost}
            onChange={(id) => setOption({ aiDifficulty: id })}
          />
        </LobbyOptionGroup>
      </LobbySubAdvanced>
    </LobbyOptionStack>
  );
}
