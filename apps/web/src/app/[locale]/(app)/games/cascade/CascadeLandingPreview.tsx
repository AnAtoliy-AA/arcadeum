'use client';

import { getTheme as getCascadeTheme } from '@/widgets/CardGames/CascadeGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const DEMO_CARDS = [
  { color: 'R', value: '7', translate: '-translate-x-9 -rotate-12' },
  { color: 'Y', value: '⚡', translate: '-translate-x-3 -rotate-6' },
  { color: 'G', value: '8', translate: 'translate-x-3 rotate-3' },
  { color: 'B', value: '4', translate: 'translate-x-9 rotate-12' },
];

export function CascadeLandingPreview() {
  return (
    <GameLandingPreview
      testId="cascade-landing-preview"
      render={(themeId) => {
        const theme = getCascadeTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border relative w-full max-w-[300px] h-48 mx-auto flex items-center justify-center"
          >
            {DEMO_CARDS.map((card, idx) => (
              <div
                key={idx}
                className={`box-border absolute w-24 h-36 rounded-2xl text-white font-extrabold border-2 shadow-2xl p-2.5 flex flex-col justify-between select-none ${card.translate}`}
                style={{
                  background:
                    theme.palette[card.color as keyof typeof theme.palette],
                  borderColor: theme.cardBorder,
                  color: theme.cardText,
                }}
              >
                <span className="text-sm font-black">{card.value}</span>
                <span className="text-center text-xs font-bold opacity-90">
                  CASCADE
                </span>
                <span className="text-sm font-black self-end">
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
