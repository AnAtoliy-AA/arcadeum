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
});
