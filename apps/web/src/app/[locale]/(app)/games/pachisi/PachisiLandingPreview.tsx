import { getPachisiTheme } from '@/widgets/BoardGames/PachisiGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';
import {
  LANE_COORDS,
  SEAT_START_OFFSETS,
  TRACK_COORDS,
  absoluteCell,
} from '@/widgets/BoardGames/PachisiGame/lib/boardLayout';

/** Fixed mid-game snapshot for the decorative preview. */
const SNAPSHOT_TOKENS: ReadonlyArray<{ seat: number; p: number }> = [
  { seat: 0, p: 2 },
  { seat: 0, p: 14 },
  { seat: 0, p: 33 },
  { seat: 1, p: 8 },
  { seat: 1, p: 21 },
  { seat: 1, p: 44 },
  { seat: 2, p: 5 },
  { seat: 2, p: 26 },
  { seat: 3, p: 11 },
  { seat: 3, p: 38 },
];

export function PachisiLandingPreview() {
  return (
    <GameLandingPreview
      render={(themeId) => {
        const theme = getPachisiTheme(themeId);

        const tokenByCell = new Map<number, number>();
        SNAPSHOT_TOKENS.forEach(({ seat, p }) => {
          tokenByCell.set(absoluteCell(seat, p), seat);
        });

        return (
          <div
            aria-hidden="true"
            className="box-border mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-2xl border shadow-xl"
            style={{
              background: theme.boardBackground,
              borderColor: theme.yardBorder,
              display: 'grid',
              gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
            }}
          >
            {/* Yards */}
            <div
              className="rounded-lg"
              style={{
                gridRow: '2 / span 5',
                gridColumn: '2 / span 5',
                background: theme.yardBackground,
                border: `1px solid ${theme.seatColors[0]}`,
              }}
            />
            <div
              className="rounded-lg"
              style={{
                gridRow: '2 / span 5',
                gridColumn: '10 / span 5',
                background: theme.yardBackground,
                border: `1px solid ${theme.seatColors[1]}`,
              }}
            />
            <div
              className="rounded-lg"
              style={{
                gridRow: '10 / span 5',
                gridColumn: '10 / span 5',
                background: theme.yardBackground,
                border: `1px solid ${theme.seatColors[2]}`,
              }}
            />
            <div
              className="rounded-lg"
              style={{
                gridRow: '10 / span 5',
                gridColumn: '2 / span 5',
                background: theme.yardBackground,
                border: `1px solid ${theme.seatColors[3]}`,
              }}
            />

            {/* Track */}
            {TRACK_COORDS.map(([row, col], idx) => {
              const startSeat = SEAT_START_OFFSETS.findIndex(
                (off) => off === idx,
              );
              return (
                <div
                  key={`track-${idx}`}
                  className="relative rounded-[3px]"
                  style={{
                    gridRow: row + 1,
                    gridColumn: col + 1,
                    margin: '8%',
                    background:
                      startSeat >= 0
                        ? `${theme.seatColors[startSeat]}55`
                        : theme.cellBackground,
                    border: `0.5px solid ${theme.cellBorder}`,
                  }}
                >
                  {tokenByCell.has(idx) && (
                    <span
                      className="absolute inset-[14%] rounded-full shadow"
                      style={{
                        background: theme.seatColors[tokenByCell.get(idx) ?? 0],
                        border: `1px solid ${theme.tokenBorder}`,
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Home lanes */}
            {[0, 1, 2, 3].flatMap((seat) =>
              LANE_COORDS[seat].map(([row, col], laneIdx) => (
                <div
                  key={`lane-${seat}-${laneIdx}`}
                  className="rounded-[3px]"
                  style={{
                    gridRow: row + 1,
                    gridColumn: col + 1,
                    margin: '16%',
                    background: `${theme.seatColors[seat]}55`,
                    border: `0.5px solid ${theme.cellBorder}`,
                  }}
                />
              )),
            )}

            {/* Center home */}
            <div
              className="z-10 flex items-center justify-center rounded-md"
              style={{
                gridRow: '7 / span 3',
                gridColumn: '7 / span 3',
                margin: '10%',
                background: theme.centerHome,
                border: `1px solid ${theme.cellBorder}`,
              }}
            >
              <span className="text-sm">🏠</span>
            </div>
          </div>
        );
      }}
      testId="pachisi-landing-preview"
    />
  );
}
