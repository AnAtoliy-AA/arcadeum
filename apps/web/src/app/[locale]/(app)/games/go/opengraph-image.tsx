import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
} from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  'Go (Weiqi / Baduk) — free online board game on Arcadeum Games';

export const dynamic = 'force-static';
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function GoVisual() {
  const stones = [
    { r: 2, c: 2, color: 'black' },
    { r: 2, c: 6, color: 'white' },
    { r: 6, c: 2, color: 'white' },
    { r: 6, c: 6, color: 'black' },
    { r: 4, c: 4, color: 'black' },
    { r: 3, c: 4, color: 'white' },
    { r: 4, c: 3, color: 'black' },
    { r: 5, c: 4, color: 'black' },
    { r: 4, c: 5, color: 'white' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 340,
          height: 340,
          background: '#d97706',
          borderRadius: 14,
          border: '2px solid rgba(245, 158, 11, 0.6)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          display: 'flex',
          flexWrap: 'wrap',
          position: 'relative',
          padding: 16,
        }}
      >
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              width: 38.5,
              height: 38.5,
              borderRight: '1px solid rgba(0,0,0,0.3)',
              borderBottom: '1px solid rgba(0,0,0,0.3)',
            }}
          />
        ))}

        {stones.map((s, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              position: 'absolute',
              left: 16 + s.c * 38.5 - 16,
              top: 16 + s.r * 38.5 - 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background:
                s.color === 'black'
                  ? 'radial-gradient(circle at 35% 35%, #52525b 0%, #18181b 100%)'
                  : 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e4e4e7 100%)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default async function GoOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.go_v1?.landing;
  const gameName = messages.games?.go_v1?.name ?? 'Go';

  return renderGameOgCard({
    kicker: 'Ancient Strategy · 2 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Play Go (Weiqi / Baduk) online with 9×9, 13×13, and 19×19 boards, territory scoring, and AI.',
    accent: '#f59e0b',
    gradient: ['#241405', '#0f0802'],
    badges: [
      '9×9, 13×13, 19×19',
      'Territory Scoring',
      'Komi & Handicaps',
      'AI Bots',
      '100% Free',
    ],
    stats: [
      { label: 'Boards', value: '19×19 / 13×13' },
      { label: 'Tradition', value: '4000+ Years' },
      { label: 'Opponents', value: 'PvP & Bot' },
    ],
    visual: <GoVisual />,
  });
}
