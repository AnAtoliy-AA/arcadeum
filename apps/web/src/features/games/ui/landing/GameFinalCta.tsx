import Link from 'next/link';
import { QuickplayCta } from '@/features/games/ui/QuickplayCta';
import { Button } from '@arcadeum/ui';
import type { GameFinalCtaProps } from './types';

export function GameFinalCta({
  gameId,
  title = 'Ready to Play?',
  subtitle = 'Jump into matchmaking against smart bots or challenge real players worldwide.',
  roomsHref,
  gamesHref,
  ctaQuickplayLabel = 'Play Instant Match',
  ctaQuickplayErrorLabel = 'Matchmaking Error',
  ctaPlayHumanLabel,
  ctaPlayHumanErrorLabel,
  browseRoomsLabel = 'Browse Active Rooms',
  backToGamesLabel = 'All Games',
}: GameFinalCtaProps) {
  return (
    <section className="box-border relative my-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--glassBg)] to-[var(--primary)]/10 border border-[var(--borderColor)] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center text-center gap-6">
      <div className="box-border flex flex-col gap-2 max-w-xl">
        <h2 className="box-border m-0 text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          {title}
        </h2>
        <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-85 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="box-border flex flex-wrap items-center justify-center gap-3">
        <QuickplayCta
          gameId={gameId}
          ctaQuickplay={ctaQuickplayLabel}
          ctaQuickplayError={ctaQuickplayErrorLabel}
          ctaPlayHuman={ctaPlayHumanLabel}
          ctaPlayHumanError={ctaPlayHumanErrorLabel}
        />

        <Link href={roomsHref} className="box-border inline-flex">
          <Button variant="secondary" size="lg">
            {browseRoomsLabel}
          </Button>
        </Link>

        <Link href={gamesHref} className="box-border inline-flex">
          <Button variant="ghost" size="lg">
            ← {backToGamesLabel}
          </Button>
        </Link>
      </div>
    </section>
  );
}
