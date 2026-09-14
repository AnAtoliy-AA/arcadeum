import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = '2048 — free online sliding tile puzzle on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function Grid2048Visual() {
  const tiles = [
    { v: 1024, bg: '#edc53f', c: '#ffffff' },
    { v: 512, bg: '#edc850', c: '#ffffff' },
    { v: 256, bg: '#edcc61', c: '#ffffff' },
    { v: 128, bg: '#edcf72', c: '#ffffff' },
    { v: 64, bg: '#f65e3b', c: '#ffffff' },
    { v: 2048, bg: '#ecc400', c: '#ffffff', glow: true },
    { v: 32, bg: '#f67c5f', c: '#ffffff' },
    { v: 16, bg: '#f59563', c: '#ffffff' },
    { v: 8, bg: '#f2b179', c: '#ffffff' },
    { v: 4, bg: '#ede0c8', c: '#776e65' },
    { v: 2, bg: '#eee4da', c: '#776e65' },
    { v: '', bg: 'rgba(238, 228, 218, 0.2)', c: '' },
    { v: '', bg: 'rgba(238, 228, 218, 0.2)', c: '' },
    { v: 4, bg: '#ede0c8', c: '#776e65' },
    { v: 2, bg: '#eee4da', c: '#776e65' },
    { v: 2, bg: '#eee4da', c: '#776e65' },
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
          width: 320,
          height: 320,
          borderRadius: 16,
          background: '#bbada0',
          padding: 11,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}
      >
        {tiles.map((t, idx) => (
          <div
            key={idx}
            style={{
              width: 68.5,
              height: 68.5,
              borderRadius: 8,
              background: t.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: t.v === 2048 ? 22 : 20,
              fontWeight: 900,
              color: t.c,
              boxShadow: t.glow ? '0 0 20px rgba(236, 196, 0, 0.8)' : 'none',
            }}
          >
            {t.v}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Game2048OpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const game = messages.games?.game_2048_v1;
  const gameName = game?.name ?? '2048';

  return renderGameOgCard({
    kicker: 'Sliding Tile Puzzle · 1 Player',
    title: gameName,
    subtitle:
      game?.description ??
      'Slide number tiles, combine matching pairs, and aim for the elusive 2048 tile and beyond.',
    accent: '#f59e0b',
    gradient: ['#2e1f05', '#120c02'],
    badges: [
      'Classic 4×4',
      'Undo Support',
      'Endless Mode',
      'High Score Save',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Number Puzzle' },
      { label: 'Goal', value: '2048 Tile' },
      { label: 'Grid', value: '4×4 Matrix' },
    ],
    visual: <Grid2048Visual />,
  });
}
