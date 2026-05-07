'use client';
import { XStack, Text } from 'tamagui';
import type { GameMode } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const MODES: GameMode[] = ['all', 'mafia', 'werewolf', 'crime', 'horror'];

export function GameModeTabs({
  value,
  onChange,
  t,
}: {
  value: GameMode;
  onChange: (m: GameMode) => void;
  t?: PageTranslations;
}) {
  const labels = (t?.modes ?? {}) as Record<string, string>;
  return (
    <XStack gap="$2" flexWrap="wrap">
      {MODES.map((m) => {
        const active = value === m;
        return (
          <XStack
            key={m}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$2"
            borderWidth={1}
            borderColor={active ? '$mythicAccent' : '$borderColor'}
            backgroundColor={
              active ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.02)'
            }
            cursor="pointer"
            testID={`mode-tab-${m}`}
            onPress={() => onChange(m)}
            hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <Text
              fontSize="$3"
              fontWeight={active ? '700' : '500'}
              color={active ? '$mythicAccent' : undefined}
              textTransform="capitalize"
            >
              {labels[m] ?? m}
            </Text>
          </XStack>
        );
      })}
    </XStack>
  );
}
