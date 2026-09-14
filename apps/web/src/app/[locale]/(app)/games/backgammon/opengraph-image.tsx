import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Backgammon — free multiplayer board game on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function BackgammonVisual() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: '#ffffff',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 900,
            color: '#7e22ce',
          }}
        >
          ⚅
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: '#ffffff',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 900,
            color: '#7e22ce',
          }}
        >
          ⚅
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 360,
          height: 240,
          borderRadius: 16,
          background: '#2e1065',
          border: '2px solid rgba(168, 85, 247, 0.5)',
          padding: 12,
          justifyContent: 'space-between',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={`top-${i}`}
              style={{
                width: 0,
                height: 0,
                borderLeft: '18px solid transparent',
                borderRight: '18px solid transparent',
                borderTop: `80px solid ${i % 2 === 0 ? '#9333ea' : '#4c1d95'}`,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#9333ea',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={`bot-${i}`}
              style={{
                width: 0,
                height: 0,
                borderLeft: '18px solid transparent',
                borderRight: '18px solid transparent',
                borderBottom: `80px solid ${i % 2 === 0 ? '#4c1d95' : '#9333ea'}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function BackgammonOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.backgammon_v1?.landing;
  const gameName = messages.games?.backgammon_v1?.name ?? 'Backgammon';

  return renderGameOgCard({
    kicker: 'Classic Board Game · 2 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Classic 24-point board game with dice rolls, bearing off, and AI bot opponents.',
    accent: '#a855f7',
    gradient: ['#1e0b36', '#0e051a'],
    badges: [
      '24-Point Board',
      'Dice Rolling',
      'Bearing Off',
      'AI Bots',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Dice Strategy' },
      { label: 'Players', value: '2 Players' },
      { label: 'Play Mode', value: 'PvP & Bot' },
    ],
    visual: <BackgammonVisual />,
  });
}
