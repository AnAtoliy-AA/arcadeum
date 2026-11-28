import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalysisBoard } from './AnalysisBoard';

const explorerFens: string[] = [];

vi.mock('@/features/analysis/ui/OpeningExplorer', () => ({
  OpeningExplorer: ({ fen }: { fen: string }) => {
    explorerFens.push(fen);
    return <div data-testid="explorer">{fen}</div>;
  },
}));
vi.mock('@/features/analysis/lib/stockfish-api', () => ({
  analyzePositionWithStockfish: vi.fn(() => Promise.resolve(null)),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AnalysisBoard FEN', () => {
  beforeEach(() => {
    explorerFens.length = 0;
    if (typeof globalThis.ResizeObserver === 'undefined') {
      (globalThis as Record<string, unknown>).ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  it('writes knights as N/n, not as kings', () => {
    render(<AnalysisBoard />);
    expect(explorerFens.at(-1)).toBe(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    );
  });
});
