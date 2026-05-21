import { ImageResponse } from 'next/og';

import { appConfig } from '@/shared/config/app-config';

/**
 * Shared `opengraph-image.tsx` template. Each OG image route imports
 * `renderOgImage` and passes a heading + optional kicker; the layout,
 * brand colors, and logo stay consistent so every social preview looks
 * recognizably "Arcadeum".
 *
 * Constraints:
 * - 1200×630 (Twitter/Facebook spec).
 * - No external fonts — the runtime falls back to a system sans-serif,
 *   which keeps generation fast (~50ms) and avoids font-fetch flakiness.
 */

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

export type OgImageInput = {
  /** Main page label, e.g. "Games" or the game's name. */
  heading: string;
  /** Optional small label above the heading, e.g. "Tournaments". */
  kicker?: string;
  /** Optional description sentence below the heading. */
  description?: string;
};

export function renderOgImage(input: OgImageInput): ImageResponse {
  const { heading, kicker, description } = input;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background:
            'linear-gradient(135deg, #0b1020 0%, #151738 45%, #2a1247 100%)',
          color: '#ecefee',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}
            >
              {appConfig.appName}
            </span>
            <span style={{ fontSize: 16, opacity: 0.6 }}>
              {appConfig.siteUrl.replace(/^https?:\/\//, '')}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 1000,
          }}
        >
          {kicker ? (
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 3,
                color: '#a78bfa',
              }}
            >
              {kicker}
            </span>
          ) : null}
          <span
            style={{
              fontSize: heading.length > 28 ? 80 : 104,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {heading}
          </span>
          {description ? (
            <span style={{ fontSize: 28, opacity: 0.78, lineHeight: 1.3 }}>
              {description}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 18,
            opacity: 0.6,
          }}
        >
          <span>Play board games online with friends.</span>
          <span>arcadeum.games</span>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
