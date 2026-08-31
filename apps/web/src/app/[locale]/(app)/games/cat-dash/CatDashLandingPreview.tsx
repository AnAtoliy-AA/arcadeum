'use client';

import { getTheme as getCatDashTheme } from '@/widgets/ActionGames/CatDashGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const DEMO_RACERS = [
  { name: 'Mittens', icon: '🐱', progress: 'w-4/5', badge: '1st' },
  { name: 'Shadow', icon: '🐈‍⬛', progress: 'w-3/5', badge: '2nd' },
  { name: 'Ginger', icon: '🦁', progress: 'w-2/5', badge: '3rd' },
];

export function CatDashLandingPreview() {
  return (
    <GameLandingPreview
      testId="cat-dash-landing-preview"
      render={(themeId) => {
        const theme = getCatDashTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[300px] mx-auto p-4 rounded-2xl border shadow-xl flex flex-col gap-3"
            style={{
              background: theme.background,
              borderColor: theme.trackBorder,
            }}
          >
            <div
              className="box-border flex items-center justify-between text-xs font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: theme.text, borderColor: theme.trackBorder }}
            >
              <span>Race Track</span>
              <span>🏁 Lap 3/3</span>
            </div>

            <div className="box-border flex flex-col gap-2.5">
              {DEMO_RACERS.map((racer) => (
                <div
                  key={racer.name}
                  className="box-border flex flex-col gap-1"
                >
                  <div className="box-border flex items-center justify-between text-xs">
                    <span
                      className="font-semibold flex items-center gap-1.5"
                      style={{ color: theme.text }}
                    >
                      <span className="text-base">{racer.icon}</span>
                      {racer.name}
                    </span>
                    <span
                      className="font-bold text-[10px] px-1.5 py-0.5 rounded border"
                      style={{
                        color: theme.text,
                        borderColor: theme.trackBorder,
                        background: theme.track,
                      }}
                    >
                      {racer.badge}
                    </span>
                  </div>
                  <div
                    className="box-border w-full h-3 rounded-full border overflow-hidden"
                    style={{
                      background: theme.track,
                      borderColor: theme.trackBorder,
                    }}
                  >
                    <div
                      className={`box-border h-full rounded-full ${racer.progress} border transition-all duration-500`}
                      style={{
                        background: theme.player,
                        borderColor: theme.playerBorder,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className="box-border pt-1 flex items-center justify-center gap-2 text-[10px]"
              style={{ color: theme.textSecondary }}
            >
              <span>🎲 Dice Roll: 6 + Boost ⚡</span>
            </div>
          </div>
        );
      }}
    />
  );
}
