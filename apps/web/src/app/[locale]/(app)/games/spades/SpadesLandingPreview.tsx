'use client';

import { getTheme } from '@/widgets/CardGames/SpadesGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

export function SpadesLandingPreview() {
  return (
    <GameLandingPreview
      render={(themeId) => {
        const theme = getTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[340px] mx-auto aspect-[16/10] p-3 rounded-2xl border shadow-xl flex flex-col relative overflow-hidden"
            style={{
              background: theme.background,
              borderColor: theme.cardBorder,
            }}
          >
            <div className="flex justify-center gap-2 mb-3">
              {['AS', 'KH', 'QS', '10S', 'JD'].map((card, i) => {
                const suit = card.slice(-1);
                const rank = card.slice(0, -1);
                const isRed = suit === 'H' || suit === 'D';
                const suitSymbol =
                  suit === 'S'
                    ? '♠'
                    : suit === 'H'
                      ? '♥'
                      : suit === 'D'
                        ? '♦'
                        : '♣';
                return (
                  <div
                    key={i}
                    className="w-10 h-14 rounded-lg border flex flex-col items-center justify-center text-xs font-bold shadow"
                    style={{
                      background: theme.surface,
                      borderColor: theme.cardBorder,
                      color: isRed ? theme.heartColor : theme.spadeColor,
                    }}
                  >
                    <span className="text-[10px]">{rank}</span>
                    <span className="text-sm">{suitSymbol}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-4xl" style={{ color: theme.accent }}>
                ♠
              </div>
            </div>

            <div
              className="flex justify-between text-[10px] px-2"
              style={{ color: theme.cardText }}
            >
              <span>Trick 5</span>
              <span>You: bid 4 · made 3</span>
            </div>
          </div>
        );
      }}
      testId="spades-landing-preview"
    />
  );
}
