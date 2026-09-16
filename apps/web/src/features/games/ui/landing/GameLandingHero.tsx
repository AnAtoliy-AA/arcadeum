'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QuickplayCta } from '@/features/games/ui/QuickplayCta';
import { Badge, Button } from '@arcadeum/ui';
import type { GameLandingHeroProps } from './types';
import { useGameLandingTheme } from './GameLandingThemeContext';
import { AIvsAIViewer } from '@/features/games/ui/AIvsAIViewer';
import { isAiVsAiSupported } from '@/features/games/lib/aiVsAi';
import { GameLandingLiveStats } from './GameLandingLiveStats';
import { GameInviteModal } from './GameInviteModal';

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
  quickNavItems,
}: GameLandingHeroProps) {
  const { theme } = useGameLandingTheme();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAiBattleOpen, setIsAiBattleOpen] = useState(false);

  const createHref = createRoomHref
    ? createRoomHref.includes('?')
      ? `${createRoomHref}&theme=${encodeURIComponent(theme)}`
      : `${createRoomHref}?theme=${encodeURIComponent(theme)}`
    : undefined;

  return (
    <header
      id="play"
      className="box-border relative w-full pt-6 pb-12 overflow-hidden"
    >
      <div className="box-border grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div
          className={`box-border flex flex-col gap-5 ${
            heroVisual ? 'lg:col-span-7' : 'lg:col-span-12 max-w-4xl'
          }`}
        >
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
                  <span>✦</span>
                  <span>Quick Overview</span>
                </div>
                <p className="m-0 text-sm font-medium text-[var(--foreground)] opacity-95 leading-relaxed">
                  {directAnswer}
                </p>
              </div>
            ) : null}
          </div>

          <GameLandingLiveStats gameId={gameId} />

          <div className="box-border flex flex-col gap-2.5 pt-2">
            <div className="box-border flex flex-wrap items-center gap-2.5">
              <QuickplayCta
                gameId={gameId}
                theme={theme}
                ctaQuickplay={ctaQuickplayLabel}
                ctaQuickplayError={ctaQuickplayErrorLabel}
                ctaPlayHuman={ctaPlayHumanLabel}
                ctaPlayHumanError={ctaPlayHumanErrorLabel}
                size="md"
                disabled={comingSoon}
              />

              {createHref ? (
                comingSoon ? (
                  <span className="box-border inline-flex">
                    <Button variant="outline" size="md" disabled>
                      {createRoomLabel}
                    </Button>
                  </span>
                ) : (
                  <Link href={createHref} className="box-border inline-flex">
                    <Button variant="outline" size="md">
                      {createRoomLabel}
                    </Button>
                  </Link>
                )
              ) : null}
            </div>

            <div className="box-border flex flex-wrap items-center gap-2">
              <Link href={roomsHref} className="box-border inline-flex">
                <Button variant="secondary" size="sm">
                  {browseRoomsLabel}
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteOpen(true)}
              >
                Invite / Share 🔗
              </Button>

              {!comingSoon && isAiVsAiSupported(gameId) ? (
                <Button
                  variant={isAiBattleOpen ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsAiBattleOpen(!isAiBattleOpen)}
                >
                  {isAiBattleOpen ? 'Close AI Battle ▴' : 'Watch AI vs AI 🤖'}
                </Button>
              ) : null}
            </div>

            {isAiBattleOpen && !comingSoon && isAiVsAiSupported(gameId) ? (
              <div className="box-border p-4 rounded-2xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] backdrop-blur-md max-w-md">
                <AIvsAIViewer
                  gameId={gameId}
                  theme={theme}
                  buttonVariant="victory"
                />
              </div>
            ) : null}
          </div>

          {quickNavItems && quickNavItems.length > 0 ? (
            <nav
              aria-label="Quick navigation"
              className="box-border flex flex-wrap items-center gap-2 pt-2.5 border-t border-[var(--borderColor)]/40 mt-1"
            >
              <span className="box-border text-xs font-semibold uppercase tracking-wider text-[var(--color)] mr-1">
                Explore:
              </span>
              {quickNavItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href ?? `#${item.id}`}
                  className="box-border inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--surfaceBg)] border border-[var(--borderColor)] text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="box-border px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--primary)] text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              ))}
            </nav>
          ) : null}

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
