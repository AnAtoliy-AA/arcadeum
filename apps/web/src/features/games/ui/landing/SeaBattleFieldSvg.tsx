import { getTheme } from '@/widgets/StrategyGames/SeaBattleGame/lib/theme';

const BOARD_PATTERN: number[] = [
  0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 1, 1, 3, 3, 3, 3,
  3, 1, 0, 0, 0, 0, 3, 2, 2, 2, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3,
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
];

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

interface Props {
  variant: string;
}

export function SeaBattleFieldSvg({ variant }: Props) {
  const theme = getTheme(variant);

  const w = 240;
  const h = 230;
  const padLeft = 24;
  const padTop = 20;
  const cellSize = 18;
  const gap = 2;
  const rx = parseInt(theme.borderRadius, 10) || 2;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full max-h-48 select-none pointer-events-none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <rect width={w} height={h} rx={8} fill={theme.boardBackground} />

      {COL_LABELS.map((l, c) => (
        <text
          key={l}
          x={padLeft + c * (cellSize + gap) + cellSize / 2}
          y={padTop - 6}
          textAnchor="middle"
          fontSize={8}
          fontWeight={600}
          fill={theme.textSecondaryColor}
          fontFamily="ui-monospace, monospace"
        >
          {l}
        </text>
      ))}

      {Array.from({ length: 10 }, (_, r) => {
        const y = padTop + r * (cellSize + gap);
        return (
          <g key={r}>
            <text
              x={padLeft - 6}
              y={y + cellSize / 2 + 3}
              textAnchor="end"
              fontSize={8}
              fontWeight={600}
              fill={theme.textSecondaryColor}
              fontFamily="ui-monospace, monospace"
            >
              {ROW_LABELS[r]}
            </text>

            {Array.from({ length: 10 }, (_, c) => {
              const x = padLeft + c * (cellSize + gap);
              const state = BOARD_PATTERN[r * 10 + c];

              let cellBg = theme.cellEmpty;
              if (state === 1) cellBg = theme.shipColor;
              if (state === 2) cellBg = theme.hitColor;

              return (
                <g key={c}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={rx}
                    fill={cellBg}
                    stroke={theme.cellBorder}
                    strokeWidth={0.75}
                  />
                  {state === 2 ? (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 3.5}
                      textAnchor="middle"
                      fontSize={9}
                    >
                      🔥
                    </text>
                  ) : null}
                  {state === 3 ? (
                    <circle
                      cx={x + cellSize / 2}
                      cy={y + cellSize / 2}
                      r={2.5}
                      fill={theme.missColor}
                      opacity={0.85}
                    />
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
