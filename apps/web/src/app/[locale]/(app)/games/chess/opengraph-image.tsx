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
  'Chess — free multiplayer with Stockfish 19 analysis on Arcadeum Games';

export const dynamic = 'force-static';
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

type PieceCode =
  'r' | 'n' | 'b' | 'q' | 'k' | 'p' | 'R' | 'N' | 'B' | 'Q' | 'K' | 'P';

const CHESS_BOARD: Array<Array<PieceCode | null>> = [
  ['r', null, 'b', 'q', 'k', 'b', null, 'r'],
  ['p', 'p', 'p', null, null, 'p', 'p', 'p'],
  [null, null, 'n', 'p', null, 'n', null, null],
  [null, null, null, null, 'p', null, null, null],
  [null, null, 'B', null, 'P', null, null, null],
  [null, null, null, null, null, 'N', null, null],
  ['P', 'P', 'P', 'P', null, 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', null, null, 'R'],
];

function ChessPieceSvg({ code }: { code: PieceCode }) {
  const isWhite = code === code.toUpperCase();
  const fill = isWhite ? '#ffffff' : '#18181b';
  const stroke = isWhite ? '#18181b' : '#ffffff';
  const type = code.toLowerCase();

  switch (type) {
    case 'p':
      return (
        <svg width="26" height="26" viewBox="0 0 45 45">
          <path
            d="M22.5 10a5 5 0 1 0 0.001 0 M16 35c0-5 3-7 6.5-7s6.5 2 6.5 7H16z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'r':
      return (
        <svg width="26" height="26" viewBox="0 0 45 45">
          <path
            d="M12 35v-4h21v4H12zm2-6V18h3v3h3v-3h5v3h3v-3h5v3h3v-3h3v11H14z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'n':
      return (
        <svg width="26" height="26" viewBox="0 0 45 45">
          <path
            d="M12 35v-4h21v4H12zm10-18c-2 0-6 2-7 6l4 2c1-2 2-3 3-3 2 0 3 2 3 4l-4 1c-3 1-5 3-5 6v2h18v-4c0-8-5-14-12-14z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'b':
      return (
        <svg width="26" height="26" viewBox="0 0 45 45">
          <path
            d="M12 35v-4h21v4H12zm10.5-22c-3.5 0-6.5 4-6.5 10 0 4 2.5 7 6.5 8 4-1 6.5-4 6.5-8 0-6-3-10-6.5-10z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'q':
      return (
        <svg width="26" height="26" viewBox="0 0 45 45">
          <path
            d="M12 35v-4h21v4H12zm1-8l2-12 5 6 2.5-8 2.5 8 5-6 2 12H13z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'k':
      return (
        <svg width="26" height="26" viewBox="0 0 45 45">
          <path
            d="M12 35v-4h21v4H12zm9-16h3v-3h2v3h3v2h-3v3h-2v-3h-3v-2zm-3 8l-2 8h13l-2-8h-9z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      );
    default:
      return null;
  }
}

function ChessVisual() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 360,
          marginBottom: 10,
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>
          STOCKFISH 19 NNUE
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
          Eval: +0.4 · Depth 32
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        }}
      >
        {CHESS_BOARD.map((row, ri) => (
          <div key={ri} style={{ display: 'flex' }}>
            {row.map((cell, ci) => {
              const isLight = (ri + ci) % 2 === 0;
              const isHighlighted =
                (ri === 4 && ci === 4) || (ri === 6 && ci === 4);
              return (
                <div
                  key={ci}
                  style={{
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isHighlighted
                      ? 'rgba(245, 158, 11, 0.55)'
                      : isLight
                        ? '#f0d9b5'
                        : '#b58863',
                  }}
                >
                  {cell ? <ChessPieceSvg code={cell} /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: 352,
          marginTop: 6,
          padding: '0 4px',
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '14px',
        }}
      >
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>
    </div>
  );
}

export default async function ChessOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.chess_v1?.landing;
  const gameName = messages.games?.chess_v1?.name ?? 'Chess';

  return renderGameOgCard({
    kicker: 'Classic Strategy · 2 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Free multiplayer chess powered by Stockfish 19 with real-time analysis, bots, and puzzles.',
    accent: '#f59e0b',
    gradient: ['#1c1305', '#0f0a02'],
    badges: [
      'Stockfish 19',
      '20 AI Bots',
      'Chess960',
      'Puzzle Rush',
      'Zero Signup · Free',
    ],
    stats: [
      { label: 'Engine', value: 'SF 19 NNUE' },
      { label: 'Strength', value: '3500+ Elo' },
      { label: 'Variants', value: 'Standard & 960' },
    ],
    visual: <ChessVisual />,
  });
}
