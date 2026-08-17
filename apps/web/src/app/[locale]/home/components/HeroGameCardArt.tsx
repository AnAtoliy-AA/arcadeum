import React from 'react';
import { SeaBattleHeroArt } from './hero-art/SeaBattleHeroArt';
import { ChessHeroArt } from './hero-art/ChessHeroArt';
import { CascadeHeroArt } from './hero-art/CascadeHeroArt';

interface HeroCardArtProps {
  gameId: 'sea_battle_v1' | 'chess_v1' | 'cascade_v1';
}

export function HeroGameCardArt({ gameId }: HeroCardArtProps) {
  switch (gameId) {
    case 'sea_battle_v1':
      return <SeaBattleHeroArt />;
    case 'chess_v1':
      return <ChessHeroArt />;
    case 'cascade_v1':
      return <CascadeHeroArt />;
    default:
      return null;
  }
}
