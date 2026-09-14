import Link from 'next/link';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  title: string;
  subtitle: string;
  gameId: string;
  roomsHref: string;
  ctaQuickplayLabel: string;
  ctaQuickplayErrorLabel: string;
  browseRoomsLabel: string;
}

const FAN = [
  { color: '#dc2626', label: '7', rotate: -16, dx: -120 },
  { color: '#fbbf24', label: '+2', rotate: 0, dx: 0 },
  { color: '#3b82f6', label: '↻', rotate: 16, dx: 120 },
];

export function CascadeHero({
  title,
  subtitle,
  gameId,
  roomsHref,
  ctaQuickplayLabel,
  ctaQuickplayErrorLabel,
  browseRoomsLabel,
}: Props) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-12 items-center max-[768px]:grid-cols-1 max-[768px]:gap-8 max-[768px]:text-center">
      <div className="flex flex-col gap-6 max-[768px]:items-center">
        <h1 className="text-[clamp(28px,4.4vw,52px)] leading-[1.1] font-black m-0">
          {title}
        </h1>
        <p className="text-[18px] opacity-85 m-0 max-w-[540px] max-[768px]:mx-auto">
          {subtitle}
        </p>
        <div className="flex gap-3 flex-wrap max-[768px]:justify-center">
          <QuickplayButton
            gameId={gameId}
            label={ctaQuickplayLabel}
            mode="ai"
            errorLabel={ctaQuickplayErrorLabel}
          />
          <Link
            href={roomsHref}
            className="px-[14px] py-[14px] rounded-xl border border-current font-bold no-underline text-inherit"
          >
            {browseRoomsLabel}
          </Link>
        </div>
      </div>

      <div
        className="relative w-full max-w-[420px] aspect-square mx-auto bg-[radial-gradient(circle_at_30%_30%,#312e81_0%,#0c0a1e_70%)] rounded-[24px] overflow-hidden p-4 max-[768px]:max-w-[300px]"
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {FAN.map((c, i) => (
            <div
              key={i}
              className="absolute w-[120px] h-[180px] rounded-[16px] border-[3px] border-[rgba(255,255,255,0.18)] shadow-[0_12px_24px_rgba(0,0,0,0.4)] flex items-center justify-center text-[64px] font-black text-white max-[768px]:w-[80px] max-[768px]:h-[120px] max-[768px]:text-[42px]"
              style={{
                background: c.color,
                transform: `translate(${c.dx}px, 0) rotate(${c.rotate}deg)`,
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
