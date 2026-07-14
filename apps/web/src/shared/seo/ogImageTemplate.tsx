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
  const [from, to] = opts.gradient ?? ['#0f1729', '#03091a'];
  const brand = opts.brand ?? 'arcadeum.games';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
          padding: '64px 80px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Corner glow */}
        <div
          style={{
            position: 'absolute',
            right: -180,
            top: -180,
            width: 560,
            height: 560,
            borderRadius: 280,
            background: `radial-gradient(circle, ${opts.accent}30 0%, transparent 60%)`,
          }}
        />

        {/* Bottom-left subtle glow */}
        <div
          style={{
            position: 'absolute',
            left: -120,
            bottom: -120,
            width: 400,
            height: 400,
            borderRadius: 200,
            background: `radial-gradient(circle, ${opts.accent}18 0%, transparent 55%)`,
          }}
        />

        {/* Decorative grid dots */}
        <div
          style={{
            position: 'absolute',
            right: 60,
            top: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            opacity: 0.12,
          }}
        >
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} style={{ display: 'flex', gap: 28 }}>
              {Array.from({ length: 6 }).map((_, col) => (
                <div
                  key={col}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    background: 'white',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* LEFT — copy column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Kicker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 22,
              letterSpacing: 5,
              color: opts.accent,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: opts.accent,
                boxShadow: `0 0 12px ${opts.accent}cc`,
              }}
            />
            {opts.kicker}
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: opts.title.length > 40 ? 72 : 96,
              lineHeight: 1.02,
              fontWeight: 900,
              color: 'white',
              letterSpacing: -3,
              marginBottom: opts.subtitle ? 24 : 0,
            }}
          >
            {opts.title}
          </div>

          {/* Subtitle */}
          {opts.subtitle ? (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: '#b6cee6',
                lineHeight: 1.4,
                maxWidth: 520,
              }}
            >
              {opts.subtitle}
            </div>
          ) : null}

          {/* Footer bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 48,
              gap: 14,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: opts.accent,
                boxShadow: `0 0 14px ${opts.accent}aa`,
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 700,
                color: '#ffe866',
              }}
            >
              {brand}
            </div>
            {opts.footer ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 20,
                  color: '#7a94b0',
                  fontWeight: 500,
                  marginLeft: 20,
                }}
              >
                {opts.footer}
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT — optional decorative slot */}
        {opts.children ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 440,
              marginLeft: 40,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {opts.children}
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE },
  );
}
