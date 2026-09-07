import Link from 'next/link';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

const GAMES = [
  { id: 'critical_v1', name: 'Critical', href: '/games/critical' },
  { id: 'sea_battle_v1', name: 'Sea Battle', href: '/games/sea-battle' },
  { id: 'glimworm_v1', name: 'Glimworm', href: '/games/glimworm' },
  { id: 'tic_tac_toe_v1', name: 'Tic-Tac-Toe', href: '/games/tic-tac-toe' },
  { id: 'cascade_v1', name: 'Cascade', href: '/games/cascade' },
  { id: 'chess_v1', name: 'Chess', href: '/games/chess' },
  { id: 'checkers_v1', name: 'Checkers', href: '/games/checkers' },
  { id: 'cat_dash_v1', name: 'Cat Dash', href: '/games/cat-dash' },
  { id: 'backgammon_v1', name: 'Backgammon', href: '/games/backgammon' },
  { id: 'hearts_v1', name: 'Hearts', href: '/games/hearts' },
  { id: 'spades_v1', name: 'Spades', href: '/games/spades' },
  { id: 'go_v1', name: 'Go', href: '/games/go' },
  { id: 'pachisi_v1', name: 'Pachisi', href: '/games/pachisi' },
  { id: 'solitaire_v1', name: 'Solitaire', href: '/games/solitaire' },
  { id: 'minesweeper_v1', name: 'Minesweeper', href: '/games/minesweeper' },
  { id: 'sudoku_v1', name: 'Sudoku', href: '/games/sudoku' },
  { id: 'game_2048_v1', name: '2048', href: '/games/2048' },
];

export function ServerGamesNav({ locale }: { locale: Locale }) {
  const routes = buildRoutes(locale);

  return (
    <nav aria-label="Games navigation" className="sr-only">
      <ul>
        {GAMES.map((game) => (
          <li key={game.id}>
            <Link href={`/${locale}${game.href}`}>{game.name}</Link>
          </li>
        ))}
        <li>
          <Link href={routes.games}>View All Games</Link>
        </li>
      </ul>
    </nav>
  );
}
