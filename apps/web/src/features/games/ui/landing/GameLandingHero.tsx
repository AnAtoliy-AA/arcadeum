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
import { GameStickyPlayBar } from './GameStickyPlayBar';
import { FACT_ICONS } from './landingIcons';
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
    'box-border inline-flex items-center justify-center min-h-11 px-3 rounded-xl text-sm font-medium text-[var(--foreground)] opacity-90 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] hover:opacity-100 motion-safe:transition-colors bg-transparent border-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--primary)]';

  const playLabel = ctaPlayHumanLabel ?? t('games.landing.playNow');

  return (
    <header
      id="play"
      className="box-border relative w-full pt-4 pb-10 scroll-mt-32"
    >
      <div className="box-border grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div
          className={`box-border flex flex-col gap-6 ${
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
            <h1 className="box-border m-0 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.05]">
              {title}
            </h1>
            {subtitle ? (
              <p className="box-border m-0 text-lg sm:text-xl lg:text-2xl font-medium text-[var(--primary)] leading-snug">
                {subtitle}
              </p>
            ) : null}
            {intro ? (
              <p className="box-border m-0 text-base text-[var(--foreground)] opacity-85 leading-relaxed max-w-2xl">
                {intro}
              </p>
            ) : null}
            {directAnswer ? (
              <div className="box-border flex flex-col gap-1.5 p-4 rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 backdrop-blur-sm max-w-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
            id="hero-play-panel"
            role="group"
            aria-label={t('games.landing.primaryActions')}
            className="box-border flex flex-col gap-4 p-4 sm:p-5 rounded-3xl border border-[var(--borderColor)] bg-gradient-to-br from-[var(--glassBg)] to-[var(--primary)]/10 backdrop-blur-xl shadow-xl max-w-2xl"
          >
            <div className="box-border flex flex-col gap-1.5 [&_button]:w-full [&_button]:min-h-14 [&_button]:text-base">
              <QuickplayButton
                gameId={gameId}
                label={playLabel}
                mode="human"
                theme={theme}
                size="lg"
                errorLabel={ctaPlayHumanErrorLabel ?? ctaQuickplayErrorLabel}
                disabled={effectiveComingSoon}
              />
              <p className="box-border m-0 text-xs text-[var(--foreground)] opacity-70 text-center">
                {t('games.landing.playNowHint')}
              </p>
            </div>

            <div className="box-border flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-60">
              <span className="h-px flex-1 bg-[var(--borderColor)]" />
              {t('games.landing.orPractice')}
              <span className="h-px flex-1 bg-[var(--borderColor)]" />
            </div>

            <GameBotPlay
              gameId={gameId}
              theme={theme}
              label={ctaQuickplayLabel}
              errorLabel={ctaQuickplayErrorLabel}
              size="md"
              disabled={effectiveComingSoon}
            />

            <div
              className="box-border flex flex-wrap items-center gap-1 pt-3 border-t border-[var(--borderColor)]/60"
              aria-label={t('games.landing.moreWays')}
              role="group"
            >
              {createHref ? (
                effectiveComingSoon ? (
                  <span className="box-border inline-flex">
                    <Button variant="outline" size="md" disabled>
                      {createRoomLabel ?? t('games.landing.createRoom')}
                    </Button>
                  </span>
                ) : (
                  <Link href={createHref} className="box-border inline-flex">
                    <Button variant="outline" size="md">
                      {createRoomLabel ?? t('games.landing.createRoom')}
                    </Button>
                  </Link>
                )
              ) : null}
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
              <div className="box-border p-4 rounded-2xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] backdrop-blur-md">
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
              className="box-border m-0 flex flex-wrap items-stretch gap-2"
            >
              {facts.map((fact) => (
                <div
                  key={fact.key}
                  className="box-border inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-sm"
                >
                  <span className="box-border text-[var(--primary)]">
                    {FACT_ICONS[fact.key]}
                  </span>
                  <dt className="box-border text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-65">
                    {fact.label}
                  </dt>
                  <dd className="box-border m-0 text-sm font-semibold text-[var(--foreground)]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <GameLandingLiveStats gameId={gameId} />

          {chips && chips.length > 0 ? (
            <div className="box-border flex flex-wrap items-center gap-2">
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
          <div className="box-border lg:col-span-5 flex justify-center items-center w-full lg:sticky lg:top-40">
            <div className="box-border relative w-full max-w-full sm:max-w-[480px] flex flex-col items-center justify-center p-3 rounded-3xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-xl shadow-2xl">
              {heroVisual}
            </div>
          </div>
        ) : null}
      </div>

      <GameStickyPlayBar watchId="hero-play-panel">
        <QuickplayButton
          gameId={gameId}
          label={playLabel}
          mode="human"
          theme={theme}
          size="lg"
          errorLabel={ctaPlayHumanErrorLabel ?? ctaQuickplayErrorLabel}
          disabled={effectiveComingSoon}
        />
      </GameStickyPlayBar>

      <GameInviteModal
        open={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        gameId={gameId}
        gameTitle={title}
      />
    </header>
  );
}
