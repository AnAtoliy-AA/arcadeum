import type {
  TournamentGameType,
  TournamentLocale,
} from '../schemas/tournament.schema';
import type { TournamentLocaleContentItem } from '../interfaces/tournament.interface';

/**
 * Games that run an automated weekly bracket cup. To add another game, add a
 * key here and an entry in WEEKLY_CUP_DEFINITIONS (plus its TournamentGameType).
 */
export const WEEKLY_CUP_GAMES = ['sea-battle', 'checkers'] as const;
export type WeeklyCupGame = (typeof WEEKLY_CUP_GAMES)[number];

export function isWeeklyCupGame(value: unknown): value is WeeklyCupGame {
  return (
    typeof value === 'string' &&
    (WEEKLY_CUP_GAMES as readonly string[]).includes(value)
  );
}

export interface WeeklyCupDefinition {
  game: WeeklyCupGame;
  gameType: TournamentGameType;
  /** Key in the tournament_settings collection. */
  settingKey: string;
  /** UTC weekday (0 = Sunday ... 6 = Saturday) the cup starts on. */
  weekdayUtc: number;
  hourUtc: number;
  maxPlayers: number;
  defaultPrizePoolCoins: number;
  defaultPrizeDescription: string;
  fallbackName: string;
  content: Record<TournamentLocale, TournamentLocaleContentItem>;
}

export const WEEKLY_CUP_DEFINITIONS: Record<
  WeeklyCupGame,
  WeeklyCupDefinition
> = {
  'sea-battle': {
    game: 'sea-battle',
    gameType: 'sea_battle_v1',
    settingKey: 'sea_battle_weekly_blitz',
    weekdayUtc: 6,
    hourUtc: 18,
    maxPlayers: 16,
    defaultPrizePoolCoins: 500,
    defaultPrizeDescription: '500 Coins + Admiral Trophy',
    fallbackName: 'Sea Battle Blitz Cup',
    content: {
      en: {
        name: 'Sea Battle Weekend Blitz Cup',
        description:
          'Weekly single-elimination naval blitz tournament! Command your fleet, predict enemy coordinates, and sink your opponents to claim the championship trophy.',
      },
      ru: {
        name: 'Морской бой: Еженедельный Блиц-Кубок',
        description:
          'Еженедельный турнир на выбывание по Морскому бою! Командуйте флотом, вычисляйте координаты врага и завоюйте чемпионский кубок.',
      },
      es: {
        name: 'Copa Blitz Semanal de Batalla Naval',
        description:
          '¡Torneo semanal de eliminación directa de Batalla Naval! Dirige tu flota, predice las coordenadas enemigas y álzate con el trofeo de campeón.',
      },
      fr: {
        name: 'Coupe Blitz Hebdomadaire de Bataille Navale',
        description:
          'Tournoi hebdomadaire à élimination directe de Bataille Navale ! Commandez votre flotte, anticipez les tirs ennemis et devenez le champion naval.',
      },
      by: {
        name: 'Марскі бой: Штотыднёвы Бліц-Кубак',
        description:
          'Штотыднёвы турнір на выбыванне па Марскім боі! Камандуйце флотам, знаходзьце каардынаты ворага і заваюйце чэмпіёнскі кубак.',
      },
    },
  },
  checkers: {
    game: 'checkers',
    gameType: 'checkers_v1',
    settingKey: 'checkers_weekly_cup',
    weekdayUtc: 0,
    hourUtc: 18,
    maxPlayers: 16,
    defaultPrizePoolCoins: 400,
    defaultPrizeDescription: '400 Coins + Crown Trophy',
    fallbackName: 'Checkers Weekly Cup',
    content: {
      en: {
        name: 'Checkers Weekly Cup',
        description:
          'Weekly single-elimination checkers tournament! Out-jump your rivals, crown your kings, and claim the championship trophy.',
      },
      ru: {
        name: 'Шашки: Еженедельный Кубок',
        description:
          'Еженедельный турнир на выбывание по шашкам! Обыгрывайте соперников, проводите дамки и завоюйте чемпионский кубок.',
      },
      es: {
        name: 'Copa Semanal de Damas',
        description:
          '¡Torneo semanal de eliminación directa de Damas! Supera a tus rivales, corona tus reyes y álzate con el trofeo de campeón.',
      },
      fr: {
        name: 'Coupe Hebdomadaire de Dames',
        description:
          'Tournoi hebdomadaire de Dames à élimination directe ! Surpassez vos rivaux, couronnez vos dames et décrochez le trophée.',
      },
      by: {
        name: 'Шашкі: Штотыднёвы Кубак',
        description:
          'Штотыднёвы турнір на выбыванне па шашках! Абыгрывайце супернікаў, праводзьце дамкі і заваюйце чэмпіёнскі кубак.',
      },
    },
  },
};
