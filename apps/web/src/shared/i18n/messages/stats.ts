import type { Locale } from '../types';

const statsMessagesDefinition = {
  en: {
    pageTitle: 'Statistics',
    myStatsTab: 'My Stats',
    leaderboardTab: 'Leaderboard',
    loginRequired: 'Please log in to view your statistics.',
    errorLoading: 'Error loading stats',
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
  },
  es: {
    pageTitle: 'Estadísticas',
    myStatsTab: 'Mis Estadísticas',
    leaderboardTab: 'Clasificación',
    loginRequired: 'Por favor inicia sesión para ver tus estadísticas.',
    errorLoading: 'Error al cargar estadísticas',
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
  },
  fr: {
    pageTitle: 'Statistiques',
    myStatsTab: 'Mes Stats',
    leaderboardTab: 'Classement',
    loginRequired: 'Veuillez vous connecter pour voir vos statistiques.',
    errorLoading: 'Erreur de chargement des statistiques',
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
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const statsMessages = statsMessagesDefinition;

/** Derived type from the statsMessages object - English locale structure */
export type StatsMessages = (typeof statsMessagesDefinition)['en'];
