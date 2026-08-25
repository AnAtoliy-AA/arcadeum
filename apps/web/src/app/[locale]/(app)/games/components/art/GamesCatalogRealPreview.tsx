import React from 'react';
import { CriticalRealCards } from './CriticalRealCards';
import { CascadeRealCards } from './CascadeRealCards';
import { ChessRealBoard } from './ChessRealBoard';
import { CheckersRealBoard } from './CheckersRealBoard';
import { SeaBattleRealBoard } from './SeaBattleRealBoard';
import { TicTacToeRealBoard } from './TicTacToeRealBoard';
import { CatDashRealTrack } from './CatDashRealTrack';
import { BackgammonRealBoard } from './BackgammonRealBoard';
import { GlimwormRealArena } from './GlimwormRealArena';
import { HeartsRealCards } from './HeartsRealCards';
import { SpadesRealCards } from './SpadesRealCards';
import { GoRealBoard } from './GoRealBoard';
import { PachisiRealBoard } from './PachisiRealBoard';
import { SolitaireRealCards } from './SolitaireRealCards';
import { MinesweeperRealBoard } from './MinesweeperRealBoard';
import { SudokuRealBoard } from './SudokuRealBoard';
import { Game2048RealBoard } from './Game2048RealBoard';

interface Props {
  gameId: string;
}

export function GamesCatalogRealPreview({ gameId }: Props) {
  switch (gameId) {
    case 'critical_v1':
      return <CriticalRealCards />;
    case 'cascade_v1':
      return <CascadeRealCards />;
    case 'chess_v1':
      return <ChessRealBoard />;
    case 'checkers_v1':
      return <CheckersRealBoard />;
    case 'sea_battle_v1':
      return <SeaBattleRealBoard />;
    case 'tic_tac_toe_v1':
      return <TicTacToeRealBoard />;
    case 'cat_dash_v1':
      return <CatDashRealTrack />;
    case 'backgammon_v1':
      return <BackgammonRealBoard />;
    case 'hearts_v1':
      return <HeartsRealCards />;
    case 'spades_v1':
      return <SpadesRealCards />;
    case 'go_v1':
      return <GoRealBoard />;
    case 'pachisi_v1':
      return <PachisiRealBoard />;
    case 'solitaire_v1':
      return <SolitaireRealCards />;
    case 'minesweeper_v1':
      return <MinesweeperRealBoard />;
    case 'sudoku_v1':
      return <SudokuRealBoard />;
    case 'game_2048_v1':
      return <Game2048RealBoard />;
    case 'glimworm_v1':
    default:
      return <GlimwormRealArena />;
  }
}
