import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

interface RenderOpts {
  kicker: string;
  title: string;
  subtitle?: string;
  footer?: string;
  accent: string;
  gradient?: [string, string];
  brand?: string;
  /** Optional decorative elements rendered in the right half. */
  children?: React.ReactNode;
}

export function renderOgCard(opts: RenderOpts): ImageResponse {
  const [from, to] = opts.gradient ?? ['#0a0f1d', '#05070f'];
  const brand = opts.brand ?? 'arcadeum.games';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
          padding: '64px 80px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Futuristic Cyber Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.8,
          }}
        />

        {/* Diagonal Tech Lines */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'linear-gradient(135deg, transparent 49.5%, rgba(255, 255, 255, 0.015) 50%, transparent 50.5%)',
            backgroundSize: '120px 120px',
          }}
        />

        {/* Ambient Glow Orb - Top Right */}
        <div
          style={{
            position: 'absolute',
            right: -150,
            top: -150,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${opts.accent}25 0%, ${opts.accent}05 50%, transparent 70%)`,
            filter: 'blur(40px)',
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
            background: `radial-gradient(circle, ${opts.accent}15 0%, ${opts.accent}02 50%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        {/* Cyber Border Frame */}
        <div
          style={{
            position: 'absolute',
            inset: 24,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 24,
            pointerEvents: 'none',
          }}
        />

        {/* Glowing Corner Accents */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            width: 16,
            height: 16,
            borderTop: `2px solid ${opts.accent}`,
            borderLeft: `2px solid ${opts.accent}`,
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
            borderBottom: `2px solid ${opts.accent}`,
            borderRight: `2px solid ${opts.accent}`,
            borderBottomRightRadius: 8,
          }}
        />

        {/* Left Column - Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Brand & Kicker Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: opts.accent,
                  boxShadow: `0 0 12px ${opts.accent}`,
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: 2,
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                }}
              >
                Arcadeum
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 99,
                alignSelf: 'flex-start',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: opts.accent,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                {opts.kicker}
              </span>
            </div>
          </div>

          {/* Title & Subtitle Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              margin: '24px 0',
            }}
          >
            <span
              style={{
                fontSize: opts.title.length > 20 ? 56 : 72,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: -2,
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {opts.title}
            </span>

            {opts.subtitle && (
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: 'rgba(255, 255, 255, 0.65)',
                  maxWidth: 520,
                }}
              >
                {opts.subtitle}
              </span>
            )}
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: 1,
                }}
              >
                {brand}
              </span>
            </div>

            {opts.footer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                  }}
                />
                <span
                  style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 500,
                  }}
                >
                  {opts.footer}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Decorative Visualization */}
        {opts.children ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 460,
              height: '100%',
              position: 'relative',
            }}
          >
            {/* Glassmorphic visualization container card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '80%',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 24,
                boxShadow:
                  '0 24px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {opts.children}
            </div>
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE },
  );
}
