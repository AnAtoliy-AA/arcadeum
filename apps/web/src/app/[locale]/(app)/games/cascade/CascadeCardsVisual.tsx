const DEMO_CARDS = [
  {
    color: 'bg-rose-500',
    value: '7',
    translate: '-translate-x-9 -rotate-12',
    label: 'Draw 2',
  },
  {
    color: 'bg-amber-500',
    value: '⚡',
    translate: '-translate-x-3 -rotate-6',
    label: 'Reverse',
  },
  {
    color: 'bg-emerald-500',
    value: '8',
    translate: 'translate-x-3 rotate-3',
    label: 'Wild',
  },
  {
    color: 'bg-sky-500',
    value: '4',
    translate: 'translate-x-9 rotate-12',
    label: 'Skip',
  },
];

export function CascadeCardsVisual() {
  return (
    <div
      aria-hidden="true"
      className="box-border relative w-full max-w-[300px] h-48 mx-auto flex items-center justify-center"
    >
      {DEMO_CARDS.map((card, idx) => (
        <div
          key={idx}
          className={`box-border absolute w-24 h-36 rounded-2xl ${card.color} text-white font-extrabold border-2 border-white/80 shadow-2xl p-2.5 flex flex-col justify-between select-none ${card.translate} transition-transform hover:scale-110`}
        >
          <span className="text-sm font-black">{card.value}</span>
          <span className="text-center text-xs font-bold opacity-90">
            {card.label}
          </span>
          <span className="text-sm font-black self-end">{card.value}</span>
        </div>
      ))}
    </div>
  );
}
