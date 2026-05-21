import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

interface RenderOpts {
  kicker: string;
  title: string;
  /**
   * Short subtitle. Wraps onto multiple lines naturally; keep it
   * around 100 characters so it doesn't overflow at 1200×630.
   */
  subtitle?: string;
  /** Optional small footer (e.g. reading time + date). */
  footer?: string;
  /**
   * Accent color used for the kicker, the corner ribbon, and the
   * background-glow flourish. Pass a CSS hex (e.g. `#ff6b6b`).
   */
  accent: string;
  /**
   * Optional background gradient pair (start → end). When omitted a
   * neutral dark gradient is used.
   */
  gradient?: [string, string];
  /** Right-edge brand text. Defaults to `arcadeum.games`. */
  brand?: string;
}

/**
 * Generic Open Graph card renderer. Used by per-post and per-landing
 * `opengraph-image.tsx` files so every social unfurl gets a unique
 * branded 1200×630 card instead of the generic `/logo.png` fallback.
 *
 * The layout is intentionally minimal — title + kicker + accent — so
 * it survives Satori's CSS subset (no transforms, no `background:
 * shorthand` with image-mixed gradients, no `text-overflow`).
 */
export function renderOgCard(opts: RenderOpts): ImageResponse {
  const [from, to] = opts.gradient ?? ['#0f1729', '#03091a'];
  const brand = opts.brand ?? 'arcadeum.games';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
          padding: '64px 80px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          justifyContent: 'space-between',
        }}
      >
        {/* Accent glow in the top-right corner */}
        <div
          style={{
            position: 'absolute',
            right: -160,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 260,
            background: `radial-gradient(circle, ${opts.accent}40 0%, transparent 60%)`,
          }}
        />

        {/* Header — kicker chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            letterSpacing: 6,
            color: opts.accent,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {opts.kicker}
        </div>

        {/* Body — title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 980,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: opts.title.length > 56 ? 64 : 88,
              lineHeight: 1.05,
              fontWeight: 900,
              color: 'white',
              letterSpacing: -2,
            }}
          >
            {opts.title}
          </div>
          {opts.subtitle ? (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                color: '#b6cee6',
                lineHeight: 1.35,
                marginTop: 24,
                maxWidth: 880,
              }}
            >
              {opts.subtitle}
            </div>
          ) : null}
        </div>

        {/* Footer — accent dot + brand + optional meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: opts.accent,
                boxShadow: `0 0 16px ${opts.accent}cc`,
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                fontWeight: 700,
                color: '#ffe866',
              }}
            >
              {brand}
            </div>
          </div>
          {opts.footer ? (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: '#9ab3cf',
                fontWeight: 500,
              }}
            >
              {opts.footer}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
