'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';
import { Badge, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameBotPlay } from './GameBotPlay';
import type { GameLandingHeroProps } from './types';
import { useGameLandingTheme } from './GameLandingThemeContext';
import { isAiVsAiSupported } from '@/features/games/lib/aiVsAi';
import { GameLandingLiveStats } from './GameLandingLiveStats';
import { gamesApi } from '@/features/games/api';

const AIvsAIViewer = dynamic(
  () => import('@/features/games/ui/AIvsAIViewer').then((m) => m.AIvsAIViewer),
  { ssr: false },
);

const GameInviteModal = dynamic(
  () => import('./GameInviteModal').then((m) => m.GameInviteModal),
  { ssr: false },
);

export function GameLandingHero({
  gameId,
  title,
  eyebrow,
  subtitle,
  intro,
  directAnswer,
  category,
  playersBadge,
  durationBadge,
  difficultyBadge,
  chips,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel = 'Matchmaking Error',
  ctaPlayHumanLabel,
  ctaPlayHumanErrorLabel,
  browseRoomsLabel,
  createRoomLabel,
  roomsHref,
  createRoomHref,
  heroVisual,
  comingSoon = false,
}: GameLandingHeroProps) {
  const { t } = useTranslation();
  const { theme } = useGameLandingTheme();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAiBattleOpen, setIsAiBattleOpen] = useState(false);
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

  const createHref = createRoomHref
    ? createRoomHref.includes('?')
      ? `${createRoomHref}&theme=${encodeURIComponent(theme)}`
      : `${createRoomHref}?theme=${encodeURIComponent(theme)}`
    : undefined;

  const aiBattleAvailable = !effectiveComingSoon && isAiVsAiSupported(gameId);
  const facts = [
    {
      key: 'players',
      label: t('games.landing.factPlayers'),
      value: playersBadge,
    },
    {
      key: 'duration',
      label: t('games.landing.factDuration'),
      value: durationBadge,
    },
    {
      key: 'difficulty',
      label: t('games.landing.factDifficulty'),
      value: difficultyBadge,
    },
  ].filter((fact) => Boolean(fact.value));

  const tertiaryClass =
    'box-border inline-flex items-center text-sm font-medium text-[var(--foreground)] opacity-80 underline-offset-4 hover:underline hover:text-[var(--primary)] hover:opacity-100 transition-colors bg-transparent border-0 p-0 cursor-pointer';

  return (
    <header
      id="play"
      className="box-border relative w-full pt-6 pb-10 scroll-mt-32 overflow-hidden"
    >
      <div className="box-border grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div
          className={`box-border flex flex-col gap-5 ${
            heroVisual ? 'lg:col-span-7' : 'lg:col-span-12 max-w-4xl'
          }`}
        >
          {eyebrow || category ? (
            <div className="box-border flex flex-wrap items-center gap-2">
              {eyebrow ? (
                <Badge variant="info" size="sm">
                  {eyebrow}
                </Badge>
              ) : null}
              {category ? (
                <Badge variant="neutral" size="sm">
                  {category}
                </Badge>
              ) : null}
            </div>
          ) : null}

          <div className="box-border flex flex-col gap-3">
            <h1 className="box-border m-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1]">
              {title}
            </h1>
            {subtitle ? (
              <p className="box-border m-0 text-lg sm:text-xl font-medium text-[var(--color)] leading-snug">
                {subtitle}
              </p>
            ) : null}
            {intro ? (
              <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
                {intro}
              </p>
            ) : null}
            {directAnswer ? (
              <div className="box-border flex flex-col gap-1.5 p-4 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 backdrop-blur-sm max-w-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color)]">
                  <span aria-hidden="true">✦</span>
                  <span>{t('games.landing.overview')}</span>
                </div>
                <p className="m-0 text-sm font-medium text-[var(--foreground)] opacity-95 leading-relaxed">
                  {directAnswer}
                </p>
              </div>
            ) : null}
          </div>

          <div
            role="group"
            aria-label={t('games.landing.primaryActions')}
            className="box-border flex flex-col gap-3"
          >
            <div className="box-border flex flex-wrap items-center gap-3">
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
              {createHref ? (
                effectiveComingSoon ? (
                  <span className="box-border inline-flex">
                    <Button variant="outline" size="lg" disabled>
                      {createRoomLabel ?? t('games.landing.createRoom')}
                    </Button>
                  </span>
                ) : (
                  <Link href={createHref} className="box-border inline-flex">
                    <Button variant="outline" size="lg">
                      {createRoomLabel ?? t('games.landing.createRoom')}
                    </Button>
                  </Link>
                )
              ) : null}
            </div>

            <div
              className="box-border flex flex-wrap items-center gap-x-5 gap-y-2"
              aria-label={t('games.landing.moreWays')}
              role="group"
            >
              <Link href={roomsHref} className={tertiaryClass}>
                {browseRoomsLabel ?? t('games.landing.browseRooms')}
              </Link>
              <button
                type="button"
                className={tertiaryClass}
                onClick={() => setIsInviteOpen(true)}
              >
                {t('games.landing.invite')}
              </button>
              {aiBattleAvailable ? (
                <button
                  type="button"
                  className={tertiaryClass}
                  aria-expanded={isAiBattleOpen}
                  onClick={() => setIsAiBattleOpen(!isAiBattleOpen)}
                >
                  {isAiBattleOpen
                    ? t('games.landing.closeAi')
                    : t('games.landing.watchAi')}
                </button>
              ) : null}
            </div>

            {isAiBattleOpen && aiBattleAvailable ? (
              <div className="box-border p-4 rounded-2xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] backdrop-blur-md max-w-md">
                <AIvsAIViewer
                  gameId={gameId}
                  theme={theme}
                  buttonVariant="victory"
                />
              </div>
            ) : null}
          </div>

          {facts.length > 0 ? (
            <dl
              aria-label={t('games.landing.facts')}
              data-testid="game-hero-facts"
              className="box-border m-0 flex flex-wrap items-stretch gap-x-6 gap-y-3 pt-4 border-t border-[var(--borderColor)]/40"
            >
              {facts.map((fact) => (
                <div
                  key={fact.key}
                  className="box-border flex flex-col gap-0.5"
                >
                  <dt className="box-border text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-60">
                    {fact.label}
                  </dt>
                  <dd className="box-border m-0 text-sm sm:text-base font-semibold text-[var(--foreground)]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <GameLandingLiveStats gameId={gameId} />

          {chips && chips.length > 0 ? (
            <div className="box-border flex flex-wrap items-center gap-2 pt-1">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="box-border inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--glassBg)] border border-[var(--borderColor)] text-[var(--foreground)] opacity-95 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {heroVisual ? (
          <div className="box-border lg:col-span-5 flex justify-center items-center w-full">
            <div className="box-border relative w-full max-w-full sm:max-w-[480px] flex flex-col items-center justify-center">
              {heroVisual}
            </div>
          </div>
        ) : null}
      </div>

      <GameInviteModal
        open={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        gameId={gameId}
        gameTitle={title}
      />
    </header>
  );
}
