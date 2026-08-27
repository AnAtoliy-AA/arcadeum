import type { PachisiThemeMeta } from '../data/pachisi-themes';
import { getPachisiTheme } from '@/widgets/BoardGames/PachisiGame/lib/theme';
import {
  LANE_COORDS,
  TRACK_COORDS,
} from '@/widgets/BoardGames/PachisiGame/lib/boardLayout';

interface Props {
  theme: PachisiThemeMeta;
  size?: 'sm' | 'lg';
}

/** Fixed mid-game snapshot: seat + track-progress pairs for tokens. */
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

const START_CELLS = new Set([0, 13, 26, 39]);

export function PachisiBoardPoster({ theme: themeMeta, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  const theme = getPachisiTheme(themeMeta.id);

  const boardSize = Math.min(w, h) * (big ? 0.94 : 0.98);
  const offsetX = (w - boardSize) / 2;
  const offsetY = (h - boardSize) / 2;

  const cell = boardSize / 15;
  const px = (grid: number) => offsetX + grid * cell;
  const py = (grid: number) => offsetY + grid * cell;
  const tokenR = cell * 0.34;

  const yardRects: Record<number, [number, number]> = {
    0: [0, 0],
    1: [0, 9],
    2: [9, 9],
    3: [9, 0],
  };

  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${w} ${h}`}
    >
      <rect fill={theme.boardBackground} height={h} width={w} />

      {/* Yards */}
      {[0, 1, 2, 3].map((seat) => {
        const [row, col] = yardRects[seat];
        return (
          <rect
            fill={theme.yardBackground}
            key={`yard-${seat}`}
            height={cell * 4.4}
            rx={cell * 0.6}
            stroke={theme.seatColors[seat]}
            strokeWidth={1}
            width={cell * 4.4}
            x={px(col + 0.8)}
            y={py(row + 0.8)}
          />
        );
      })}

      {/* Main-track cells */}
      {TRACK_COORDS.map(([row, col], idx) => (
        <rect
          fill={
            START_CELLS.has(idx)
              ? `${theme.seatColors[0]}55`
              : theme.cellBackground
          }
          key={`track-${idx}`}
          height={cell * 0.82}
          rx={cell * 0.16}
          stroke={theme.cellBorder}
          strokeWidth={0.5}
          width={cell * 0.82}
          x={px(col + 0.09)}
          y={py(row + 0.09)}
        />
      ))}

      {/* Home lanes */}
      {[0, 1, 2, 3].flatMap((seat) =>
        LANE_COORDS[seat].map(([row, col], laneIdx) => (
          <rect
            fill={`${theme.seatColors[seat]}66`}
            key={`lane-${seat}-${laneIdx}`}
            height={cell * 0.7}
            rx={cell * 0.14}
            stroke={theme.cellBorder}
            strokeWidth={0.5}
            width={cell * 0.7}
            x={px(col + 0.15)}
            y={py(row + 0.15)}
          />
        )),
      )}

      {/* Center home */}
      <circle
        cx={px(7.5)}
        cy={py(7.5)}
        fill={theme.centerHome}
        r={cell * 1.25}
        stroke={theme.cellBorder}
        strokeWidth={0.5}
      />

      {/* Snapshot tokens */}
      {SNAPSHOT_TOKENS.map(({ seat, p }, i) => {
        // Mirror of absoluteCell(seat, p) → track index → grid coords.
        const startOffsets = [0, 13, 26, 39];
        const idx = (startOffsets[seat] + p) % 52;
        const [row, col] = TRACK_COORDS[idx];
        return (
          <circle
            cx={px(col + 0.5)}
            cy={py(row + 0.5)}
            fill={theme.seatColors[seat]}
            key={`token-${i}`}
            r={tokenR}
            stroke={theme.tokenBorder}
            strokeWidth={0.75}
          />
        );
      })}
    </svg>
  );
}
