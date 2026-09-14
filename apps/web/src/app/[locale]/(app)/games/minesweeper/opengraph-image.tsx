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
  'Minesweeper — free online retro logic mine puzzle on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function MinesweeperVisual() {
  const grid = [
    ['1', '1', '2', '🚩'],
    [' ', ' ', '2', '💣'],
    [' ', ' ', '1', '1'],
    ['1', '1', ' ', ' '],
  ];

  const colors: Record<string, string> = {
    '1': '#3b82f6',
    '2': '#10b981',
    '3': '#ef4444',
  };

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
          background: '#1e293b',
          border: '3px solid #38bdf8',
          padding: 11,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}
      >
        {grid.flat().map((c, i) => (
          <div
            key={i}
            style={{
              width: 68.5,
              height: 68.5,
              borderRadius: 8,
              background:
                c === ' ' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 900,
              color: colors[c] ?? '#ffffff',
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function MinesweeperOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const game = messages.games?.minesweeper_v1;
  const gameName = game?.name ?? 'Minesweeper';

  return renderGameOgCard({
    kicker: 'Retro Logic · 1 Player',
    title: gameName,
    subtitle:
      game?.description ??
      'Classic minefield clearing with flagged tiles, chord opening, and custom difficulty.',
    accent: '#38bdf8',
    gradient: ['#082f49', '#021522'],
    badges: [
      'First Click Safe',
      'Chording Support',
      'Flag Counter',
      'Custom Grids',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Minefield Puzzle' },
      { label: 'Safety', value: 'Safe First Click' },
      { label: 'Control', value: 'Flag & Chord' },
    ],
    visual: <MinesweeperVisual />,
  });
}
