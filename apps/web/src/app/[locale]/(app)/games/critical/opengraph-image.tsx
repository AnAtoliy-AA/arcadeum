import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Critical — free exploding card game online on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

const CARDS = [
  { x: 120, y: 40, rotate: -12, color: '#ff6b6b', label: '💣' },
  { x: 200, y: 80, rotate: 5, color: '#ff9f43', label: '+4' },
  { x: 100, y: 160, rotate: -3, color: '#ee5a24', label: 'Skip' },
  { x: 220, y: 180, rotate: 10, color: '#ff6b6b', label: 'Draw 2' },
];

function CriticalVisual() {
  return (
    <div
      style={{
        position: 'relative',
        width: 380,
        height: 380,
      }}
    >
      {/* Explosion glow center */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 100,
          width: 180,
          height: 180,
          borderRadius: 90,
          background:
            'radial-gradient(circle, rgba(255, 107, 107, 0.35) 0%, transparent 70%)',
        }}
      />

      {/* Explosion rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30 * (Math.PI / 180);
        const innerR = 60;
        const outerR = 140 + (i % 3) * 20;
        return (
          <div
            key={`ray-${i}`}
            style={{
              position: 'absolute',
              left: 190 + Math.cos(angle) * innerR - 2,
              top: 190 + Math.sin(angle) * innerR - 1,
              width: 4,
              height: outerR - innerR,
              background: `linear-gradient(180deg, ${i % 2 === 0 ? '#ff6b6b' : '#ff9f43'}88, transparent)`,
              borderRadius: 2,
              transformOrigin: '50% 0%',
              transform: `rotate(${i * 30 + 90}deg)`,
            }}
          />
        );
      })}

      {/* Scattered particles */}
      {[
        { x: 60, y: 30, s: 8, c: '#ff6b6b' },
        { x: 300, y: 60, s: 6, c: '#ff9f43' },
        { x: 40, y: 280, s: 7, c: '#ee5a24' },
        { x: 320, y: 300, s: 5, c: '#ff6b6b' },
        { x: 190, y: 20, s: 4, c: '#ffe040' },
        { x: 350, y: 180, s: 6, c: '#ff9f43' },
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

      {/* Cards fanning out */}
      {CARDS.map((card, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: card.x,
            top: card.y,
            width: 100,
            height: 150,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)`,
            border: '3px solid rgba(255,255,255,0.25)',
            boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${card.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 900,
            color: 'white',
            transform: `rotate(${card.rotate}deg)`,
          }}
        >
          {card.label}
        </div>
      ))}
    </div>
  );
}

export default async function CriticalOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.critical_v1?.landing;

  return renderOgCard({
    kicker: landing?.hero?.eyebrow ?? 'Free · 2–5 players · No signup',
    title: 'Critical',
    subtitle:
      landing?.hero?.tagline ??
      'A free online card game of bluff, theft, and explosive luck',
    accent: '#ff6b6b',
    gradient: ['#1a0f1f', '#0a0612'],
    children: <CriticalVisual />,
  });
}
