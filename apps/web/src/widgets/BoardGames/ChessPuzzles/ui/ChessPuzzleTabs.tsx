import Link from 'next/link';
import { cx } from '@arcadeum/ui/utils/cx';

export type ChessTrainingTab = 'daily' | 'rated' | 'rush' | 'learn';

interface ChessPuzzleTabsProps {
  activeTab: ChessTrainingTab;
  locale?: string;
}

export function ChessPuzzleTabs({ activeTab, locale }: ChessPuzzleTabsProps) {
  const prefix = locale ? `/${locale}` : '';

  const tabs: Array<{
    id: ChessTrainingTab;
    label: string;
    href: string;
    badge?: string;
  }> = [
    {
      id: 'daily',
      label: 'Daily Puzzle',
      href: `${prefix}/games/chess/puzzles/daily`,
      badge: 'Daily',
    },
    {
      id: 'rated',
      label: 'Rated Puzzles',
      href: `${prefix}/games/chess/puzzles`,
    },
    {
      id: 'rush',
      label: 'Puzzle Rush',
      href: `${prefix}/games/chess/puzzles/rush`,
    },
    {
      id: 'learn',
      label: 'Coordinates',
      href: `${prefix}/games/chess/learn`,
    },
  ];

  return (
    <div
      data-testid="chess-puzzle-tabs"
      className="flex justify-center gap-2 mb-6 flex-wrap"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            data-testid={`chess-puzzle-tab-${tab.id}`}
            className={cx(
              'inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] hover:bg-[var(--backgroundHover)]',
            )}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={cx(
                  'ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                )}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
