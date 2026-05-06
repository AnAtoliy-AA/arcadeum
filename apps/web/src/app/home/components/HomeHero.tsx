'use client';
import React, { useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { formatMessage } from '@/shared/i18n';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import './styles/hero-stable.css';
import { SupportIcon } from '@/shared/ui';
import Link from 'next/link';
import { CARD_VARIANTS } from '@/features/games/lib/criticalVariants';

type ThemeColor = '$red10' | '$blue10' | '$purple10';
const THEME_COLORS: ThemeColor[] = ['$red10', '$blue10', '$purple10'];

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const heroCards = useMemo(
    () =>
      [...CARD_VARIANTS].slice(0, 3).map((v, i) => ({
        name: v.name,
        icon: v.emoji,
        colorToken: THEME_COLORS[i % THEME_COLORS.length],
      })),
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

  const kicker = homeCopy.kicker ?? 'The future of online board games';
  const tagline =
    formatMessage(homeCopy.tagline, { appName }) ??
    `${appName} is the ultimate platform to play board games online with friends.`;
  const description =
    formatMessage(homeCopy.description, { appName }) ??
    `Enjoy a wide variety of board games and tabletop experiences online. Create real-time game rooms, invite your friends, and let ${appName} handle rules, scoring, and turns so you can focus on the fun.`;
  const primaryLabel = homeCopy.primaryCtaLabel ?? 'Get started';
  const heroCardBrand = homeCopy.heroCardBrand ?? 'CRITICAL';
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

          <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <h1
              id="hero-heading"
              className="hero-title-main hero-title-shimmer"
              data-text={appName}
            >
              {appName}
            </h1>
          </div>

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
                prefetch={false}
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
            className="hero-card-stack-main hero-card-stack"
            data-testid="hero-card-stack"
          >
            {heroCards.map((card, index) => {
              const isLast = index === heroCards.length - 1;

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
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 0,
                      pointerEvents: 'none',
                      opacity: 0.6,
                      backgroundColor: `var(--${card.colorToken.replace('$', '')})`,
                    }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span style={{ color: 'white', fontWeight: 'bold' }}>
                      {t(card.name as TranslationKey) || card.name}
                    </span>
                    <span>{card.icon}</span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: '120px', lineHeight: '120px' }}>
                      {card.icon}
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        opacity: 0.7,
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                      }}
                    >
                      {heroCardBrand}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
