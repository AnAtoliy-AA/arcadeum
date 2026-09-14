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
  'Spades — free multiplayer card partnership game on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function SpadesVisual() {
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
          color: 'rgba(56, 189, 248, 0.15)',
        }}
      >
        ♠
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
          transform: 'rotate(-10deg)',
          color: '#0284c7',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, color: '#0284c7' }}>
          K♠
        </span>
        <span style={{ fontSize: 64, color: '#0284c7' }}>♠</span>
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
          boxShadow: '0 20px 45px rgba(56, 189, 248, 0.4)',
          border: '2px solid rgba(56, 189, 248, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(12deg)',
          color: '#0f172a',
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
          A♠
        </span>
        <span style={{ fontSize: 64, color: '#0f172a' }}>♠</span>
      </div>
    </div>
  );
}

export default async function SpadesOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.spades_v1?.landing;
  const gameName = messages.games?.spades_v1?.name ?? 'Spades';

  return renderGameOgCard({
    kicker: 'Partnership Card Game · 4 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Classic 4-player partnership game with bidding, trump spade suit, and nil bids.',
    accent: '#38bdf8',
    gradient: ['#082f49', '#021622'],
    badges: [
      'Partnership 2v2',
      'Blind Nil & Nil',
      'Bag Penalties',
      'AI Bots',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Partnership 2v2' },
      { label: 'Trump', value: 'Spades Fixed' },
      { label: 'Match Target', value: '500 Points' },
    ],
    visual: <SpadesVisual />,
  });
}
