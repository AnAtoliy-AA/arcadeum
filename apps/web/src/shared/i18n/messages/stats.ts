import type { DeepPartial } from '../base-types';

export const en = {
  pageTitle: 'Statistics',
  myStatsTab: 'My Stats',
  leaderboardTab: 'Leaderboard',
  loginRequired: 'Please log in to view your statistics.',
  errorLoading: 'Error loading stats',
  loginRequiredBarrier: 'Login required to view statistics',
  // Overview cards
  totalGames: 'Total Games',
  wins: 'Wins',
  losses: 'Losses',
  winRate: 'Win Rate',
  // Game breakdown
  gameBreakdownTitle: 'Game Breakdown',
  game: 'Game',
  total: 'Total',
  // Leaderboard
  filterByGame: 'Filter by Game',
  allGames: 'All Games',
  rank: 'Rank',
  player: 'Player',
  games: 'Games',
  you: 'You',
  loadingMore: 'Loading more players...',
  endOfLeaderboard: "You've reached the end of the leaderboard",
  noPlayersFound: 'No players found for the leaderboard yet.',
};

export const es = {
  pageTitle: 'Estadísticas',
  myStatsTab: 'Mis Estadísticas',
  leaderboardTab: 'Clasificación',
  loginRequired: 'Por favor inicia sesión para ver tus estadísticas.',
  errorLoading: 'Error al cargar estadísticas',
  loginRequiredBarrier: 'Inicia sesión para ver las estadísticas',
  // Overview cards
  totalGames: 'Juegos Totales',
  wins: 'Victorias',
  losses: 'Derrotas',
  winRate: 'Tasa de Victoria',
  // Game breakdown
  gameBreakdownTitle: 'Desglose por Juego',
  game: 'Juego',
  total: 'Total',
  // Leaderboard
  filterByGame: 'Filtrar por Juego',
  allGames: 'Todos los Juegos',
  rank: 'Posición',
  player: 'Jugador',
  games: 'Juegos',
  you: 'Tú',
  loadingMore: 'Cargando más jugadores...',
  endOfLeaderboard: 'Has llegado al final de la clasificación',
  noPlayersFound: 'Aún no hay jugadores en la clasificación.',
};

export const fr = {
  pageTitle: 'Statistiques',
  myStatsTab: 'Mes Stats',
  leaderboardTab: 'Classement',
  loginRequired: 'Veuillez vous connecter pour voir vos statistiques.',
  errorLoading: 'Erreur de chargement des statistiques',
  loginRequiredBarrier: 'Connexion requise pour voir les statistiques',
  // Overview cards
  totalGames: 'Total des Parties',
  wins: 'Victoires',
  losses: 'Défaites',
  winRate: 'Taux de Victoire',
  // Game breakdown
  gameBreakdownTitle: 'Détail par Jeu',
  game: 'Jeu',
  total: 'Total',
  // Leaderboard
  filterByGame: 'Filtrer par Jeu',
  allGames: 'Tous les Jeux',
  rank: 'Rang',
  player: 'Joueur',
  games: 'Parties',
  you: 'Vous',
  loadingMore: 'Chargement de plus de joueurs...',
  endOfLeaderboard: 'Vous avez atteint la fin du classement',
  noPlayersFound: 'Aucun joueur trouvé pour le classement.',
};

export const ru = {
  pageTitle: 'Статистика',
  myStatsTab: 'Моя статистика',
  leaderboardTab: 'Таблица лидеров',
  loginRequired: 'Пожалуйста, войдите, чтобы просмотреть статистику.',
  errorLoading: 'Ошибка загрузки статистики',
  loginRequiredBarrier: 'Войдите, чтобы просмотреть статистику',
  // Overview cards
  totalGames: 'Всего игр',
  wins: 'Победы',
  losses: 'Поражения',
  winRate: 'Процент побед',
  // Game breakdown
  gameBreakdownTitle: 'Детализация по играм',
  game: 'Игра',
  total: 'Всего',
  // Leaderboard
  filterByGame: 'Фильтр по играм',
  allGames: 'Все игры',
  rank: 'Ранг',
  player: 'Игрок',
  games: 'Игры',
  you: 'Вы',
  loadingMore: 'Загрузка игроков...',
  endOfLeaderboard: 'Вы достигли конца таблицы лидеров',
  noPlayersFound: 'Игроки для таблицы лидеров пока не найдены.',
};

export const by = {
  pageTitle: 'Статыстыка',
  myStatsTab: 'Мая статыстыка',
  leaderboardTab: 'Табліца лідэраў',
  loginRequired: 'Калі ласка, увайдзіце, каб праглядзець статыстыку.',
  errorLoading: 'Памылка загрузкі статыстыкі',
  loginRequiredBarrier: 'Увайдзіце, каб прагледзець статыстыку',
  // Overview cards
  totalGames: 'Усяго гульняў',
  wins: 'Перамогі',
  losses: 'Паражэнні',
  winRate: 'Працэнт перамог',
  // Game breakdown
  gameBreakdownTitle: 'Дэталізацыя па гульнях',
  game: 'Гульня',
  total: 'Усяго',
  // Leaderboard
  filterByGame: 'Фільтр па гульнях',
  allGames: 'Усе гульні',
  rank: 'Ранг',
  player: 'Гулец',
  games: 'Гульні',
  you: 'Вы',
  loadingMore: 'Загрузка гульцоў...',
  endOfLeaderboard: 'Вы дасягнулі канца табліцы лідэраў',
  noPlayersFound: 'Гульцы для табліцы лідэраў пакуль не знойдзены.',
};

export const statsMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

/** Derived type for backward compatibility */
export type StatsMessages = DeepPartial<typeof en>;
