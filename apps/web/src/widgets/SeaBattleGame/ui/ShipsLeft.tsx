'use client';
import { YStack, XStack, Text, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Ship, SHIPS } from '../types';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';

interface ShipsLeftProps {
  ships: Ship[];
  isMe: boolean;
}

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
    <YStack
      gap="$1.5"
      padding="$2"
      backgroundColor="rgba(0,0,0,0.25)"
      borderRadius={8}
      width="100%"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.05)"
    >
      <XStack justifyContent="space-between" alignItems="center" width="100%">
        <Text
          fontSize={11}
          color="rgba(255,255,255,0.6)"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          {t('games.sea_battle_v1.table.state.shipsRemaining')}
        </Text>
        <Text
          fontSize={12}
          color="$success"
          fontWeight="800"
          style={{ fontFamily: 'monospace' }}
        >
          {aliveCount}/{totalShips}
        </Text>
      </XStack>

      <XStack flexWrap="wrap" gap="$1.5">
        {sortedConfig.map((config) => {
          const isSunk = ships?.find((s) => s.id === config.id)?.sunk ?? false;
          return (
            <YStack
              key={config.id}
              alignItems="center"
              gap={1}
              opacity={isSunk ? 0.35 : 1}
              position="relative"
              aria-label={config.name}
              data-title={config.name}
              data-sunk={isSunk ? 'true' : 'false'}
            >
              <XStack gap={1}>
                {Array.from({ length: config.size }).map((_, i) => (
                  <YStack
                    key={i}
                    width={isMobile ? 6 : 8}
                    height={isMobile ? 6 : 8}
                    backgroundColor={
                      isSunk
                        ? theme.hitColor
                        : isMe
                          ? theme.primaryColor
                          : theme.textSecondaryColor
                    }
                    borderWidth={0.5}
                    borderColor="rgba(0,0,0,0.3)"
                    borderRadius={1}
                  />
                ))}
              </XStack>
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
