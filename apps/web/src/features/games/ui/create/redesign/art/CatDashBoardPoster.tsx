interface Props {
  theme: { id: string; color: string };
  size: 'sm' | 'lg';
}

export function CatDashBoardPoster({ theme, size }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={w} height={h} fill={theme.color} opacity={0.15} />
      {/* Track line */}
      <line
        x1={w * 0.1}
        y1={h * 0.5}
        x2={w * 0.9}
        y2={h * 0.5}
        stroke={theme.color}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Track spaces */}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.85].map((x, i) => (
        <circle
          key={i}
          cx={w * x}
          cy={h * 0.5}
          r={big ? 10 : 6}
          fill={i === 3 ? '#f59e0b' : i === 4 ? '#dc2626' : theme.color}
          opacity={0.7}
        />
      ))}
      {/* Cat icon */}
      <text
        x={w * 0.3}
        y={h * 0.35}
        fontSize={big ? 28 : 18}
        textAnchor="middle"
      >
        🐱
      </text>
      {/* Dice icon */}
      <rect
        x={w * 0.65}
        y={h * 0.25}
        width={big ? 30 : 18}
        height={big ? 30 : 18}
        rx={3}
        fill="white"
        opacity={0.8}
      />
      <circle cx={w * 0.68} cy={h * 0.32} r={2} fill={theme.color} />
      <circle cx={w * 0.74} cy={h * 0.32} r={2} fill={theme.color} />
      <circle cx={w * 0.71} cy={h * 0.38} r={2} fill={theme.color} />
      {/* Finish flag */}
      <text
        x={w * 0.88}
        y={h * 0.42}
        fontSize={big ? 20 : 14}
        textAnchor="middle"
      >
        🏁
      </text>
    </svg>
  );
}
