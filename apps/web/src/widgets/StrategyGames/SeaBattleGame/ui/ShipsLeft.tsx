import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Ship, getActiveShips } from '../types';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';

interface ShipsLeftProps {
  ships: Ship[];
  isMe: boolean;
  shipCount?: number;
  layout?: 'top' | 'side';
}

export const ShipsLeft = memo(function ShipsLeft({
  ships,
  isMe,
  shipCount,
  layout = 'top',
}: ShipsLeftProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();

  const {
    activeShips,
    totalShips,
    sunkCount,
    isLargeFleet,
    groupedShips,
    sunkSet,
  } = useMemo(() => {
    const active = getActiveShips(shipCount);
    const total = active.length;
    const set = new Set(ships?.filter((s) => s.sunk).map((s) => s.id) ?? []);

    // Single pass to build groups (if large fleet)
    const groups = new Map<number, { total: number; alive: number }>();
    for (let i = 0; i < active.length; i++) {
      const cfg = active[i];
      const isSunk = set.has(cfg.id);
      const group = groups.get(cfg.size);
      if (group) {
        group.total++;
        if (!isSunk) group.alive++;
      } else {
        groups.set(cfg.size, { total: 1, alive: isSunk ? 0 : 1 });
      }
    }

    return {
      activeShips: active,
      totalShips: total,
      sunkCount: set.size,
      isLargeFleet: total > 10,
      groupedShips: Array.from(groups.entries()),
      sunkSet: set,
    };
  }, [shipCount, ships]);

  const aliveCount = totalShips - sunkCount;

  if (layout === 'side') {
    return (
      <div
        className="flex flex-col items-center justify-between p-1 bg-[rgba(15,23,42,0.85)] rounded-[8px] border border-[rgba(255,255,255,0.15)] shadow-md shrink-0 w-[38px] h-full max-h-full overflow-hidden"
        title={t('games.sea_battle_v1.table.state.shipsRemaining')}
      >
        <span
          className="text-[10px] font-black shrink-0 px-1 py-0.5 rounded bg-[rgba(0,0,0,0.4)]"
          style={{
            color: aliveCount === 0 ? 'var(--error)' : 'var(--success)',
          }}
        >
          {aliveCount}/{totalShips}
        </span>
        <div className="flex flex-col justify-around items-center w-full flex-1 gap-[2px] py-0.5">
          {activeShips.map((config) => {
            const isSunk = sunkSet.has(config.id);
            return (
              <div
                key={config.id}
                className="flex flex-row items-stretch gap-[1px] w-full h-[6px]"
                style={{ opacity: isSunk ? 0.25 : 1 }}
                title={`${config.name} (${config.size})`}
              >
                {Array.from({ length: config.size }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full rounded-[1px] border border-[rgba(0,0,0,0.5)]"
                    style={{
                      backgroundColor: isSunk
                        ? theme.hitColor
                        : isMe
                          ? theme.primaryColor
                          : theme.textSecondaryColor,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-1 p-1.5 px-2.5 bg-[rgba(15,23,42,0.85)] rounded-[10px] w-full border border-[rgba(255,255,255,0.15)] shadow-md sb-ships-remaining-container overflow-hidden">
      <div className="flex flex-row justify-between items-center w-full min-w-0">
        <span className="text-[11px] sm:text-[12px] text-[rgba(255,255,255,0.9)] font-bold uppercase tracking-[0.5px] truncate">
          {t('games.sea_battle_v1.table.state.shipsRemaining')}
        </span>
        <span
          className="text-[13px] sm:text-[14px] font-black shrink-0 ml-1 px-2 py-0.5 rounded-md bg-[rgba(0,0,0,0.4)]"
          style={{
            color: aliveCount === 0 ? 'var(--error)' : 'var(--success)',
          }}
        >
          {aliveCount}/{totalShips}
        </span>
      </div>

      {isLargeFleet && groupedShips ? (
        <div className="flex flex-row flex-wrap items-center gap-1.5 w-full pt-0.5">
          {groupedShips.map(([size, stat]) => (
            <div
              key={size}
              className="flex flex-row items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[11px] font-semibold"
              style={{
                opacity: stat.alive === 0 ? 0.35 : 1,
              }}
            >
              <div className="flex flex-row gap-[1px]">
                {Array.from({ length: size }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-3 rounded-[1px]"
                    style={{
                      backgroundColor:
                        stat.alive === 0
                          ? theme.hitColor
                          : isMe
                            ? theme.primaryColor
                            : '#38bdf8',
                    }}
                  />
                ))}
              </div>
              <span
                className="ml-0.5 font-bold"
                style={{
                  color: stat.alive === 0 ? theme.hitColor : '#ffffff',
                }}
              >
                ×{stat.alive}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-row justify-between items-center w-full gap-1.5 sm:gap-2">
          {activeShips.map((config) => {
            const isSunk = sunkSet.has(config.id);
            return (
              <div
                className="flex flex-row items-stretch gap-[1px] relative h-2.5 sm:h-3"
                style={{
                  opacity: isSunk ? 0.25 : 1,
                  flex: config.size,
                }}
                key={config.id}
                data-title={config.name}
                data-size={config.size}
                data-sunk={isSunk.toString()}
              >
                {Array.from({ length: config.size }).map((_, i) => (
                  <div
                    className="flex flex-col items-stretch flex-1 h-full border border-[rgba(0,0,0,0.5)] rounded-[2px]"
                    style={{
                      backgroundColor: isSunk
                        ? theme.hitColor
                        : isMe
                          ? theme.primaryColor
                          : theme.textSecondaryColor,
                    }}
                    key={i}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
