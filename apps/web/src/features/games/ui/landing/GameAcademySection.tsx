'use client';

import { useState } from 'react';
import { Container } from '@arcadeum/ui';
import { InteractiveGuideBoard } from '@/features/blog/ui/InteractiveGuideBoard';

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

const DEFAULT_CHALLENGES: Record<string, AcademyChallenge[]> = {
  ticTacToeLanding: [
    {
      id: 'academy-ttt-1',
      title: 'Academy Challenge 1: The Winning Fork',
      prompt:
        'Play as X: find the square that creates two simultaneous winning lines.',
      gameId: 'tic-tac-toe',
      board: ['X', '', '', '', 'O', '', '', '', 'X'],
      solutionIndex: 2,
      explanation:
        'Top-right corner creates an unstoppable double threat across row 1 and column 3.',
      playHref: '/games/tic-tac-toe',
    },
    {
      id: 'academy-ttt-2',
      title: 'Academy Challenge 2: Defend the Center Trap',
      prompt:
        'O opened center, you played corner, O played opposite corner. Block their diagonal threat.',
      gameId: 'tic-tac-toe',
      board: ['X', '', '', '', 'O', '', '', '', 'O'],
      solutionIndex: 1,
      explanation:
        'Taking the top-edge or side halts O from building a side-fork attack.',
      playHref: '/games/tic-tac-toe',
    },
  ],
};

interface Props {
  gameKey: string;
  title?: string;
  kicker?: string;
}

export function GameAcademySection({
  gameKey,
  title = 'Arcadeum Academy — Interactive Puzzles',
  kicker = 'Learn by Doing',
}: Props) {
  const challenges = DEFAULT_CHALLENGES[gameKey];
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);

  if (!challenges || challenges.length === 0) return null;

  const currentChallenge = challenges[activeChallengeIdx] ?? challenges[0];

  return (
    <section
      data-testid="game-academy-section"
      className="py-12 border-t border-[var(--glassBorder)] bg-gradient-to-b from-transparent to-black/20"
    >
      <Container size="lg">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-semibold uppercase tracking-wider mb-2">
            {kicker}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">
            {title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted,rgba(255,255,255,0.7))] max-w-xl mx-auto">
            Solve quick tactical puzzles directly in your browser. No account
            needed.
          </p>

          {challenges.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {challenges.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveChallengeIdx(i)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeChallengeIdx === i
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Puzzle {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-xl mx-auto">
          <InteractiveGuideBoard
            key={currentChallenge.id}
            id={currentChallenge.id}
            title={currentChallenge.title}
            prompt={currentChallenge.prompt}
            gameId={currentChallenge.gameId}
            board={currentChallenge.board}
            solutionIndex={currentChallenge.solutionIndex}
            explanation={currentChallenge.explanation}
            playHref={currentChallenge.playHref}
          />
        </div>
      </Container>
    </section>
  );
}
