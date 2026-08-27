import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GamesCatalogRealPreview } from './GamesCatalogRealPreview';

describe('GamesCatalogRealPreview', () => {
  const gameIds = [
    'critical_v1',
    'cascade_v1',
    'chess_v1',
    'checkers_v1',
    'sea_battle_v1',
    'tic_tac_toe_v1',
    'cat_dash_v1',
    'backgammon_v1',
    'hearts_v1',
    'spades_v1',
    'go_v1',
    'pachisi_v1',
    'glimworm_v1',
    'solitaire_v1',
    'minesweeper_v1',
    'sudoku_v1',
    'game_2048_v1',
  ];

  gameIds.forEach((gameId) => {
    it(`renders preview for ${gameId}`, () => {
      const { container } = render(<GamesCatalogRealPreview gameId={gameId} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 360 220');
    });
  });
});
