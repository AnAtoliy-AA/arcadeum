'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { GO_BOARD_SIZES, resolveGoOptions } from '../lib/constants';

export const GO_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

const AI_DIFFICULTY_OPTIONS = [
  {
    id: 'easy',
    label: 'Easy',
    emoji: '🌱',
    description: 'Random moves with capture priority',
  },
  {
    id: 'medium',
    label: 'Medium',
    emoji: '🌿',
    description: 'Greedy heuristic strategy',
  },
  {
    id: 'hard',
    label: 'Hard',
    emoji: '🌳',
    description: 'MCTS search (220 simulations)',
  },
  {
    id: 'expert',
    label: 'Expert',
    emoji: '🏔️',
    description: 'Advanced MCTS (550 simulations)',
  },
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
  return (
    <div className="flex flex-col items-stretch gap-4">
      <div
        data-testid="go-board-size-section"
        className="flex flex-col items-stretch gap-2 p-3.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--surface)]/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📐</span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--textPrimary)]">
            {t('games.go_v1.lobby.boardSize')}
          </span>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          {GO_BOARD_SIZES.map(({ size, label }) => (
            <button
              key={size}
              type="button"
              data-testid={`go-board-size-${size}`}
              disabled={!isHost}
              aria-pressed={options.boardSize === size}
              onClick={() => setOption({ boardSize: size })}
              className={cx(
                'rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                options.boardSize === size
                  ? 'border-blue-500 bg-blue-600 text-white shadow-md ring-1 ring-blue-400/50'
                  : 'border-[var(--borderColor)] bg-[var(--surface)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--textPrimary)]',
                !isHost && 'cursor-not-allowed opacity-50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--textSecondary)] opacity-80">
          {t('games.go_v1.lobby.boardSizeHint')}
        </span>
      </div>
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.go_v1.lobby.aiDifficulty')}>
        <div className="grid grid-cols-2 gap-2">
          {AI_DIFFICULTY_OPTIONS.map((diff) => (
            <button
              key={diff.id}
              type="button"
              data-testid={`go-ai-difficulty-${diff.id}`}
              disabled={!isHost}
              aria-pressed={currentDifficulty === diff.id}
              onClick={() => setOption({ aiDifficulty: diff.id })}
              className={cx(
                'flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                currentDifficulty === diff.id
                  ? 'border-[#3fd38666] bg-[#2563eb] text-white'
                  : 'border-[var(--borderColor)] bg-[var(--backgroundHover)]',
                !isHost && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="text-lg">{diff.emoji}</span>
              <span className="font-semibold">{diff.label}</span>
              <span className="text-[10px] opacity-70 leading-tight">
                {diff.description}
              </span>
            </button>
          ))}
        </div>
      </LobbyOptionSection>
    </div>
  );
}
