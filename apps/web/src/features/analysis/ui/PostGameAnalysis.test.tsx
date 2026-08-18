import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostGameAnalysis } from './PostGameAnalysis';
import type { TranslationKey } from '@/shared/lib/useTranslation';

const t = (key: TranslationKey) => key;

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
const WHITE_BLUNDERED_QUEEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNB1KBNR';

describe('PostGameAnalysis', () => {
  it('shows the empty state when there are no moves', () => {
    render(<PostGameAnalysis positionHistory={[START]} t={t} />);
    expect(
      screen.getByText('games.chess_v1.analysis.empty'),
    ).toBeInTheDocument();
  });

  it('renders the analysis header and summary for a real game', () => {
    render(
      <PostGameAnalysis
        positionHistory={[START, AFTER_E4, WHITE_BLUNDERED_QUEEN]}
        notations={['e4', 'Qxd1']}
        t={t}
      />,
    );
    expect(
      screen.getByText('games.chess_v1.analysis.title'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/games\.chess_v1\.analysis\.summary\.finalEval/),
    ).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('Qxd1')).toBeInTheDocument();
  });
});
