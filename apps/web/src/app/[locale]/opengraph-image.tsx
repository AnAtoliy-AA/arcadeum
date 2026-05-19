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

// Static-render one OG image per locale at build time. Without this, each
// social-card request would re-run ImageResponse on the fly.
export const dynamic = 'force-static';
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: { locale: string };
}

// Locale-specific accent palettes so the unfurl looks visually
// differentiated per language at a glance (without forking the layout).
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

export default async function OpengraphImage({ params }: Props) {
  const locale: Locale = isLocale(params.locale)
    ? params.locale
    : DEFAULT_LOCALE;
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
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundImage: palette.gradient,
          padding: '72px 88px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle accent glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 80% 20%, ${palette.accent}33 0%, transparent 55%)`,
          }}
        />

        {/* Locale chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 36,
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
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
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
              color: 'rgba(255, 255, 255, 0.92)',
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
            maxWidth: 1000,
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
            color: 'rgba(255, 255, 255, 0.78)',
            maxWidth: 950,
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
      </div>
    ),
    size,
  );
}
