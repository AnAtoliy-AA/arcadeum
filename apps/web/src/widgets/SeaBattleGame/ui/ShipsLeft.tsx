import { styled, YStack, XStack, Text, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Ship, SHIPS } from '../types';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';

interface ShipsLeftProps {
  ships: Ship[];
  isMe: boolean;
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

export function ShipsLeft({ ships, isMe }: ShipsLeftProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();
  const media = useMedia();
  const isMobile = !media.gtSm;
  const sortedConfig = [...SHIPS].sort((a, b) => b.size - a.size);
  const totalShips = sortedConfig.length;
  const sunkCount = ships?.filter((s) => s.sunk).length ?? 0;
  const aliveCount = totalShips - sunkCount;

  return (
    <ShipsContainer
      style={{ backdropFilter: 'blur(12px)' } as React.CSSProperties}
      className="sb-ships-remaining-container"
    >
      <XStack justifyContent="space-between" alignItems="center" width="100%">
        <Text
          fontSize={12}
          color="rgba(255,255,255,0.8)"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing={1}
        >
          {t('games.sea_battle_v1.table.state.shipsRemaining')}
        </Text>
        <Text
          fontSize={14}
          color={aliveCount === 0 ? '$error' : '$success'}
          fontWeight="900"
          style={
            {
              fontFamily: 'monospace',
              textShadow:
                aliveCount > 0
                  ? '0 0 10px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3)'
                  : 'none',
            } as React.CSSProperties
          }
        >
          {aliveCount}/{totalShips}
        </Text>
      </XStack>

      <XStack
        justifyContent="space-between"
        alignItems="center"
        gap={isMobile ? 6 : 10}
        width="100%"
      >
        {sortedConfig.map((config) => {
          const isSunk = ships?.find((s) => s.id === config.id)?.sunk ?? false;
          return (
            <XStack
              key={config.id}
              gap={1}
              opacity={isSunk ? 0.2 : 1}
              flex={config.size}
              height={isMobile ? 10 : 14}
              position="relative"
            >
              {Array.from({ length: config.size }).map((_, i) => (
                <YStack
                  key={i}
                  flex={1}
                  height="100%"
                  backgroundColor={
                    isSunk
                      ? theme.hitColor
                      : isMe
                        ? theme.primaryColor
                        : theme.textSecondaryColor
                  }
                  borderWidth={1}
                  borderColor="rgba(0,0,0,0.4)"
                  borderRadius={2}
                  style={
                    !isSunk
                      ? ({
                          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.2), 0 0 8px ${
                            isMe ? theme.primaryColor : 'rgba(255,255,255,0.2)'
                          }`,
                        } as React.CSSProperties)
                      : {}
                  }
                />
              ))}
            </XStack>
          );
        })}
      </XStack>
    </ShipsContainer>
  );
}
