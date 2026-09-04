import { describe, it, expect } from 'vitest';
import { SHARED_THEMES } from '../shared-themes';
import { sharedThemeToSeaBattle } from '@/widgets/StrategyGames/SeaBattleGame/lib/theme-adapter';
import { sharedThemeToCascade } from '@/widgets/CardGames/CascadeGame/lib/theme-adapter';
import { sharedThemeToCheckers } from '@/widgets/BoardGames/CheckersGame/lib/theme-adapter';
import { sharedThemeToTicTacToe } from '@/widgets/BoardGames/TicTacToeGame/lib/theme-adapter';
import { sharedThemeToCatDash } from '@/widgets/ActionGames/CatDashGame/lib/theme-adapter';
import { sharedThemeToChess } from '@/widgets/BoardGames/ChessGame/lib/theme-adapter';
import { sharedThemeToGlimworm } from '@/widgets/ActionGames/GlimwormGame/lib/theme-adapter';
import { sharedThemeToBackgammon } from '@/widgets/BoardGames/BackgammonGame/lib/theme-adapter';
import { sharedThemeToGame2048 } from '@/widgets/PuzzleGames/Game2048/lib/theme-adapter';
import { sharedThemeToMinesweeper } from '@/widgets/PuzzleGames/MinesweeperGame/lib/theme-adapter';
import { sharedThemeToSolitaire } from '@/widgets/PuzzleGames/SolitaireGame/lib/theme-adapter';
import { sharedThemeToSudoku } from '@/widgets/PuzzleGames/SudokuGame/lib/theme-adapter';

describe('theme-adapters', () => {
  const cyberpunk = SHARED_THEMES.find((t) => t.id === 'cyberpunk')!;
  const underwater = SHARED_THEMES.find((t) => t.id === 'underwater')!;

  it('SeaBattle theme adapter converts visual properties', () => {
    const sbTheme = sharedThemeToSeaBattle(cyberpunk);
    expect(sbTheme.bgImage).toBe(cyberpunk.bgImage);
    expect(sbTheme.primaryColor).toBe(cyberpunk.colors.primary);
    expect(sbTheme.boardBackground).toBeTruthy();
  });

  it('Cascade theme adapter converts visual properties', () => {
    const cascadeTheme = sharedThemeToCascade(underwater);
    expect(cascadeTheme.bgImage).toBe(underwater.bgImage);
    expect(cascadeTheme.background).toBeTruthy();
    expect(cascadeTheme.accent).toBe(underwater.colors.primary);
  });

  it('Checkers theme adapter converts visual properties', () => {
    const checkersTheme = sharedThemeToCheckers(cyberpunk);
    expect(checkersTheme.bgImage).toBe(cyberpunk.bgImage);
    expect(checkersTheme.darkPiece).toBe(cyberpunk.colors.playerPalette[0]);
    expect(checkersTheme.lightPiece).toBe(cyberpunk.colors.playerPalette[1]);
  });

  it('TicTacToe theme adapter converts visual properties', () => {
    const tttTheme = sharedThemeToTicTacToe(cyberpunk);
    expect(tttTheme.bgImage).toBe(cyberpunk.bgImage);
    expect(tttTheme.xColor).toBe(cyberpunk.colors.playerPalette[0]);
    expect(tttTheme.oColor).toBe(cyberpunk.colors.playerPalette[1]);
  });

  it('CatDash theme adapter converts visual properties', () => {
    const catDashTheme = sharedThemeToCatDash(underwater);
    expect(catDashTheme.bgImage).toBe(underwater.bgImage);
    expect(catDashTheme.player).toBe(underwater.colors.playerPalette[0]);
    expect(catDashTheme.forkSpace).toBe(underwater.colors.highlight);
  });

  it('Chess theme adapter converts visual properties', () => {
    const chessTheme = sharedThemeToChess(cyberpunk);
    expect(chessTheme.bgImage).toBe(cyberpunk.bgImage);
    expect(chessTheme.darkPieceColor).toBe(cyberpunk.colors.playerPalette[0]);
    expect(chessTheme.lightPieceColor).toBe(cyberpunk.colors.playerPalette[1]);
  });

  it('Glimworm theme adapter converts visual properties', () => {
    const glimwormTheme = sharedThemeToGlimworm(underwater);
    expect(glimwormTheme.bgImage).toBe(underwater.bgImage);
    expect(glimwormTheme.snakeHeadColor).toBe(
      underwater.colors.playerPalette[0],
    );
    expect(glimwormTheme.snakeBodyColor).toBe(
      underwater.colors.playerPalette[1],
    );
  });

  it('Backgammon theme adapter converts visual properties', () => {
    const backgammonTheme = sharedThemeToBackgammon(cyberpunk);
    expect(backgammonTheme.bgImage).toBe(cyberpunk.bgImage);
    expect(backgammonTheme.whitePiece).toBe(cyberpunk.colors.playerPalette[1]);
    expect(backgammonTheme.blackPiece).toBe(cyberpunk.colors.playerPalette[0]);
    expect(backgammonTheme.frameBackground).toBe(cyberpunk.colors.surface);
    expect(backgammonTheme.boardBackground).toBe(cyberpunk.colors.background);
  });

  it('Game2048 theme adapter converts visual properties', () => {
    const g2048Theme = sharedThemeToGame2048(cyberpunk);
    expect(g2048Theme.bgImage).toBe(cyberpunk.bgImage);
    expect(g2048Theme.boardBorder).toBe(cyberpunk.colors.border);
    expect(g2048Theme.glow).toBe(cyberpunk.colors.glow);
  });

  it('Minesweeper theme adapter converts visual properties', () => {
    const msTheme = sharedThemeToMinesweeper(underwater);
    expect(msTheme.bgImage).toBe(underwater.bgImage);
    expect(msTheme.flagColor).toBe(underwater.colors.highlight);
    expect(msTheme.boardBorder).toBe(underwater.colors.border);
  });

  it('Solitaire theme adapter converts visual properties', () => {
    const solTheme = sharedThemeToSolitaire(cyberpunk);
    expect(solTheme.bgImage).toBe(cyberpunk.bgImage);
    expect(solTheme.selectedRing).toBe(cyberpunk.colors.glow);
    expect(solTheme.tableBorder).toBe(cyberpunk.colors.border);
  });

  it('Sudoku theme adapter converts visual properties', () => {
    const sdkTheme = sharedThemeToSudoku(underwater);
    expect(sdkTheme.bgImage).toBe(underwater.bgImage);
    expect(sdkTheme.boardBorder).toBe(underwater.colors.border);
    expect(sdkTheme.conflictColor).toBe('#ef4444');
  });
});
