import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderGameOgCard,
} from '@/shared/seo/ogImageTemplate';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Checkers — free multiplayer board game on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

const CELL = 42;

function CheckersVisual() {
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      const hasPiece = (r < 3 && !isLight) || (r >= 5 && !isLight);
      const isLightPiece = r >= 5 && !isLight;
      const isCrowned = (r === 2 && c === 1) || (r === 5 && c === 4);
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: CELL,
            height: CELL,
            background: isLight ? '#f5f5f4' : '#3f3f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {hasPiece ? (
            <div
              style={{
                width: CELL * 0.72,
                height: CELL * 0.72,
                borderRadius: '50%',
                background: isLightPiece
                  ? 'radial-gradient(circle, #ffffff 40%, #e4e4e7 100%)'
                  : 'radial-gradient(circle, #ef4444 40%, #b91c1c 100%)',
                border: `2px solid ${isLightPiece ? '#a1a1aa' : '#7f1d1d'}`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: isLightPiece ? '#b91c1c' : '#ffffff',
                fontWeight: 900,
              }}
            >
              {isCrowned ? '♔' : ''}
            </div>
          ) : null}
        </div>,
      );
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: CELL * 8,
          height: CELL * 8,
          border: '3px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        }}
      >
        {cells}
      </div>
    </div>
  );
}

export default async function CheckersOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.checkers_v1?.landing;
  const gameName = messages.games?.checkers_v1?.name ?? 'Checkers';

  return renderGameOgCard({
    kicker: 'Classic Draughts · 2 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Classic 8x8 draughts with forced captures, king promotion, and AI bot opponents.',
    accent: '#ef4444',
    gradient: ['#210909', '#0f0404'],
    badges: [
      'Forced Captures',
      'King Promotion',
      'AI Bots',
      'Multiple Themes',
      '100% Free',
    ],
    stats: [
      { label: 'Grid', value: '8×8 Board' },
      { label: 'Rules', value: 'American Draughts' },
      { label: 'Opponents', value: 'PvP & AI Bots' },
    ],
    visual: <CheckersVisual />,
  });
}
