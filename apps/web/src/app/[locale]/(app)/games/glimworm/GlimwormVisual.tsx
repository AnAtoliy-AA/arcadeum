export function GlimwormVisual() {
  return (
    <div
      aria-hidden="true"
      className="box-border relative w-full max-w-[300px] h-48 mx-auto p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] shadow-xl flex items-center justify-center overflow-hidden"
    >
      <div className="box-border absolute inset-0 bg-radial from-emerald-500/10 via-teal-500/5 to-transparent" />

      <div className="box-border relative w-full h-full flex flex-col justify-between">
        <div className="box-border flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
          <span>Glow Arena</span>
          <span>⚡ 10 Players</span>
        </div>

        <div className="box-border flex items-center justify-center gap-2 py-4">
          <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-ping" />
          <span className="w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          <span className="w-4 h-4 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]" />
          <span className="w-3.5 h-3.5 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4]" />
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 opacity-80" />
          <span className="w-2 h-2 rounded-full bg-cyan-200 opacity-60" />
        </div>

        <div className="box-border flex items-center justify-between text-[11px] text-[var(--foreground)] opacity-75">
          <span>Speed: Boosted</span>
          <span>Score: 1,420 pts</span>
        </div>
      </div>
    </div>
  );
}
