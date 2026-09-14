import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Cat Dash — multiplayer cat racing party game on Arcadeum';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function CatDashVisual() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 24,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 140,
          height: 140,
          borderRadius: 70,
          background: 'radial-gradient(circle, #a855f7 0%, #6b21a8 100%)',
          boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)',
          fontSize: 72,
          marginBottom: 20,
        }}
      >
        🐱
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
        }}
      >
        {['🐾', '⚡', '🏆', '🐾'].map((emoji, idx) => (
          <div
            key={idx}
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CatDashOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.cat_dash_v1?.landing;
  const gameName = messages.games?.cat_dash_v1?.name ?? 'Cat Dash';

  return renderGameOgCard({
    kicker: 'Action Racing · 2–4 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'High-speed multiplayer cat racing with dice rolls, power-ups, and obstacle dashes.',
    accent: '#a855f7',
    gradient: ['#280f48', '#100420'],
    badges: [
      '2–4 Players',
      'Power-Up Items',
      'Obstacle Tracks',
      'AI Bots',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Action Racing' },
      { label: 'Pace', value: 'High Energy' },
      { label: 'Rounds', value: 'Quick Sprints' },
    ],
    visual: <CatDashVisual />,
  });
}
