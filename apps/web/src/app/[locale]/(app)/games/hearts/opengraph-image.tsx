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
  'Hearts — free multiplayer trick-taking card game on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function HeartsVisual() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 20,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          fontSize: 160,
          color: 'rgba(244, 63, 94, 0.15)',
        }}
      >
        ♥
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 80,
          width: 140,
          height: 200,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-12deg)',
          color: '#18181b',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, color: '#18181b' }}>
          Q♠
        </span>
        <span style={{ fontSize: 64, color: '#18181b' }}>♠</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 100,
          width: 140,
          height: 200,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow: '0 20px 45px rgba(244, 63, 94, 0.4)',
          border: '2px solid rgba(244, 63, 94, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(10deg)',
          color: '#e11d48',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, color: '#e11d48' }}>
          A♥
        </span>
        <span style={{ fontSize: 64, color: '#e11d48' }}>♥</span>
      </div>
    </div>
  );
}

export default async function HeartsOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.hearts_v1?.landing;
  const gameName = messages.games?.hearts_v1?.name ?? 'Hearts';

  return renderGameOgCard({
    kicker: 'Trick-Taking · 4 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Classic 4-player trick-taking game with card passing, the Queen of Spades, and shooting the moon.',
    accent: '#f43f5e',
    gradient: ['#2e0915', '#120207'],
    badges: [
      '4 Players',
      'Shoot the Moon',
      'Queen of Spades',
      'Smart AI Bots',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Trick-Taking' },
      { label: 'Rounds', value: '100-Point Target' },
      { label: 'Bot AI', value: 'Heuristic Bots' },
    ],
    visual: <HeartsVisual />,
  });
}
