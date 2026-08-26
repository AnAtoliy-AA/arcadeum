import type { CatId } from '../types';

export function RealisticCat({
  catId,
  size = 20,
  className,
}: {
  catId: CatId;
  size?: number;
  className?: string;
}) {
  const colors: Record<
    CatId,
    { main: string; ear: string; eye: string; accent: string }
  > = {
    neon: {
      main: '#a855f7',
      ear: '#d8b4fe',
      eye: '#22d3ee',
      accent: '#c084fc',
    },
    whiskers: {
      main: '#f59e0b',
      ear: '#fde68a',
      eye: '#10b981',
      accent: '#fbbf24',
    },
    stardust: {
      main: '#3b82f6',
      ear: '#bfdbfe',
      eye: '#ec4899',
      accent: '#60a5fa',
    },
    felix: {
      main: '#22c55e',
      ear: '#bbf7d0',
      eye: '#f59e0b',
      accent: '#4ade80',
    },
    shadow: {
      main: '#374151',
      ear: '#9ca3af',
      eye: '#f43f5e',
      accent: '#4b5563',
    },
    luna: {
      main: '#ec4899',
      ear: '#fbcfe8',
      eye: '#3b82f6',
      accent: '#f472b6',
    },
  };

  const c = colors[catId] ?? colors.neon;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      {/* Glow Effect / Shadow */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={c.accent}
        strokeWidth="1.5"
        opacity="0.4"
      />

      {/* Cat Ears */}
      <polygon
        points="22,48 10,12 40,32"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="2"
      />
      <polygon points="26,45 16,19 38,33" fill={c.ear} />
      <polygon
        points="78,48 90,12 60,32"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="2"
      />
      <polygon points="74,45 84,19 62,33" fill={c.ear} />

      {/* Cat Tail (curled) */}
      <path
        d="M 28 82 Q 10 92 14 74 Q 16 66 24 68 Q 30 70 24 78"
        fill="none"
        stroke={c.main}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Cat Body/Face Base */}
      <circle
        cx="50"
        cy="55"
        r="32"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="2"
      />

      {/* Fluffy Cheek Fur */}
      <polygon
        points="18,55 10,60 20,65"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="1.5"
      />
      <polygon
        points="82,55 90,60 80,65"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="1.5"
      />

      {/* Cute Little Paws */}
      <circle
        cx="38"
        cy="84"
        r="7"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="1.5"
      />
      <circle cx="38" cy="84" r="4" fill={c.ear} />
      <circle
        cx="62"
        cy="84"
        r="7"
        fill={c.main}
        stroke={c.accent}
        strokeWidth="1.5"
      />
      <circle cx="62" cy="84" r="4" fill={c.ear} />

      {/* Inner Face Mask / Cheeks */}
      <ellipse cx="50" cy="62" rx="20" ry="14" fill="#ffffff" opacity="0.95" />

      {/* Cute Shiny Eyes */}
      <ellipse cx="38" cy="48" rx="5.5" ry="8" fill="#111827" />
      <ellipse cx="62" cy="48" rx="5.5" ry="8" fill="#111827" />
      {/* Pupil accents */}
      <circle cx="36" cy="45" r="2" fill={c.eye} />
      <circle cx="60" cy="45" r="2" fill={c.eye} />
      <circle cx="39" cy="50" r="1" fill="#ffffff" />
      <circle cx="63" cy="50" r="1" fill="#ffffff" />

      {/* Nose & Mouth */}
      <polygon points="50,56 46,52 54,52" fill="#f43f5e" />
      <path
        d="M 50,56 Q 47,61 44,59 M 50,56 Q 53,61 56,59"
        fill="none"
        stroke="#111827"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <line
        x1="22"
        y1="56"
        x2="6"
        y2="53"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="62"
        x2="4"
        y2="62"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="68"
        x2="6"
        y2="71"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <line
        x1="78"
        y1="56"
        x2="94"
        y2="53"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="62"
        x2="96"
        y2="62"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="68"
        x2="94"
        y2="71"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Forehead Stripe / Pattern */}
      {catId === 'neon' && (
        <path
          d="M 50 25 L 50 35 M 46 27 L 46 33 M 54 27 L 54 33"
          stroke={c.eye}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {catId === 'whiskers' && (
        <path
          d="M 50 25 L 50 35 M 45 28 L 47 34 M 55 28 L 53 34"
          stroke="#d97706"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {catId === 'stardust' && (
        <path
          d="M 50 24 L 52 30 L 58 31 L 53 35 L 55 41 L 50 37 L 45 41 L 47 35 L 42 31 L 48 30 Z"
          fill="#fef08a"
        />
      )}
      {catId === 'luna' && (
        <path d="M 44 24 A 6 6 0 1 0 56 36 A 4 4 0 1 1 44 24" fill="#fef08a" />
      )}
      {catId === 'shadow' && (
        <path d="M 48 24 L 52 24 L 50 34 Z" fill="#e5e7eb" opacity="0.3" />
      )}
    </svg>
  );
}
