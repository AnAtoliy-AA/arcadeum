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
  'Pachisi (Ludo) — free multiplayer cross-and-circle board game on Arcadeum Games';

type Props = { params: Promise<{ locale: string }> };

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function PachisiVisual() {
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
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(234, 179, 8, 0.5)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: 8,
        }}
      >
        <div
          style={{
            width: 97,
            height: 97,
            background: '#ef4444',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          🔴
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ★
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: '#10b981',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          🟢
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ★
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: '#f59e0b',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 900,
            color: '#ffffff',
          }}
        >
          HOME
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ★
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: '#3b82f6',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          🔵
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ★
        </div>
        <div
          style={{
            width: 97,
            height: 97,
            background: '#eab308',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          🟡
        </div>
      </div>
    </div>
  );
}

export default async function PachisiOpengraphImage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const landing = messages.games?.pachisi_v1?.landing;
  const gameName = messages.games?.pachisi_v1?.name ?? 'Pachisi';

  return renderGameOgCard({
    kicker: 'Cross & Circle · 2–4 Players',
    title: gameName,
    subtitle:
      landing?.hero?.subtitle ??
      'Race your pawns around the sacred cross board, capture rivals, and reach the center home.',
    accent: '#eab308',
    gradient: ['#2e2005', '#120d02'],
    badges: [
      '2–4 Players',
      'Safe Squares',
      'Cowrie Shells & Dice',
      'AI Bots',
      '100% Free',
    ],
    stats: [
      { label: 'Category', value: 'Cross & Circle' },
      { label: 'Tradition', value: 'Ancient Indian' },
      { label: 'Players', value: 'Up to 4P' },
    ],
    visual: <PachisiVisual />,
  });
}
