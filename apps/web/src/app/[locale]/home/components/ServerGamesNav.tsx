import Link from 'next/link';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

const GAMES = [
  { id: 'sea_battle_v1', name: 'Sea Battle', href: '/games/sea-battle' },
  { id: 'critical_v1', name: 'Critical', href: '/games/critical' },
  { id: 'tic_tac_toe_v1', name: 'Tic-Tac-Toe', href: '/games/tic-tac-toe' },
  { id: 'cascade_v1', name: 'Cascade', href: '/games/cascade' },
  { id: 'chess_v1', name: 'Chess', href: '/games/chess' },
  { id: 'checkers_v1', name: 'Checkers', href: '/games/checkers' },
  { id: 'game_2048', name: '2048', href: '/games/2048' },
  { id: 'solitaire', name: 'Solitaire', href: '/games/solitaire' },
  { id: 'glimworm_v1', name: 'Glimworm', href: '/games/glimworm' },
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
