'use client';

import { getBackgammonTheme } from '@/widgets/BoardGames/BackgammonGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

export function BackgammonLandingPreview() {
  return (
    <GameLandingPreview
      render={(themeId) => {
        const theme = getBackgammonTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[340px] mx-auto aspect-[16/10] p-2 rounded-2xl border shadow-xl flex flex-row relative overflow-hidden"
            style={{
              background: theme.boardBackground,
              borderColor: theme.barBorder,
            }}
          >
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="flex flex-row h-[42%] w-full">
                <div className="flex-1 flex flex-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      className="flex-1 h-full relative flex flex-col items-center justify-start py-0.5"
                      key={`tl-${i}`}
                    >
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 200"
                      >
                        <polygon
                          fill={
                            i % 2 === 0 ? theme.pointDark : theme.pointLight
                          }
                          points="0,0 100,0 50,190"
                        />
                      </svg>
                      {i === 0 && (
                        <div
                          className="w-4 h-4 rounded-full border shadow z-10"
                          style={{
                            backgroundColor: theme.whitePiece,
                            borderColor: theme.whitePieceBorder,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div
                  className="w-4 h-full mx-0.5 rounded-sm"
                  style={{ backgroundColor: theme.barBackground }}
                />

                <div className="flex-1 flex flex-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      className="flex-1 h-full relative flex flex-col items-center justify-start py-0.5"
                      key={`tr-${i}`}
                    >
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 200"
                      >
                        <polygon
                          fill={
                            i % 2 === 1 ? theme.pointDark : theme.pointLight
                          }
                          points="0,0 100,0 50,190"
                        />
                      </svg>
                      {i === 5 && (
                        <div
                          className="w-4 h-4 rounded-full border shadow z-10"
                          style={{
                            backgroundColor: theme.blackPiece,
                            borderColor: theme.blackPieceBorder,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-row items-center justify-center gap-2 h-[16%]">
                <div
                  className="w-6 h-6 rounded border flex items-center justify-center text-[10px] font-bold text-white shadow"
                  style={{
                    backgroundColor: theme.diceBackground,
                    borderColor: theme.diceBorder,
                  }}
                >
                  3
                </div>
                <div
                  className="w-6 h-6 rounded border flex items-center justify-center text-[10px] font-bold text-white shadow"
                  style={{
                    backgroundColor: theme.diceBackground,
                    borderColor: theme.diceBorder,
                  }}
                >
                  5
                </div>
              </div>

              <div className="flex flex-row h-[42%] w-full">
                <div className="flex-1 flex flex-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      className="flex-1 h-full relative flex flex-col items-center justify-end py-0.5"
                      key={`bl-${i}`}
                    >
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 200"
                      >
                        <polygon
                          fill={
                            i % 2 === 1 ? theme.pointDark : theme.pointLight
                          }
                          points="0,200 100,200 50,10"
                        />
                      </svg>
                    </div>
                  ))}
                </div>

                <div
                  className="w-4 h-full mx-0.5 rounded-sm"
                  style={{ backgroundColor: theme.barBackground }}
                />

                <div className="flex-1 flex flex-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      className="flex-1 h-full relative flex flex-col items-center justify-end py-0.5"
                      key={`br-${i}`}
                    >
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 200"
                      >
                        <polygon
                          fill={
                            i % 2 === 0 ? theme.pointDark : theme.pointLight
                          }
                          points="0,200 100,200 50,10"
                        />
                      </svg>
                      {i === 5 && (
                        <div
                          className="w-4 h-4 rounded-full border shadow z-10"
                          style={{
                            backgroundColor: theme.whitePiece,
                            borderColor: theme.whitePieceBorder,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }}
      testId="backgammon-landing-preview"
    />
  );
}
