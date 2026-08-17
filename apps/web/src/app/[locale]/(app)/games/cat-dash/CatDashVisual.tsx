const DEMO_RACERS = [
  {
    name: 'Mittens',
    icon: '🐱',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    progress: 'w-4/5',
    badge: '1st',
  },
  {
    name: 'Shadow',
    icon: '🐈‍⬛',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    progress: 'w-3/5',
    badge: '2nd',
  },
  {
    name: 'Ginger',
    icon: '🦁',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    progress: 'w-2/5',
    badge: '3rd',
  },
];

export function CatDashVisual() {
  return (
    <div
      aria-hidden="true"
      className="box-border w-full max-w-[300px] mx-auto p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] shadow-xl flex flex-col gap-3"
    >
      <div className="box-border flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--primary)] pb-1 border-b border-[var(--borderColor)]">
        <span>Race Track</span>
        <span>🏁 Lap 3/3</span>
      </div>

      <div className="box-border flex flex-col gap-2.5">
        {DEMO_RACERS.map((racer) => (
          <div key={racer.name} className="box-border flex flex-col gap-1">
            <div className="box-border flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <span className="text-base">{racer.icon}</span>
                {racer.name}
              </span>
              <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-[var(--glassBg)] border border-[var(--borderColor)] text-[var(--foreground)]">
                {racer.badge}
              </span>
            </div>
            <div className="box-border w-full h-3 rounded-full bg-[var(--glassBg)] border border-[var(--borderColor)] overflow-hidden">
              <div
                className={`box-border h-full rounded-full ${racer.color} ${racer.progress} border transition-all duration-500`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="box-border pt-1 flex items-center justify-center gap-2 text-[10px] text-[var(--foreground)] opacity-70">
        <span>🎲 Dice Roll: 6 + Boost ⚡</span>
      </div>
    </div>
  );
}
