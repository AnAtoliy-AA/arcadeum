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
  'Solitaire (Klondike) — free online card game on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function SolitaireVisual() {
  const cards = [
    { rank: 'K', suit: '♠', red: false, top: 20 },
    { rank: 'Q', suit: '♥', red: true, top: 70 },
    { rank: 'J', suit: '♣', red: false, top: 120 },
    { rank: '10', suit: '♦', red: true, top: 170 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 220,
          height: 320,
        }}
      >
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 20,
              top: c.top,
              width: 180,
              height: 120,
              background: '#ffffff',
              borderRadius: 14,
              border: '2px solid rgba(0,0,0,0.1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              color: c.red ? '#ef4444' : '#18181b',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>
                {c.rank}
              </span>
              <span style={{ fontSize: 18 }}>{c.suit}</span>
            </div>
            <span style={{ fontSize: 32 }}>{c.suit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function SolitaireOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const game = messages.games?.solitaire_v1;
  const gameName = game?.name ?? 'Solitaire';

  return renderGameOgCard({
    kicker: 'Classic Patience · 1 Player',
    title: gameName,
    subtitle:
      game?.description ??
      'Classic Klondike Solitaire with Turn 1 and Turn 3 modes, undo, hints, and score tracking.',
    accent: '#fb7185',
    gradient: ['#2e0915', '#120207'],
    badges: [
      'Turn 1 & 3',
      'Unlimited Undo',
      'Smart Hints',
      'Vegas Scoring',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Klondike Patience' },
      { label: 'Draw Mode', value: '1 or 3 Cards' },
      { label: 'Platform', value: 'Zero Install' },
    ],
    visual: <SolitaireVisual />,
  });
}
