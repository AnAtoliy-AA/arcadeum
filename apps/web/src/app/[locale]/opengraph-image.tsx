import { ImageResponse } from 'next/og';
import { appConfig } from '@/shared/config/app-config';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
} from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = appConfig.appName;

export const dynamic = 'force-static';
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

const PALETTE: Record<Locale, { accent: string; gradient: string }> = {
  en: {
    accent: '#3aa0ff',
    gradient: 'linear-gradient(135deg, #0a1530 0%, #0e2950 45%, #1a3d6e 100%)',
  },
  es: {
    accent: '#ffb547',
    gradient: 'linear-gradient(135deg, #2a0e1e 0%, #441832 45%, #6e2a4a 100%)',
  },
  fr: {
    accent: '#7d9bff',
    gradient: 'linear-gradient(135deg, #0d1138 0%, #1a205c 45%, #2c3590 100%)',
  },
  ru: {
    accent: '#ff7d5c',
    gradient: 'linear-gradient(135deg, #1f0d2a 0%, #371547 45%, #5a2270 100%)',
  },
  by: {
    accent: '#43d9a6',
    gradient: 'linear-gradient(135deg, #0a2a1e 0%, #11402e 45%, #1a5e44 100%)',
  },
};

const GAME_ICONS = [
  { emoji: '♟', x: 780, y: 60, size: 48, rotate: -8 },
  { emoji: '🎮', x: 900, y: 140, size: 40, rotate: 5 },
  { emoji: '🃏', x: 820, y: 260, size: 44, rotate: -12 },
  { emoji: '🎲', x: 960, y: 320, size: 38, rotate: 10 },
  { emoji: '🎯', x: 860, y: 420, size: 42, rotate: -6 },
];

export default async function OpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const seo = messages.seo?.home;

  const title = seo?.title ?? appConfig.seoTitle;
  const description = seo?.description ?? appConfig.seoDescription;
  const palette = PALETTE[locale];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundImage: palette.gradient,
          padding: '72px 88px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Main glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 80% 25%, ${palette.accent}28 0%, transparent 55%)`,
          }}
        />

        {/* Secondary glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            left: -100,
            bottom: -100,
            width: 360,
            height: 360,
            borderRadius: 180,
            background: `radial-gradient(circle, ${palette.accent}15 0%, transparent 60%)`,
          }}
        />

        {/* Decorative grid dots */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 70,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            opacity: 0.08,
          }}
        >
          {Array.from({ length: 7 }).map((_, row) => (
            <div key={row} style={{ display: 'flex', gap: 24 }}>
              {Array.from({ length: 7 }).map((_, col) => (
                <div
                  key={col}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: 'white',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Floating game icons */}
        {GAME_ICONS.map((icon, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: icon.x,
              top: icon.y,
              fontSize: icon.size,
              opacity: 0.12,
              transform: `rotate(${icon.rotate}deg)`,
            }}
          >
            {icon.emoji}
          </div>
        ))}

        {/* Locale chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 36,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 2,
              color: palette.accent,
            }}
          >
            {locale.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: 1.4,
            }}
          >
            {appConfig.appName.toUpperCase()}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            lineHeight: 1.06,
            fontWeight: 900,
            letterSpacing: -1.5,
            marginBottom: 28,
            maxWidth: 700,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            lineHeight: 1.35,
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: 680,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {description}
        </div>

        {/* Domain bar */}
        <div
          style={{
            position: 'absolute',
            left: 88,
            bottom: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 28,
            fontWeight: 700,
            color: palette.accent,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: palette.accent,
              boxShadow: `0 0 18px ${palette.accent}`,
            }}
          />
          arcadeum.games
        </div>

        {/* Accent line at bottom */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${palette.accent}44 30%, ${palette.accent}88 50%, ${palette.accent}44 70%, transparent 100%)`,
          }}
        />
      </div>
    ),
    size,
  );
}
