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

const PALETTE: Record<Locale, { accent: string; gradient: [string, string] }> =
  {
    en: {
      accent: '#3aa0ff',
      gradient: ['#040a1b', '#0d1a3a'],
    },
    es: {
      accent: '#ffb547',
      gradient: ['#140710', '#300e23'],
    },
    fr: {
      accent: '#7d9bff',
      gradient: ['#03051c', '#0f1442'],
    },
    ru: {
      accent: '#ff7d5c',
      gradient: ['#100716', '#260f33'],
    },
    by: {
      accent: '#43d9a6',
      gradient: ['#03140f', '#0a3023'],
    },
  };

export default async function OpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const seo = messages.seo?.home;

  const title = seo?.title ?? appConfig.seoTitle;
  const description = seo?.description ?? appConfig.seoDescription;
  const badge = (seo as { badge?: string })?.badge ?? 'Play with Friends or AI';
  const palette = PALETTE[locale];

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundImage: `linear-gradient(145deg, ${palette.gradient[0]} 0%, ${palette.gradient[1]} 100%)`,
        padding: '64px 80px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Ambient Glow Orb - Top Right */}
      <div
        style={{
          position: 'absolute',
          right: -150,
          top: -150,
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accent}22 0%, ${palette.accent}05 50%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* Ambient Glow Orb - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          left: -150,
          bottom: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accent}12 0%, ${palette.accent}02 50%, transparent 70%)`,
          filter: 'blur(35px)',
        }}
      />

      {/* Futuristic Cyber Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
        }}
      />

      {/* Outer border frame */}
      <div
        style={{
          position: 'absolute',
          inset: 24,
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: 24,
          pointerEvents: 'none',
        }}
      />

      {/* Corner Accents */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: 16,
          height: 16,
          borderTop: `2px solid ${palette.accent}`,
          borderLeft: `2px solid ${palette.accent}`,
          borderTopLeftRadius: 8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 16,
          height: 16,
          borderBottom: `2px solid ${palette.accent}`,
          borderRight: `2px solid ${palette.accent}`,
          borderBottomRightRadius: 8,
        }}
      />

      {/* Left Column - Marketing copy */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          height: '100%',
          maxWidth: 580,
          position: 'relative',
        }}
      >
        {/* Header Tag / Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: palette.accent,
                boxShadow: `0 0 12px ${palette.accent}`,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '3px',
                color: palette.accent,
                textTransform: 'uppercase',
              }}
            >
              {appConfig.appName}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 99,
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              {locale.toUpperCase()} · {badge}
            </span>
          </div>
        </div>

        {/* Core Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            margin: '20px 0',
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-2px',
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </span>

          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              lineHeight: 1.45,
              color: 'rgba(255, 255, 255, 0.65)',
            }}
          >
            {description}
          </span>
        </div>

        {/* Footer branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: palette.accent,
              boxShadow: `0 0 14px ${palette.accent}aa`,
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '1px',
            }}
          >
            arcadeum.games
          </span>
        </div>
      </div>

      {/* Right Column - Glassmorphic Lobby Mockup */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 440,
          height: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 24,
            boxShadow:
              '0 24px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            padding: 24,
            gap: 16,
          }}
        >
          {/* Lobby Title Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '1.5px',
              }}
            >
              LIVE MATCHMAKING
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px #10b981',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                ONLINE
              </span>
            </div>
          </div>

          {/* Simulated Lobby Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                title: '♟ Chess Arena',
                players: '4,102 active',
                accent: palette.accent,
              },
              {
                title: '🚢 Sea Battle',
                players: '2,891 active',
                accent: '#ffb547',
              },
              {
                title: '🐛 Glimworm Arena',
                players: '1,940 active',
                accent: '#43d9a6',
              },
            ].map((game, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 14,
                }}
              >
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}
                >
                  {game.title}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: game.accent,
                  }}
                >
                  {game.players}
                </span>
              </div>
            ))}
          </div>

          {/* Latency / Stats bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 600,
                }}
              >
                LATENCY
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>
                &lt; 15ms
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 600,
                }}
              >
                REGION
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>
                GLOBAL
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 600,
                }}
              >
                TICKRATE
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: palette.accent,
                }}
              >
                60 Hz
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
