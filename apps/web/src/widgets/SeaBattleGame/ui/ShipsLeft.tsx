import { styled, YStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Ship, getActiveShips } from '../types';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface ShipsLeftProps {
  ships: Ship[];
  isMe: boolean;
  shipCount?: number;
}

const ShipsContainer = styled(YStack, {
  name: 'ShipsContainer',
  gap: '$2',
  padding: '$3',
  backgroundColor: 'rgba(0,0,0,0.4)',
  borderRadius: 12,
  width: '100%',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  // Animation is handled via CSS transition in animations.css
  // to avoid TypeScript augmentation issues with the 'animation' prop.

  hoverStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.2)',
    scale: 1.005,
    y: -2,
  },
});

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
    <ShipsContainer
      className={'"sb-ships-remaining-container"'}
      style={{ backdropFilter: 'blur(12px)' } as React.CSSProperties}
    >
      <div className="box-border flex flex-row justify-space-between items-center w-full">
        <span className="box-border text-[12px] text-[rgba(255,255,255,0.8)] font-bold uppercase tracking-[1px]">
          {t('games.sea_battle_v1.table.state.shipsRemaining')}
        </span>
        <span
          className={'"box-border text-[14px] font-black"'}
          style={{ color: aliveCount === 0 ? '$error' : '$success' }}
        >
          {aliveCount}/{totalShips}
        </span>
      </div>

      <div
        className={
          '"box-border flex flex-row justify-space-between items-center w-full"'
        }
        style={{ gap: isMobile ? 6 : 10 }}
      >
        {sortedConfig.map((config) => {
          const isSunk = ships?.find((s) => s.id === config.id)?.sunk ?? false;
          return (
            <div
              className={
                '"box-border flex flex-row items-stretch gap-1 relative"'
              }
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
                  className={
                    '"box-border flex flex-col items-stretch flex-1 h-full border border-[rgba(0,0,0,0.4)] rounded-lg"'
                  }
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
    </ShipsContainer>
  );
}
