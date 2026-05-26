import type { SVGProps } from 'react';
import { CriticalSymbol } from './symbols/CriticalSymbol';
import { SeaBattleSymbol } from './symbols/SeaBattleSymbol';
import { GlimwormSymbol } from './symbols/GlimwormSymbol';
import { TicTacToeSymbol } from './symbols/TicTacToeSymbol';
import { CascadeSymbol } from './symbols/CascadeSymbol';

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
    default:
      return null;
  }
}
