import type { SVGProps } from 'react';
import { CriticalSymbol } from './symbols/CriticalSymbol';
import { SeaBattleSymbol } from './symbols/SeaBattleSymbol';
import { GlimwormSymbol } from './symbols/GlimwormSymbol';

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
    default:
      return null;
  }
}
