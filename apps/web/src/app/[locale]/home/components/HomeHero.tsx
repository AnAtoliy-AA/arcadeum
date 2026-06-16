'use client';
import React, { useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { formatMessage } from '@/shared/i18n';
import { appConfig } from '@/shared/config/app-config';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { SupportIcon } from '@/shared/ui';
import Link from 'next/link';
import Image from 'next/image';
import { CARD_VARIANTS } from '@/features/games/lib/criticalVariants';

const HERO_VARIANT_IDS = ['fantasy', 'galaxy', 'steampunk'] as const;

type HeroCard = {
  id: (typeof HERO_VARIANT_IDS)[number];
  nameKey: string;
  bgImage?: string;
};

const MAX_TILT_DEG = 8;

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const routes = useRoutes();

  // Cursor parallax on the card stack. Sets CSS vars consumed by
  // `.hero-card-stack` (see home-bundle.css). No-op for reduced-motion users.
  const handleStackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const stack = stackRef.current;
    if (!stack) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const rect = stack.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    stack.style.setProperty('--tilt-x', `${px * MAX_TILT_DEG * 2}deg`);
    stack.style.setProperty('--tilt-y', `${-py * MAX_TILT_DEG * 2}deg`);
  };

  const handleStackPointerLeave = () => {
    const stack = stackRef.current;
    if (!stack) return;
    stack.style.setProperty('--tilt-x', '0deg');
    stack.style.setProperty('--tilt-y', '0deg');
  };

  const heroCards = useMemo<HeroCard[]>(
    () =>
      HERO_VARIANT_IDS.map((id) => {
        const v = CARD_VARIANTS.find((c) => c.id === id);
        return {
          id,
          nameKey: v?.name ?? '',
          bgImage: v?.bgImage,
        };
      }),
    [],
  );

  useEffect(() => {
    // Manually add the hydration class to avoid a full React re-render of this
    // large component tree. This is the most performant way to trigger
    // animations after hydration.
    sectionRef.current?.classList.add('is-hydrated');
  }, []);

  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const { appName, supportCta } = appConfig;

  const kicker = homeCopy.kicker ?? 'Free online board games';
  const tagline =
    formatMessage(homeCopy.tagline, { appName }) ??
    `${appName} is the ultimate platform to play board games online with friends.`;
  const description =
    formatMessage(homeCopy.description, { appName }) ??
    `Enjoy a wide variety of board games and tabletop experiences online. Create real-time game rooms, invite your friends, and let ${appName} handle rules, scoring, and turns so you can focus on the fun.`;
  const primaryLabel = homeCopy.primaryCtaLabel ?? 'Get started';
  const heroCardBrand = homeCopy.heroCardBrand ?? 'CRITICAL';
  const playLabel = homeCopy.heroCardPlayCta ?? 'Play';
  const supportLabel = homeCopy.supportCtaLabel ?? 'Support the developers';

  const primaryHref = routes.games;

  return (
    <section
      ref={sectionRef}
      className="hero-section-container"
      aria-labelledby="hero-heading"
      data-testid="hero-section"
    >
      <div className="hero-background-overlay" />

      <div className="hero-container-main">
        <div className="hero-content-main">
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="hero-kicker-main kicker-hydration-shimmer">
              ✦ {kicker}
            </span>
          </div>

          {/*
           * Title is intentionally NOT wrapped in animate-fade-in-up so it
           * paints at full opacity at FCP and becomes the LCP element with
           * minimal latency. The kicker, tagline, description, and CTAs
           * still fade in for visual rhythm.
           */}
          <h1
            id="hero-heading"
            className="hero-title-main hero-title-shimmer"
            data-text={appName}
          >
            {appName}
          </h1>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <p className="hero-tagline-main">{tagline}</p>
          </div>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <p className="hero-description-main">{description}</p>
          </div>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="hero-actions-responsive">
              <Link
                href={primaryHref}
                className="home-link-button home-link-button-primary"
              >
                {primaryLabel}
              </Link>
              <Link
                href={supportCta.href}
                className="home-link-button home-link-button-ghost home-btn-gap-2"
              >
                <SupportIcon size={18} />
                {supportLabel}
              </Link>
            </div>
          </div>
        </div>

        <div
          data-testid="hero-visual"
          className="hero-visual-main fade-on-mount"
        >
          <div
            ref={stackRef}
            className="hero-card-stack-main hero-card-stack"
            data-testid="hero-card-stack"
            onPointerMove={handleStackPointerMove}
            onPointerLeave={handleStackPointerLeave}
          >
            {heroCards.map((card, index) => {
              const isLast = index === heroCards.length - 1;
              const isFront = isLast;

              // spread them out slightly more for better visibility of the "not covered" parts
              const x = (index - 1) * 65;
              const rotate = `${(index - 1) * 12}deg`;

              const y = index * -15;
              const zIndexVal = index;
              const scale = isLast ? 1 : 0.95;
              const opacity = isLast ? 1 : 0.8;

              return (
                <div
                  key={index}
                  className="hero-card-main"
                  style={
                    {
                      '--card-x': `${x}px`,
                      '--card-y': `${y}px`,
                      '--card-rotate': rotate,
                      '--card-scale': scale,
                      zIndex: zIndexVal,
                      opacity: opacity,
                    } as React.CSSProperties
                  }
                  data-testid={`hero-card-${index}`}
                >
                  {card.bgImage ? (
                    <Image
                      src={card.bgImage}
                      alt={`${t(card.nameKey as TranslationKey)} game card preview`}
                      fill
                      priority={isFront}
                      sizes="(max-width: 1150px) 60vw, 280px"
                      className="hero-card-image"
                    />
                  ) : null}
                  <div className="hero-card-scrim hero-card-scrim-top" />
                  <div className="hero-card-scrim hero-card-scrim-bottom" />
                  <div className="hero-card-name">
                    {t(card.nameKey as TranslationKey) || card.nameKey}
                  </div>
                  <div className="hero-card-brand">{heroCardBrand}</div>
                  <Link
                    href={`${routes.gameCreate}?variant=${card.id}`}
                    className="hero-card-play-cta"
                    data-testid={`hero-play-cta-${index}`}
                  >
                    {playLabel}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
