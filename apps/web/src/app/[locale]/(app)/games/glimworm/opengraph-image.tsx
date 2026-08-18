import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Glimworm — free online glow-worm snake arena on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

const WORMS = [
  {
    dots: [
      { x: 40, y: 60 },
      { x: 70, y: 45 },
      { x: 105, y: 50 },
      { x: 135, y: 70 },
      { x: 160, y: 95 },
    ],
    color: '#3ddc97',
    size: 18,
  },
  {
    dots: [
      { x: 60, y: 140 },
      { x: 95, y: 125 },
      { x: 130, y: 130 },
      { x: 160, y: 150 },
    ],
    color: '#00e5ff',
    size: 14,
  },
  {
    dots: [
      { x: 30, y: 210 },
      { x: 65, y: 195 },
      { x: 100, y: 200 },
      { x: 130, y: 220 },
      { x: 155, y: 240 },
    ],
    color: '#ff6bff',
    size: 16,
  },
  {
    dots: [
      { x: 80, y: 280 },
      { x: 115, y: 265 },
      { x: 150, y: 270 },
    ],
    color: '#ffe040',
    size: 12,
  },
];

function GlimwormVisual() {
  return (
    <div
      style={{
        position: 'relative',
        width: 380,
        height: 380,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 200,
          background:
            'radial-gradient(circle, rgba(61, 220, 151, 0.12) 0%, transparent 70%)',
        }}
      />

      {WORMS.map((worm, wi) => (
        <div key={wi} style={{ position: 'absolute', inset: 0 }}>
          {worm.dots.map((dot, di) => (
            <div
              key={di}
              style={{
                position: 'absolute',
                left: dot.x - worm.size / 2,
                top: dot.y - worm.size / 2,
                width: worm.size,
                height: worm.size,
                borderRadius: worm.size / 2,
                background: worm.color,
                boxShadow: `0 0 ${worm.size}px ${worm.color}88, 0 0 ${worm.size * 2}px ${worm.color}44`,
              }}
            />
          ))}
          {/* Connecting lines between dots */}
          {worm.dots.slice(0, -1).map((dot, di) => {
            const next = worm.dots[di + 1];
            const dx = next.x - dot.x;
            const dy = next.y - dot.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <div
                key={`line-${di}`}
                style={{
                  position: 'absolute',
                  left: dot.x,
                  top: dot.y - worm.size / 4,
                  width: len,
                  height: worm.size / 2,
                  background: `linear-gradient(90deg, ${worm.color}66, ${worm.color}22)`,
                  borderRadius: worm.size / 4,
                  transformOrigin: '0 50%',
                  transform: `rotate(${angle}deg)`,
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Scattered light particles */}
      {[
        { x: 200, y: 50, s: 6, c: '#3ddc97' },
        { x: 280, y: 120, s: 4, c: '#00e5ff' },
        { x: 320, y: 200, s: 5, c: '#ff6bff' },
        { x: 180, y: 300, s: 4, c: '#ffe040' },
        { x: 300, y: 300, s: 3, c: '#3ddc97' },
      ].map((p, i) => (
        <div
          key={`p-${i}`}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            borderRadius: p.s / 2,
            background: p.c,
            boxShadow: `0 0 ${p.s * 2}px ${p.c}88`,
          }}
        />
      ))}
    </div>
  );
}

export default async function GlimwormOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.glimworm_v1?.landing;

  return renderOgCard({
    kicker: landing?.hero?.eyebrow ?? 'Free · 2–10 players · No signup',
    title: 'Glimworm',
    subtitle:
      landing?.hero?.tagline ??
      'Free online glow-worm arena — slither, survive, eat the lights',
    accent: '#3ddc97',
    gradient: ['#0c1a18', '#020807'],
    children: <GlimwormVisual />,
  });
}
