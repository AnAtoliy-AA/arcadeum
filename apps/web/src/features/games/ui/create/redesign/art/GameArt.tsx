import { CriticalCardPoster } from './CriticalCardPoster';
import { SeaBattleBoardPoster } from './SeaBattleBoardPoster';
import {
  findCriticalTheme,
  findSeaBattleTheme,
  type GameId,
} from '../data/themes';

interface Props {
  gameId: GameId;
  themeId?: string;
  size?: 'sm' | 'lg';
}

// Large poster art per game — used in the game picker cards (sm)
// and the preview rail (lg). Routes to the per-theme renderer.
export function GameArt({ gameId, themeId, size = 'sm' }: Props) {
  if (gameId === 'critical_v1') {
    const theme = findCriticalTheme(themeId);
    return <CriticalCardPoster theme={theme} size={size} />;
  }
  if (gameId === 'sea_battle_v1') {
    const theme = findSeaBattleTheme(themeId);
    return <SeaBattleBoardPoster theme={theme} size={size} />;
  }
  return <GlimwormPoster size={size} />;
}

function GlimwormPoster({ size }: { size: 'sm' | 'lg' }) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  // Build two serpentine paths (green + pink) sized to the viewBox.
  const sx = w / 320;
  const sy = h / 220;
  const greenPath = `M ${20 * sx} ${110 * sy}
    Q ${80 * sx} ${40 * sy} ${140 * sx} ${110 * sy}
    Q ${200 * sx} ${180 * sy} ${300 * sx} ${90 * sy}`;
  const pinkPath = `M ${20 * sx} ${160 * sy}
    Q ${90 * sx} ${220 * sy} ${160 * sx} ${150 * sy}
    Q ${230 * sx} ${80 * sy} ${300 * sx} ${170 * sy}`;

  const greenEnd = { x: 300 * sx, y: 90 * sy };
  const pinkEnd = { x: 300 * sx, y: 170 * sy };

  const stars = Array.from({ length: big ? 32 : 16 }).map((_, i) => {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 43758.5453) % 1;
    return (
      <circle
        key={i}
        cx={Math.abs(x) * w}
        cy={Math.abs(y) * h}
        r={big ? 0.8 : 0.5}
        fill="#fff"
        opacity={0.25 + Math.abs(x) * 0.5}
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width={w} height={h} fill="#06010a" />
      {stars}
      <path
        d={greenPath}
        stroke="#4ade80"
        strokeWidth={big ? 6 : 3.5}
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
        filter="url(#gw-glow-g)"
      />
      <path
        d={pinkPath}
        stroke="#f472b6"
        strokeWidth={big ? 6 : 3.5}
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
        filter="url(#gw-glow-p)"
      />
      <circle cx={greenEnd.x} cy={greenEnd.y} r={big ? 7 : 4} fill="#4ade80" />
      <circle cx={pinkEnd.x} cy={pinkEnd.y} r={big ? 7 : 4} fill="#f472b6" />
      <defs>
        <filter id="gw-glow-g">
          <feGaussianBlur stdDeviation={big ? 4 : 2} />
          <feComponentTransfer>
            <feFuncA type="linear" slope="2" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" />
        </filter>
        <filter id="gw-glow-p">
          <feGaussianBlur stdDeviation={big ? 4 : 2} />
          <feComponentTransfer>
            <feFuncA type="linear" slope="2" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  );
}
