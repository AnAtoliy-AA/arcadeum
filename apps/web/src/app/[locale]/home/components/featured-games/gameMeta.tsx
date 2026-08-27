import type { SVGProps } from 'react';
import { CriticalSymbol } from './symbols/CriticalSymbol';
import { SeaBattleSymbol } from './symbols/SeaBattleSymbol';
import { GlimwormSymbol } from './symbols/GlimwormSymbol';
import { TicTacToeSymbol } from './symbols/TicTacToeSymbol';
import { CascadeSymbol } from './symbols/CascadeSymbol';
import { ChessSymbol } from './symbols/ChessSymbol';
import { CheckersSymbol } from './symbols/CheckersSymbol';
import { CatDashSymbol } from './symbols/CatDashSymbol';
import { BackgammonSymbol } from './symbols/BackgammonSymbol';
import { HeartsSymbol } from './symbols/HeartsSymbol';
import { SpadesSymbol } from './symbols/SpadesSymbol';
import { GoSymbol } from './symbols/GoSymbol';
import { PachisiSymbol } from './symbols/PachisiSymbol';
import { SolitaireSymbol } from './symbols/SolitaireSymbol';
import { MinesweeperSymbol } from './symbols/MinesweeperSymbol';
import { SudokuSymbol } from './symbols/SudokuSymbol';
import { Game2048Symbol } from './symbols/Game2048Symbol';

export const FALLBACK_ACCENT = '#38bdf8';

interface GameSymbolProps extends SVGProps<SVGSVGElement> {
  gameId: string;
  className?: string;
}

export function GameSymbol({ gameId, className }: GameSymbolProps) {
  switch (gameId) {
    case 'critical_v1':
      return <CriticalSymbol className={className} />;
    case 'sea_battle_v1':
      return <SeaBattleSymbol className={className} />;
    case 'glimworm_v1':
      return <GlimwormSymbol className={className} />;
    case 'tic_tac_toe_v1':
      return <TicTacToeSymbol className={className} />;
    case 'cascade_v1':
      return <CascadeSymbol className={className} />;
    case 'chess_v1':
      return <ChessSymbol className={className} />;
    case 'checkers_v1':
      return <CheckersSymbol className={className} />;
    case 'cat_dash_v1':
      return <CatDashSymbol className={className} />;
    case 'backgammon_v1':
      return <BackgammonSymbol className={className} />;
    case 'hearts_v1':
      return <HeartsSymbol className={className} />;
    case 'spades_v1':
      return <SpadesSymbol className={className} />;
    case 'go_v1':
      return <GoSymbol className={className} />;
    case 'pachisi_v1':
      return <PachisiSymbol className={className} />;
    case 'solitaire_v1':
      return <SolitaireSymbol className={className} />;
    case 'minesweeper_v1':
      return <MinesweeperSymbol className={className} />;
    case 'sudoku_v1':
      return <SudokuSymbol className={className} />;
    case 'game_2048_v1':
      return <Game2048Symbol className={className} />;
    default:
      return null;
  }
}
