import type { ChessMessages } from '@/shared/i18n/messages/games/chess';
import { GlassCard } from '@arcadeum/ui';

type Advantages = NonNullable<
  ChessMessages['chess_v1']['landing']['advantages']
>;

interface Props {
  advantages: Advantages;
}

const ICONS: Record<string, string> = {
  engine: '🧠',
  bots: '🤖',
  variants: '🎲',
  friction: '⚡',
  puzzles: '🧩',
  analysis: '📊',
  tablebases: '📚',
  broadcast: '👁️',
  training: '🎓',
  cosmetics: '🎨',
  battlepass: '🏆',
  anticheat: '🛡️',
};

export function ChessAdvantages({ advantages }: Props) {
  return (
    <section className="py-12">
      <div className="flex flex-col gap-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
          {advantages.kicker}
        </span>
        <h2 className="m-0 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)]">
          {advantages.title}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {advantages.items.map((item) => (
          <GlassCard
            key={item.key}
            className="p-6 transition-all duration-200 hover:border-[var(--primary)]/50 hover:-translate-y-1"
          >
            <div className="text-3xl mb-2" aria-hidden="true">
              {ICONS[item.key] ?? '✦'}
            </div>
            <h3 className="m-0 text-lg font-bold text-[var(--foreground)]">
              {item.title}
            </h3>
            <p className="m-0 text-sm text-[var(--foreground)] opacity-95 leading-relaxed">
              {item.body}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
