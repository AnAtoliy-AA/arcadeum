const CRITICAL_CARDS = [
  {
    name: '💣 Bomb',
    color: 'bg-red-600',
    border: 'border-red-400',
    translate: '-translate-x-8 -rotate-12',
  },
  {
    name: '🛠 Defuse',
    color: 'bg-emerald-600',
    border: 'border-emerald-400',
    translate: '-translate-x-3 -rotate-6',
  },
  {
    name: '⚔️ Attack',
    color: 'bg-amber-600',
    border: 'border-amber-400',
    translate: 'translate-x-3 rotate-3',
  },
  {
    name: '🔮 See Future',
    color: 'bg-indigo-600',
    border: 'border-indigo-400',
    translate: 'translate-x-8 rotate-12',
  },
];

export function CriticalCardsVisual() {
  return (
    <div
      aria-hidden="true"
      className="box-border relative w-full max-w-[300px] h-48 mx-auto flex items-center justify-center"
    >
      {CRITICAL_CARDS.map((card, idx) => (
        <div
          key={idx}
          className={`box-border absolute w-24 h-36 rounded-2xl ${card.color} text-white font-extrabold border-2 ${card.border} shadow-2xl p-2.5 flex flex-col justify-between select-none ${card.translate} transition-transform hover:scale-110`}
        >
          <span className="text-xs font-black">CRITICAL</span>
          <span className="text-center text-xs font-bold leading-tight">
            {card.name}
          </span>
          <span className="text-[10px] font-mono opacity-80 self-end">
            #0{idx + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
