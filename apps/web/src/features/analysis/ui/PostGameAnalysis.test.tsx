import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PostGameAnalysis } from './PostGameAnalysis';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import * as stockfishApi from '../lib/stockfish-api';

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

  it('renders Stockfish player accuracy and grades when engine response is returned', async () => {
    vi.spyOn(stockfishApi, 'analyzeGameWithStockfish').mockResolvedValueOnce({
      evals: [0.2, 0.4, -9.5],
      whiteAccuracy: 92.5,
      blackAccuracy: 88.0,
      summary: {
        brilliant: 1,
        great: 0,
        good: 1,
        inaccuracy: 0,
        mistake: 0,
        blunder: 1,
      },
      moves: [
        {
          quality: 'good',
          move: 'e4',
          evalAfter: 0.4,
          mateAfter: null,
          loss: 5,
          bestMove: 'e4',
          bestPv: ['e4', 'e5'],
        },
        {
          quality: 'blunder',
          move: 'Qxd1',
          evalAfter: -9.5,
          mateAfter: null,
          loss: 990,
          bestMove: 'Nf3',
          bestPv: ['Nf3'],
        },
      ],
    });

    render(
      <PostGameAnalysis
        positionHistory={[START, AFTER_E4, WHITE_BLUNDERED_QUEEN]}
        notations={['e4', 'Qxd1']}
        t={t}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('White Accuracy')).toBeInTheDocument();
      expect(screen.getByText('92.5')).toBeInTheDocument();
      expect(screen.getByText('Black Accuracy')).toBeInTheDocument();
      expect(screen.getByText('88.0')).toBeInTheDocument();
      expect(screen.getByText('Stockfish 19 Evaluated')).toBeInTheDocument();
    });
  });
});
