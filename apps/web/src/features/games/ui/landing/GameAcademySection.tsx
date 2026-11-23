'use client';

import { useState } from 'react';
import { Container } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { InteractiveGuideBoard } from '@/features/blog/ui/InteractiveGuideBoard';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { GameSectionHeading } from './GameSectionHeading';

export interface AcademyChallenge {
  id: string;
  title: string;
  prompt: string;
  gameId: 'chess' | 'tic-tac-toe' | 'checkers';
  board: string[];
  solutionIndex: number;
  explanation: string;
  playHref?: string;
}

interface AcademyChallengeDef {
  id: string;
  gameId: AcademyChallenge['gameId'];
  board: string[];
  solutionIndex: number;
  playHref?: string;
  titleKey: TranslationKey;
  promptKey: TranslationKey;
  explanationKey: TranslationKey;
}

const CHALLENGES: Record<string, AcademyChallengeDef[]> = {
  ticTacToeLanding: [
    {
      id: 'academy-ttt-1',
      gameId: 'tic-tac-toe',
      board: ['X', '', '', '', 'O', '', '', '', 'X'],
      solutionIndex: 2,
      playHref: '/games/tic-tac-toe',
      titleKey: 'games.landing.academyTttTitle1',
      promptKey: 'games.landing.academyTttPrompt1',
      explanationKey: 'games.landing.academyTttExplanation1',
    },
    {
      id: 'academy-ttt-2',
      gameId: 'tic-tac-toe',
      board: ['X', '', '', '', 'O', '', '', '', 'O'],
      solutionIndex: 1,
      playHref: '/games/tic-tac-toe',
      titleKey: 'games.landing.academyTttTitle2',
      promptKey: 'games.landing.academyTttPrompt2',
      explanationKey: 'games.landing.academyTttExplanation2',
    },
  ],
};

interface Props {
  gameKey: string;
  title?: string;
  kicker?: string;
}

export function GameAcademySection({ gameKey, title, kicker }: Props) {
  const { t } = useTranslation();
  const challenges = CHALLENGES[gameKey];
  const [activeIdx, setActiveIdx] = useState(0);

  if (!challenges || challenges.length === 0) return null;

  const current = challenges[activeIdx] ?? challenges[0];

  return (
    <section
      data-testid="game-academy-section"
      className="border-t border-[var(--glassBorder)] py-12 sm:py-16"
    >
      <Container size="lg">
        <div className="flex flex-col gap-8">
          <GameSectionHeading
            kicker={kicker ?? t('games.landing.academyKicker')}
            title={title ?? t('games.landing.academyTitle')}
            subtitle={t('games.landing.academySubtitle')}
          />

          <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-4 sm:p-6">
            {challenges.length > 1 && (
              <div
                role="tablist"
                aria-label={t('games.landing.academyTabsLabel')}
                className="flex gap-1 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-1"
              >
                {challenges.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={activeIdx === i}
                    data-testid={`academy-puzzle-tab-${i + 1}`}
                    onClick={() => setActiveIdx(i)}
                    className={cx(
                      'min-h-[44px] flex-1 rounded-lg px-3 text-sm font-semibold transition-colors motion-reduce:transition-none',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
                      activeIdx === i
                        ? 'bg-[var(--primary)] text-[var(--primaryText)] shadow-sm'
                        : 'text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--textPrimary)]',
                    )}
                  >
                    {t('games.landing.academyPuzzle', { n: i + 1 })}
                  </button>
                ))}
              </div>
            )}

            <InteractiveGuideBoard
              key={current.id}
              id={current.id}
              title={t(current.titleKey)}
              prompt={t(current.promptKey)}
              gameId={current.gameId}
              board={current.board}
              solutionIndex={current.solutionIndex}
              explanation={t(current.explanationKey)}
              playHref={current.playHref}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
