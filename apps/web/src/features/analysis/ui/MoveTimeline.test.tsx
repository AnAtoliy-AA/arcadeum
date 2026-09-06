import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoveTimeline } from './MoveTimeline';
import { analyzeGame } from '../lib/analyzeGame';
import type { MoveQuality } from '../lib/analyzeGame';

const qualityLabels: Record<MoveQuality, string> = {
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
  brilliant: 'Brilliant',
  great: 'Great',
};

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
const WHITE_BLUNDERED_QUEEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNB1KBNR';
const BOTH_QUEENS_OFF = 'rnb1kbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNB1KBNR';

describe('MoveTimeline', () => {
  it('renders nothing when there are no moves', () => {
    const { container } = render(
      <MoveTimeline moves={[]} qualityLabels={qualityLabels} unitLabel="cp" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders move notations with quality labels', () => {
    const analysis = analyzeGame(
      [START, AFTER_E4, WHITE_BLUNDERED_QUEEN],
      ['e4', 'Qxd1'],
    );
    render(
      <MoveTimeline
        moves={analysis.moves}
        qualityLabels={qualityLabels}
        unitLabel="cp"
      />,
    );
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('Qxd1')).toBeInTheDocument();
    expect(screen.getAllByText('Good').length).toBeGreaterThan(0);
  });

  it('labels a blunder move as a blunder', () => {
    const analysis = analyzeGame([START, WHITE_BLUNDERED_QUEEN], ['Qh5']);
    render(
      <MoveTimeline
        moves={analysis.moves}
        qualityLabels={qualityLabels}
        unitLabel="cp"
      />,
    );
    expect(analysis.moves[0].quality).toBe('blunder');
    expect(screen.getByText('Blunder')).toBeInTheDocument();
    expect(screen.getByText('Qh5')).toBeInTheDocument();
  });

  it('groups moves into numbered pairs', () => {
    const analysis = analyzeGame(
      [START, AFTER_E4, WHITE_BLUNDERED_QUEEN, BOTH_QUEENS_OFF],
      ['e4', 'Qxd1', 'Qxd8'],
    );
    render(
      <MoveTimeline
        moves={analysis.moves}
        qualityLabels={qualityLabels}
        unitLabel="cp"
      />,
    );
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
  });
});
