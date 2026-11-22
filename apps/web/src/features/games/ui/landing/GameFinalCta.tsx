'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameBotPlay } from './GameBotPlay';
import type { GameFinalCtaProps } from './types';
import { useGameLandingTheme } from './GameLandingThemeContext';
import { gamesApi } from '@/features/games/api';

export function GameFinalCta({
  gameId,
  title,
  subtitle,
  gamesHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
  ctaPlayHumanLabel,
  ctaPlayHumanErrorLabel,
  backToGamesLabel,
  comingSoon = false,
}: GameFinalCtaProps) {
  const { t } = useTranslation();
  const { theme } = useGameLandingTheme();
  const [effectiveComingSoon, setEffectiveComingSoon] = useState(comingSoon);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const entry = res.games.find((g) => g.gameId === gameId);
        if (entry) {
          setEffectiveComingSoon(entry.comingSoon);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return (
    <section className="box-border relative my-10 sm:my-12 p-8 sm:p-14 rounded-[2rem] bg-gradient-to-br from-[var(--glassBg)] to-[var(--primary)]/15 border border-[var(--borderColor)] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center text-center gap-8">
      <div
        aria-hidden="true"
        className="box-border pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full bg-[var(--primary)]/20 blur-3xl"
      />
      <div className="box-border relative flex flex-col gap-3 max-w-xl">
        <h2 className="box-border m-0 text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
          {title}
        </h2>
        <p className="box-border m-0 text-base text-[var(--foreground)] opacity-85 leading-relaxed">
          {subtitle ?? t('games.landing.finalBotHint')}
        </p>
      </div>

      <div className="box-border relative flex flex-col items-stretch gap-4 w-full max-w-md">
        <div className="box-border flex flex-col [&_button]:w-full [&_button]:min-h-14 [&_button]:text-base">
          <QuickplayButton
            gameId={gameId}
            label={ctaPlayHumanLabel ?? t('games.landing.playNow')}
            mode="human"
            theme={theme}
            size="lg"
            errorLabel={ctaPlayHumanErrorLabel ?? ctaQuickplayErrorLabel}
            disabled={effectiveComingSoon}
          />
        </div>
        <GameBotPlay
          gameId={gameId}
          theme={theme}
          label={ctaQuickplayLabel}
          errorLabel={ctaQuickplayErrorLabel}
          size="md"
          disabled={effectiveComingSoon}
        />
      </div>

      <Link
        href={gamesHref}
        className="box-border relative inline-flex items-center min-h-11 px-3 text-sm font-medium text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        ← {backToGamesLabel ?? t('games.landing.allGames')}
      </Link>
    </section>
  );
}
