'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';
import { Empty } from '../styles';

export function GamesEmpty() {
  const { t } = useTranslation();

  return (
    <Empty data-testid="games-empty">
      <div className="flex flex-col items-center justify-center gap-4">
        <span
          className="text-center text-[20px] font-semibold"
          style={{ color: 'var(--color)' }}
        >
          {t('games.lounge.emptyTitle')}
        </span>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <QuickplayButton
            gameId="chess_v1"
            mode="human"
            label="Find Chess Opponent"
            buttonVariant="primary"
          />
          <QuickplayButton
            gameId="chess_v1"
            mode="ai"
            label="Play Chess vs AI"
            buttonVariant="secondary"
          />
          <QuickplayButton
            gameId="checkers_v1"
            mode="human"
            label="Find Checkers Opponent"
            buttonVariant="primary"
          />
          <QuickplayButton
            gameId="checkers_v1"
            mode="ai"
            label="Play Checkers vs AI"
            buttonVariant="secondary"
          />
          <QuickplayButton
            gameId="sea_battle_v1"
            mode="human"
            label="Find Sea Battle Opponent"
            buttonVariant="primary"
          />
          <QuickplayButton
            gameId="sea_battle_v1"
            mode="ai"
            label="Play Sea Battle vs AI"
            buttonVariant="secondary"
          />
        </div>
      </div>
    </Empty>
  );
}
