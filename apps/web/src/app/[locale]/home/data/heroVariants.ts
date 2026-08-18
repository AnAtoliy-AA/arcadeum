export interface HeroFeaturedGame {
  id: 'sea_battle_v1' | 'chess_v1' | 'cascade_v1';
  nameKey: string;
  genreKey: string;
  playersKey: string;
  landingHref: string;
  createHref: string;
  accentColor: string;
  glowColor: string;
}

export const HERO_GAMES: readonly HeroFeaturedGame[] = [
  {
    id: 'sea_battle_v1',
    nameKey: 'games.sea_battle_v1.name',
    genreKey: 'games.shared.category.strategy',
    playersKey: '2–4',
    landingHref: '/games/sea-battle',
    createHref: '/games/create?gameId=sea_battle_v1',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
  },
  {
    id: 'chess_v1',
    nameKey: 'games.chess_v1.name',
    genreKey: 'games.shared.category.boardGame',
    playersKey: '2',
    landingHref: '/games/chess',
    createHref: '/games/create?gameId=chess_v1',
    accentColor: '#fde047',
    glowColor: 'rgba(250, 204, 21, 0.22)',
  },
  {
    id: 'cascade_v1',
    nameKey: 'games.cascade_v1.name',
    genreKey: 'games.shared.category.cardGame',
    playersKey: '2–10',
    landingHref: '/games/cascade',
    createHref: '/games/create?gameId=cascade_v1',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.25)',
  },
] as const;

export const HERO_CARD_FAN_OFFSET = 140;
