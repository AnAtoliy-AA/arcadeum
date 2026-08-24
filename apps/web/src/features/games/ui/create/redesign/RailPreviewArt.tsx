'use client';

import { GameLandingThemeProvider } from '@/features/games/ui/landing/GameLandingThemeContext';
import { CriticalLandingPreview } from '@/app/[locale]/(app)/games/critical/CriticalLandingPreview';
import { SeaBattleLandingBoard } from '@/app/[locale]/(app)/games/sea-battle/SeaBattleLandingBoard';
import { ChessLandingPreview } from '@/app/[locale]/(app)/games/chess/ChessLandingPreview';
import { CheckersLandingPreview } from '@/app/[locale]/(app)/games/checkers/CheckersLandingPreview';
import { TicTacToeLandingPreview } from '@/app/[locale]/(app)/games/tic-tac-toe/TicTacToeLandingPreview';
import { CascadeLandingPreview } from '@/app/[locale]/(app)/games/cascade/CascadeLandingPreview';
import { GlimwormLandingPreview } from '@/app/[locale]/(app)/games/glimworm/GlimwormLandingPreview';
import { CatDashLandingPreview } from '@/app/[locale]/(app)/games/cat-dash/CatDashLandingPreview';
import { BackgammonLandingPreview } from '@/app/[locale]/(app)/games/backgammon/BackgammonLandingPreview';
import type { GameId } from './data/themes';

interface Props {
  gameId: GameId;
  themeId: string;
  onThemeChange?: (theme: string) => void;
}

function GamePreviewComponent({ gameId }: { gameId: GameId }) {
  switch (gameId) {
    case 'critical_v1':
      return <CriticalLandingPreview />;
    case 'sea_battle_v1':
      return <SeaBattleLandingBoard />;
    case 'chess_v1':
      return <ChessLandingPreview />;
    case 'checkers_v1':
      return <CheckersLandingPreview />;
    case 'tic_tac_toe_v1':
      return <TicTacToeLandingPreview />;
    case 'cascade_v1':
      return <CascadeLandingPreview />;
    case 'glimworm_v1':
      return <GlimwormLandingPreview />;
    case 'cat_dash_v1':
      return <CatDashLandingPreview />;
    case 'backgammon_v1':
      return <BackgammonLandingPreview />;
    default:
      return null;
  }
}

export function RailPreviewArt({ gameId, themeId, onThemeChange }: Props) {
  return (
    <GameLandingThemeProvider
      theme={themeId}
      onThemeChange={onThemeChange}
      initialTheme={themeId}
    >
      <GamePreviewComponent gameId={gameId} />
    </GameLandingThemeProvider>
  );
}
