'use client';
import { XStack, Text } from 'tamagui';
import type { KeyboardEvent } from 'react';
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

  function handleKey(e: KeyboardEvent<HTMLDivElement>, current: GameMode) {
    const idx = MODES.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = MODES[(idx + 1) % MODES.length];
      if (next) onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = MODES[(idx - 1 + MODES.length) % MODES.length];
      if (prev) onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = MODES[0];
      if (first) onChange(first);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = MODES[MODES.length - 1];
      if (last) onChange(last);
    }
  }

  return (
    <XStack gap="$2" flexWrap="wrap" role="tablist">
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
            role="tab"
            tabIndex={active ? 0 : -1}
            aria-selected={active}
            onPress={() => onChange(m)}
            onKeyDown={(e) => handleKey(e, m)}
            hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            focusStyle={{ borderColor: '$mythicAccent', outlineWidth: 0 }}
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
