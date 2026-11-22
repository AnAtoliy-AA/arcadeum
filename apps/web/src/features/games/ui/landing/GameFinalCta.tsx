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
    <section className="box-border relative my-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--glassBg)] to-[var(--primary)]/10 border border-[var(--borderColor)] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center text-center gap-6">
      <div className="box-border flex flex-col gap-2 max-w-xl">
        <h2 className="box-border m-0 text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          {title}
        </h2>
        <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed">
          {subtitle ?? t('games.landing.finalBotHint')}
        </p>
      </div>

      <div className="box-border flex flex-wrap items-center justify-center gap-3">
        <QuickplayButton
          gameId={gameId}
          label={ctaPlayHumanLabel ?? t('games.landing.playNow')}
          mode="human"
          theme={theme}
          size="lg"
          errorLabel={ctaPlayHumanErrorLabel ?? ctaQuickplayErrorLabel}
          disabled={effectiveComingSoon}
        />
        <GameBotPlay
          gameId={gameId}
          theme={theme}
          label={ctaQuickplayLabel}
          errorLabel={ctaQuickplayErrorLabel}
          size="lg"
          disabled={effectiveComingSoon}
        />
      </div>

      <Link
        href={gamesHref}
        className="box-border text-sm font-medium text-[var(--foreground)] opacity-80 hover:text-[var(--primary)] hover:underline"
      >
        ← {backToGamesLabel ?? t('games.landing.allGames')}
      </Link>
    </section>
  );
}
