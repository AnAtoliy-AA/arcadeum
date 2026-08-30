interface BadgePillProps {
  icon: string;
  label: string;
  bg: string;
  border: string;
  color: string;
  className?: string;
  ariaLabel?: string;
}

export function BadgePill({
  icon,
  label,
  bg,
  border,
  color,
  className,
  ariaLabel,
}: BadgePillProps) {
  return (
    <div
      className={`flex flex-row items-center gap-1 rounded-lg border px-2 py-0.5 ${className ?? ''}`}
      style={{ backgroundColor: bg, borderColor: border }}
      aria-label={ariaLabel}
    >
      <span className="text-[10px] leading-none">{icon}</span>
      <span
        className="text-[9px] leading-none font-bold uppercase"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

export function TeamPill({ team }: { team: { name: string; color: string } }) {
  return (
    <div
      className="flex flex-row items-center gap-1 ml-1 rounded-full border px-2 py-0.5"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: team.color }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: team.color,
        }}
      />
      <span
        className="text-[9px] leading-none font-bold uppercase"
        style={{ color: team.color }}
      >
        {team.name}
      </span>
    </div>
  );
}
