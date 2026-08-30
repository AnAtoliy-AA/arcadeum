import { getGlimwormTheme } from '@/widgets/ActionGames/GlimwormGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const SNAKE_SEGMENTS = [
  { size: 'w-4 h-4', glow: true },
  { size: 'w-5 h-5', glow: true },
  { size: 'w-4 h-4', glow: false },
  { size: 'w-3.5 h-3.5', glow: false },
  { size: 'w-3 h-3', glow: false },
  { size: 'w-2.5 h-2.5', glow: false },
  { size: 'w-2 h-2', glow: false },
];

export function GlimwormLandingPreview() {
  return (
    <GameLandingPreview
      testId="glimworm-landing-preview"
      render={(themeId) => {
        const theme = getGlimwormTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border relative w-full max-w-[300px] h-48 mx-auto p-4 rounded-2xl border shadow-xl flex items-center justify-center overflow-hidden"
            style={{
              background: theme.background,
              borderColor: theme.gridColor + '55',
            }}
          >
            <div
              className="box-border absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(' +
                  theme.gridColor +
                  ' 1px, transparent 1px), linear-gradient(90deg, ' +
                  theme.gridColor +
                  ' 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              aria-hidden="true"
            />

            <div className="box-border relative w-full h-full flex flex-col justify-between">
              <div
                className="box-border flex items-center justify-between text-xs font-bold uppercase tracking-wider"
                style={{ color: theme.snakeGlowColor }}
              >
                <span>Glow Arena</span>
                <span>⚡ 10 Players</span>
              </div>

              <div className="box-border flex items-center justify-center gap-2 py-4">
                {SNAKE_SEGMENTS.map((seg, idx) => (
                  <span
                    key={idx}
                    className={`box-border rounded-full ${seg.size}`}
                    style={{
                      background:
                        idx === 0 ? theme.snakeHeadColor : theme.snakeBodyColor,
                      boxShadow: seg.glow
                        ? `0 0 12px ${theme.snakeGlowColor}`
                        : undefined,
                    }}
                  />
                ))}
                <span
                  className="box-border w-3.5 h-3.5 rounded-full"
                  style={{
                    background: theme.foodColor,
                    boxShadow: `0 0 10px ${theme.foodGlowColor}`,
                  }}
                />
              </div>

              <div
                className="box-border flex items-center justify-between text-[11px]"
                style={{ color: theme.textColor }}
              >
                <span>Speed: Boosted</span>
                <span>Score: 1,420 pts</span>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
