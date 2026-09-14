import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function AchievementOgImage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const name = searchParams.name ?? 'Achievement';
  const rarity = searchParams.rarity ?? 'common';
  const game = searchParams.game ?? '';
  const accent = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: 1200,
        height: 630,
        backgroundImage:
          'linear-gradient(135deg, #070b14 0%, #030712 50%, #0f172a 100%)',
        padding: '52px 64px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Dot grid background */}
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

      {/* Accent glow top-right */}
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

      {/* Border */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
        }}
      />

      {/* Corner accents */}
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

      {/* Left content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 680,
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
              ACHIEVEMENT UNLOCKED
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span
            style={{
              fontSize: name.length > 16 ? 52 : 64,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {name}
          </span>

          {game ? (
            <span
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              {game}
            </span>
          ) : null}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: `${accent}20`,
                border: `1px solid ${accent}50`,
                fontSize: 14,
                fontWeight: 700,
                color: accent,
                textTransform: 'uppercase',
              }}
            >
              {rarity}
            </span>
          </div>
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                RARITY
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: accent }}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </span>
            </div>
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

      {/* Right: trophy visual */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 400,
          height: 400,
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
          <span style={{ fontSize: 160 }}>🏆</span>
        </div>
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
