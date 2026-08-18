import { memo } from 'react';
import type { ReactNode } from 'react';
import { GlassCard } from '../GlassCard/GlassCard';
import { Typography } from '../Typography/Typography';
import { cx } from '../../utils/cx';

export interface TableOfContentsItem {
  id: string;
  title: string;
}

export interface TableOfContentsProps {
  items: TableOfContentsItem[];
  activeId: string;
  onSelect: (id: string) => void;
  icon?: ReactNode;
  accentColor?: 'indigo' | 'sky' | 'emerald';
  title?: string;
  className?: string;
}

export const TableOfContents = memo(function TableOfContents({
  items,
  activeId,
  onSelect,
  icon,
  accentColor = 'indigo',
  title = 'Table of Contents',
  className,
}: TableOfContentsProps): React.ReactElement {
  const accentClasses = {
    indigo: {
      active: 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
      dot: 'bg-indigo-400 text-indigo-400',
      text: 'text-indigo-400',
    },
    sky: {
      active: 'bg-sky-600/30 text-sky-200 border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
      dot: 'bg-sky-400 text-sky-400',
      text: 'text-sky-400',
    },
    emerald: {
      active: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]',
      dot: 'bg-emerald-400 text-emerald-400',
      text: 'text-emerald-400',
    },
  }[accentColor];

  return (
    <GlassCard className={cx('p-5 bg-slate-900/70 border-white/10 rounded-2xl flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <Typography variant="heading" uiSize="sm" className="font-bold flex items-center gap-2">
          {icon ? <span className={accentClasses.text}>{icon}</span> : null}
          {title}
        </Typography>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
          {items.length} Sections
        </span>
      </div>

      <nav className="flex flex-col gap-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cx(
                'text-left text-sm px-3.5 py-2.5 rounded-xl transition-all font-medium flex items-center justify-between no-underline border',
                isActive
                  ? cx('font-semibold', accentClasses.active)
                  : 'bg-transparent border-transparent text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/10',
              )}
            >
              <span className="truncate">{item.title}</span>
              {isActive ? (
                <span className={cx('w-2 h-2 rounded-full shrink-0 ml-2 shadow-[0_0_8px_currentColor]', accentClasses.dot)} />
              ) : null}
            </button>
          );
        })}
      </nav>
    </GlassCard>
  );
});
