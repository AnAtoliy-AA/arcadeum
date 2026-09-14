import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Sudoku — free online number logic puzzle on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function SudokuVisual() {
  const sample = [
    5,
    3,
    null,
    null,
    7,
    null,
    null,
    null,
    null,
    6,
    null,
    null,
    1,
    9,
    5,
    null,
    null,
    null,
    null,
    9,
    8,
    null,
    null,
    null,
    null,
    6,
    null,
    8,
    null,
    null,
    null,
    6,
    null,
    null,
    null,
    3,
    4,
    null,
    null,
    8,
    null,
    3,
    null,
    null,
    1,
    7,
    null,
    null,
    null,
    2,
    null,
    null,
    null,
    6,
    null,
    6,
    null,
    null,
    null,
    null,
    2,
    8,
    null,
    null,
    null,
    null,
    4,
    1,
    9,
    null,
    null,
    5,
    null,
    null,
    null,
    null,
    8,
    null,
    null,
    7,
    9,
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
          width: 324,
          height: 324,
          background: '#0f172a',
          border: '3px solid #0284c7',
          borderRadius: 12,
          display: 'flex',
          flexWrap: 'wrap',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}
      >
        {sample.map((num, idx) => {
          const col = idx % 9;
          const row = Math.floor(idx / 9);
          const rightBorder = (col + 1) % 3 === 0 && col !== 8;
          const bottomBorder = (row + 1) % 3 === 0 && row !== 8;
          return (
            <div
              key={idx}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: rightBorder
                  ? '2px solid #0284c7'
                  : '1px solid rgba(255,255,255,0.1)',
                borderBottom: bottomBorder
                  ? '2px solid #0284c7'
                  : '1px solid rgba(255,255,255,0.1)',
                fontSize: 18,
                fontWeight: num ? 800 : 400,
                color: num ? '#38bdf8' : 'transparent',
                background:
                  row === 4 && col === 4
                    ? 'rgba(56, 189, 248, 0.25)'
                    : 'transparent',
              }}
            >
              {num ?? ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function SudokuOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const game = messages.games?.sudoku_v1;
  const gameName = game?.name ?? 'Sudoku';

  return renderGameOgCard({
    kicker: 'Logic Puzzle · 1 Player',
    title: gameName,
    subtitle:
      game?.description ??
      'Classic 9×9 number puzzle with 4 difficulty levels, pencil notes, and auto-validation.',
    accent: '#38bdf8',
    gradient: ['#082f49', '#021522'],
    badges: [
      'Easy to Expert',
      'Pencil Notes',
      'Auto Check',
      'Daily Puzzles',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Logic Grid' },
      { label: 'Difficulty', value: '4 Levels' },
      { label: 'Grid', value: '9×9 Matrix' },
    ],
    visual: <SudokuVisual />,
  });
}
