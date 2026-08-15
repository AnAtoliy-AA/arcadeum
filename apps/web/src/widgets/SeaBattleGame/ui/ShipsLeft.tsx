import { useTranslation } from '@/shared/lib/useTranslation';
import { Ship, getActiveShips } from '../types';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface ShipsLeftProps {
  ships: Ship[];
  isMe: boolean;
  shipCount?: number;
}

export function ShipsLeft({ ships, isMe, shipCount }: ShipsLeftProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();
  const media = useMediaQuery();
  const isMobile = !media.gtSm;
  const sortedConfig = [...getActiveShips(shipCount)].sort(
    (a, b) => b.size - a.size,
  );
  const totalShips = sortedConfig.length;
  const sunkCount = ships?.filter((s) => s.sunk).length ?? 0;
  const aliveCount = totalShips - sunkCount;

  return (
    <div
      className="flex flex-col items-stretch gap-2 p-3 bg-[rgba(0,0,0,0.4)] rounded-[12px] w-full border border-[rgba(255,255,255,0.1)] transition-all duration-300 ease-out hover:bg-[rgba(0,0,0,0.5)] hover:border-[rgba(255,255,255,0.2)] hover:scale-[1.005] hover:-translate-y-[2px] sb-ships-remaining-container"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-row justify-between items-center w-full">
        <span className="text-[12px] text-[rgba(255,255,255,0.8)] font-bold uppercase tracking-[1px]">
          {t('games.sea_battle_v1.table.state.shipsRemaining')}
        </span>
        <span
          className="text-[14px] font-black"
          style={{
            color: aliveCount === 0 ? 'var(--error)' : 'var(--success)',
          }}
        >
          {aliveCount}/{totalShips}
        </span>
      </div>

      <div
        className="flex flex-row justify-between items-center w-full"
        style={{ gap: isMobile ? 6 : 10 }}
      >
        {sortedConfig.map((config) => {
          const isSunk = ships?.find((s) => s.id === config.id)?.sunk ?? false;
          return (
            <div
              className="flex flex-row items-stretch gap-1 relative"
              style={{
                opacity: isSunk ? 0.2 : 1,
                flex: config.size,
                height: isMobile ? 10 : 14,
              }}
              key={config.id}
              data-title={config.name}
              data-size={config.size}
              data-sunk={isSunk.toString()}
            >
              {Array.from({ length: config.size }).map((_, i) => (
                <div
                  className="flex flex-col items-stretch flex-1 h-full border border-[rgba(0,0,0,0.4)] rounded-lg"
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
    </div>
  );
}
