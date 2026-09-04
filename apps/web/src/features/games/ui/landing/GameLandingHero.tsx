'use client';

import Link from 'next/link';
import { QuickplayCta } from '@/features/games/ui/QuickplayCta';
import { Badge, Button } from '@arcadeum/ui';
import type { GameLandingHeroProps } from './types';
import { useGameLandingTheme } from './GameLandingThemeContext';
import { AIvsAIViewer } from '@/features/games/ui/AIvsAIViewer';
import { isAiVsAiSupported } from '@/features/games/lib/aiVsAi';
import { GameLandingLiveStats } from './GameLandingLiveStats';

export function GameLandingHero({
  gameId,
  title,
  eyebrow,
  subtitle,
  intro,
  category,
  playersBadge,
  durationBadge,
  difficultyBadge,
  chips,
  ctaQuickplayLabel = 'Quick Match (AI)',
  ctaQuickplayErrorLabel = 'Matchmaking Error',
  ctaPlayHumanLabel,
  ctaPlayHumanErrorLabel,
  browseRoomsLabel = 'Browse Active Rooms',
  createRoomLabel = 'Create Room',
  roomsHref,
  createRoomHref,
  heroVisual,
  comingSoon = false,
}: GameLandingHeroProps) {
  const { theme } = useGameLandingTheme();

  const createHref = createRoomHref
    ? createRoomHref.includes('?')
      ? `${createRoomHref}&theme=${encodeURIComponent(theme)}`
      : `${createRoomHref}?theme=${encodeURIComponent(theme)}`
    : undefined;

  return (
    <header className="box-border relative w-full pt-6 pb-12 overflow-hidden">
      <div className="box-border grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="box-border flex flex-col gap-5 lg:col-span-7">
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
            {playersBadge ? (
              <Badge variant="success" size="sm">
                {playersBadge}
              </Badge>
            ) : null}
            {durationBadge ? (
              <Badge variant="warning" size="sm">
                {durationBadge}
              </Badge>
            ) : null}
            {difficultyBadge ? (
              <Badge variant="error" size="sm">
                {difficultyBadge}
              </Badge>
            ) : null}
          </div>

          <div className="box-border flex flex-col gap-3">
            <h1 className="box-border m-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1]">
              {title}
            </h1>
            {subtitle ? (
              <p className="box-border m-0 text-lg sm:text-xl font-medium text-[var(--primary)] leading-snug">
                {subtitle}
              </p>
            ) : null}
            {intro ? (
              <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-85 leading-relaxed max-w-2xl">
                {intro}
              </p>
            ) : null}
          </div>

          <GameLandingLiveStats gameId={gameId} />

          <div className="box-border flex flex-wrap items-center gap-3 pt-2">
            <QuickplayCta
              gameId={gameId}
              theme={theme}
              ctaQuickplay={ctaQuickplayLabel}
              ctaQuickplayError={ctaQuickplayErrorLabel}
              ctaPlayHuman={ctaPlayHumanLabel}
              ctaPlayHumanError={ctaPlayHumanErrorLabel}
              disabled={comingSoon}
            />

            {!comingSoon && isAiVsAiSupported(gameId) ? (
              <AIvsAIViewer
                gameId={gameId}
                theme={theme}
                buttonVariant="outline"
              />
            ) : null}

            <Link href={roomsHref} className="box-border inline-flex">
              <Button variant="secondary" size="lg">
                {browseRoomsLabel}
              </Button>
            </Link>

            {createHref ? (
              comingSoon ? (
                <span className="box-border inline-flex">
                  <Button variant="victory" size="lg" disabled>
                    {createRoomLabel}
                  </Button>
                </span>
              ) : (
                <Link href={createHref} className="box-border inline-flex">
                  <Button variant="victory" size="lg">
                    {createRoomLabel}
                  </Button>
                </Link>
              )
            ) : null}
          </div>

          {chips && chips.length > 0 ? (
            <div className="box-border flex flex-wrap items-center gap-2 pt-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="box-border inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--glassBg)] border border-[var(--borderColor)] text-[var(--foreground)] opacity-90 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {heroVisual ? (
          <div className="box-border lg:col-span-5 flex justify-center items-center w-full">
            <div className="box-border relative w-full max-w-full sm:max-w-[460px] p-4 sm:p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] shadow-2xl backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
              {heroVisual}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
