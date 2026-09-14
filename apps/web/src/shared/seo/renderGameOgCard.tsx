import { ImageResponse } from 'next/og';
import type { ReactNode } from 'react';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export interface GameOgCardOpts {
  kicker: string;
  title: string;
  subtitle?: string;
  accent: string;
  gradient?: [string, string];
  badges?: string[];
  stats?: Array<{ label: string; value: string }>;
  visual: ReactNode;
}

export function renderGameOgCard(opts: GameOgCardOpts): ImageResponse {
  const [from, to] = opts.gradient ?? ['#070b14', '#0f172a'];
  const accent = opts.accent;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: 1200,
        height: 630,
        backgroundImage: `linear-gradient(135deg, ${from} 0%, #030712 50%, ${to} 100%)`,
        padding: '52px 64px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.85,
        }}
      />

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: -80,
          top: -80,
          width: 560,
          height: 560,
          borderRadius: 280,
          background: `radial-gradient(circle, ${accent}30 0%, ${accent}08 45%, transparent 70%)`,
          filter: 'blur(45px)',
        }}
      />

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          left: -100,
          bottom: -100,
          width: 500,
          height: 500,
          borderRadius: 250,
          background: `radial-gradient(circle, ${accent}22 0%, ${accent}05 45%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
        }}
      />

      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 20,
          left: 20,
          width: 20,
          height: 20,
          borderTop: `3px solid ${accent}`,
          borderLeft: `3px solid ${accent}`,
          borderTopLeftRadius: 10,
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${accent}`,
          borderRight: `3px solid ${accent}`,
          borderBottomRightRadius: 10,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 560,
          height: '100%',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 14px ${accent}`,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '3px',
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
              }}
            >
              ARCADEUM GAMES
            </span>
            <span
              style={{
                display: 'flex',
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: 12,
                fontWeight: 700,
                color: accent,
                letterSpacing: '1px',
              }}
            >
              ONLINE 2P
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: 8,
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: accent,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {opts.kicker}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span
            style={{
              fontSize: opts.title.length > 14 ? 64 : 76,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {opts.title}
          </span>

          {opts.subtitle ? (
            <span
              style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.35,
                color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: 520,
              }}
            >
              {opts.subtitle}
            </span>
          ) : null}

          {opts.badges && opts.badges.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 4,
              }}
            >
              {opts.badges.map((b) => (
                <span
                  key={b}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {opts.stats?.map((stat) => (
              <div
                key={stat.label}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <span
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 700,
                    letterSpacing: '1px',
                  }}
                >
                  {stat.label}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: accent }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '1.5px',
            }}
          >
            arcadeum.games
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 480,
          height: 480,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 28,
            boxShadow: `0 24px 70px rgba(0, 0, 0, 0.6), 0 0 40px ${accent}15`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {opts.visual}
        </div>
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
