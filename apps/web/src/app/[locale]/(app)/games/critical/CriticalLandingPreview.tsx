'use client';

import { getThemeById } from '@/features/games/lib/shared-themes';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const CRITICAL_CARDS = [
  { icon: '💣', nameKey: 'bomb', translate: '-translate-x-8 -rotate-12' },
  { icon: '🛠', nameKey: 'defuse', translate: '-translate-x-3 -rotate-6' },
  { icon: '⚔️', nameKey: 'attack', translate: 'translate-x-3 rotate-3' },
  { icon: '🔮', nameKey: 'seeFuture', translate: 'translate-x-8 rotate-12' },
] as const;

export function CriticalLandingPreview() {
  const { t } = useTranslation();
  return (
    <GameLandingPreview
      testId="critical-landing-preview"
      render={(themeId) => {
        const shared = getThemeById(themeId);
        const colors = shared?.colors;
        const cardColors = colors
          ? [colors.primary, colors.accent, colors.surface, colors.highlight]
          : ['#dc2626', '#059669', '#d97706', '#4f46e5'];
        return (
          <div
            aria-hidden="true"
            className="box-border relative w-full max-w-[300px] h-48 mx-auto flex items-center justify-center"
          >
            {CRITICAL_CARDS.map((card, idx) => (
              <div
                key={idx}
                className={`box-border absolute w-24 h-36 rounded-2xl text-white font-extrabold border-2 shadow-2xl p-2.5 flex flex-col justify-between select-none ${card.translate}`}
                style={{
                  background: cardColors[idx] ?? cardColors[0],
                  borderColor: colors?.border ?? '#ffffff80',
                  color: colors?.text ?? '#ffffff',
                }}
              >
                <span className="text-xs font-black">CRITICAL</span>
                <span className="text-center text-xs font-bold leading-tight">
                  {card.icon}{' '}
                  {t(`games.critical_v1.landing.extra.preview.${card.nameKey}`)}
                </span>
                <span className="text-[10px] font-mono opacity-95 self-end">
                  #0{idx + 1}
                </span>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
