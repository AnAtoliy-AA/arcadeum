import Link from 'next/link';
import { appConfig } from '@/shared/config/app-config';

const GAMES = [
  {
    id: 'sea_battle_v1',
    name: 'Sea Battle (Battleship)',
    description:
      'Classic naval combat strategy game. Place your ships, guess coordinates, and sink the enemy fleet.',
    players: '2–6',
    duration: '10 min',
    href: '/games/sea-battle',
  },
  {
    id: 'critical_v1',
    name: 'Critical',
    description:
      'Strategic card game: draw, defuse, and survive the explosion.',
    players: '3–5',
    duration: '15 min',
    href: '/games/critical',
  },
  {
    id: 'tic_tac_toe_v1',
    name: 'Tic-Tac-Toe',
    description: 'Six themed variants with boards from 3×3 to 9×9.',
    players: '2–5',
    duration: '5 min',
    href: '/games/tic-tac-toe',
  },
  {
    id: 'cascade_v1',
    name: 'Cascade',
    description:
      'Shedding card game with Draw-Two and Wild +4 stacking chains.',
    players: '2–10',
    duration: '10 min',
    href: '/games/cascade',
  },
  {
    id: 'chess_v1',
    name: 'Chess',
    description: 'Classic strategy game for two players.',
    players: '2',
    duration: '15 min',
    href: '/games/chess',
  },
  {
    id: 'glimworm_v1',
    name: 'Glimworm',
    description:
      'Real-time glow-worm snake arena. Slither, survive, and eat the lights.',
    players: '2–10',
    duration: '90 sec',
    href: '/games',
  },
];

const FEATURES = [
  {
    icon: '🎮',
    title: 'Real-time Rooms',
    description:
      'Create game rooms instantly and start playing with friends in seconds.',
  },
  {
    icon: '⚡',
    title: 'Automated Rules',
    description:
      'The app handles rules, scoring, and turn management automatically.',
  },
  {
    icon: '📱',
    title: 'Cross-platform',
    description:
      'Play in your browser on desktop and mobile. No downloads required.',
  },
  {
    icon: '🔒',
    title: 'Private Rooms & Chat',
    description: 'Secured rooms with integrated chat for your group.',
  },
  {
    icon: '📊',
    title: 'Game Statistics',
    description: 'Track win rates, history, and achievements across all games.',
  },
  {
    icon: '🏆',
    title: 'Tournaments',
    description: 'Compete in ranked events against the best players.',
  },
];

export function NoscriptFallback() {
  return (
    <noscript>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <section
          aria-labelledby="noscript-games-heading"
          style={{ marginBottom: '3rem' }}
        >
          <h2
            id="noscript-games-heading"
            style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
          >
            Featured Games
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {GAMES.map((game) => (
              <article
                key={game.id}
                style={{
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {game.name}
                </h3>
                <p style={{ color: '#999', marginBottom: '1rem' }}>
                  {game.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#666',
                  }}
                >
                  <span>
                    <strong>{game.players}</strong> players
                  </span>
                  <span>
                    <strong>{game.duration}</strong> match
                  </span>
                </div>
                <Link
                  href={game.href}
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  Play {game.name}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="noscript-features-heading"
          style={{ marginBottom: '3rem' }}
        >
          <h2
            id="noscript-features-heading"
            style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
          >
            Why {appConfig.appName}?
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #333',
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#999' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="noscript-cta-heading">
          <h2
            id="noscript-cta-heading"
            style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
          >
            Get Started
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Play free online board games with friends. No download required.
          </p>
          <Link
            href="/en/games"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Browse All Games
          </Link>
        </section>
      </div>
    </noscript>
  );
}
