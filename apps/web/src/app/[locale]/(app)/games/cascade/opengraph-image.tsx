import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  'Cascade — multiplayer shedding card game with stacking penalty chains on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

const FAN = [
  { color: '#dc2626', label: '7', rotate: -22, dx: -130, dy: 15 },
  { color: '#fbbf24', label: '+2', rotate: -8, dx: -45, dy: -8 },
  { color: '#3b82f6', label: '↻', rotate: 6, dx: 45, dy: -5 },
  { color: '#10b981', label: '★', rotate: 20, dx: 135, dy: 12 },
];

function CascadeVisual() {
  return (
    <div
      style={{
        position: 'relative',
        width: 380,
        height: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {FAN.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(50% + ${c.dx}px - 60px)`,
            top: `calc(50% + ${c.dy}px - 90px)`,
            width: 120,
            height: 180,
            background: `linear-gradient(145deg, ${c.color} 0%, ${c.color}cc 100%)`,
            borderRadius: 18,
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: `0 14px 40px rgba(0,0,0,0.6), 0 0 20px ${c.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            fontWeight: 900,
            color: 'white',
            transform: `rotate(${c.rotate}deg)`,
          }}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}

export default async function CascadeOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.cascade_v1?.landing;
  const gameName = messages.games?.cascade_v1?.name ?? 'Cascade';

  return renderGameOgCard({
    kicker: 'Card Party Game · 2–10 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Match colors, stack action cards, and trigger penalty chains to empty your hand.',
    accent: '#6366f1',
    gradient: ['#1e1b4b', '#090726'],
    badges: [
      '2–10 Players',
      'Stacking Penalties',
      'Action Cards',
      'Custom Themes',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Card Shedding' },
      { label: 'Capacity', value: 'Up to 10P' },
      { label: 'Pace', value: 'Fast & Chaos' },
    ],
    visual: <CascadeVisual />,
  });
}
