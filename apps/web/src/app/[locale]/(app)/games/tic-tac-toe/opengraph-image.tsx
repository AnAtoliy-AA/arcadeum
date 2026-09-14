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
  'Tic-Tac-Toe — free online 2-player multiplayer on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function TicTacToeVisual() {
  const board = [
    ['X', 'O', 'X'],
    ['O', 'X', null],
    ['O', null, 'X'],
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
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: 348,
          height: 348,
          gap: 10,
          background: 'rgba(6, 182, 212, 0.1)',
          padding: 14,
          borderRadius: 20,
          border: '2px solid rgba(6, 182, 212, 0.4)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          position: 'relative',
        }}
      >
        {board.flat().map((cell, idx) => (
          <div
            key={idx}
            style={{
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 14,
              fontSize: 54,
              fontWeight: 900,
              color: cell === 'X' ? '#06b6d4' : '#ec4899',
              textShadow: cell
                ? `0 0 20px ${cell === 'X' ? '#06b6d4' : '#ec4899'}`
                : 'none',
            }}
          >
            {cell ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function TicTacToeOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.tic_tac_toe_v1?.landing;
  const gameName = messages.games?.tic_tac_toe_v1?.name ?? 'Tic-Tac-Toe';

  return renderGameOgCard({
    kicker: 'Quick Casual · 2 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Fast-paced 3×3 classic grid game. Play online with friends or challenge unbeatable AI bots.',
    accent: '#06b6d4',
    gradient: ['#042f2e', '#021817'],
    badges: [
      '3×3 Classic',
      'Perfect AI Bot',
      'Instant Play',
      'Zero Lag',
      '100% Free',
    ],
    stats: [
      { label: 'Grid', value: '3×3 Matrix' },
      { label: 'Duration', value: '1 Minute' },
      { label: 'Mode', value: 'Instant PvP' },
    ],
    visual: <TicTacToeVisual />,
  });
}
