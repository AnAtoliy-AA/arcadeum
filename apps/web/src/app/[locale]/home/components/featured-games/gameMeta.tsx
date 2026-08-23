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

export const FALLBACK_ACCENT = '#38bdf8';

interface GameSymbolProps extends SVGProps<SVGSVGElement> {
  gameId: string;
}

export function GameSymbol({ gameId, ...rest }: GameSymbolProps) {
  switch (gameId) {
    case 'critical_v1':
      return <CriticalSymbol {...rest} />;
    case 'sea_battle_v1':
      return <SeaBattleSymbol {...rest} />;
    case 'glimworm_v1':
      return <GlimwormSymbol {...rest} />;
    case 'tic_tac_toe_v1':
      return <TicTacToeSymbol {...rest} />;
    case 'cascade_v1':
      return <CascadeSymbol {...rest} />;
    case 'chess_v1':
      return <ChessSymbol {...rest} />;
    case 'checkers_v1':
      return <CheckersSymbol {...rest} />;
    case 'cat_dash_v1':
      return <CatDashSymbol {...rest} />;
    case 'backgammon_v1':
      return <BackgammonSymbol {...rest} />;
    case 'hearts_v1':
      return <HeartsSymbol {...rest} />;
    case 'spades_v1':
      return <SpadesSymbol {...rest} />;
    case 'go_v1':
      return <GoSymbol {...rest} />;
    case 'pachisi_v1':
      return <PachisiSymbol {...rest} />;
    default:
      return null;
  }
}
