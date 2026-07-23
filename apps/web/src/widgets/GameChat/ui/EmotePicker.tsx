'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { XStack, YStack, Text, styled } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

export const EMOTES = [
  { id: 'good_move', emoji: '👍' },
  { id: 'lol', emoji: '😂' },
  { id: 'thinking', emoji: '🤔' },
  { id: 'nice', emoji: '🎉' },
  { id: 'unlucky', emoji: '😤' },
  { id: 'rip', emoji: '💀' },
  { id: 'fire', emoji: '🔥' },
  { id: 'clap', emoji: '👏' },
  { id: 'cry', emoji: '😢' },
  { id: 'angry', emoji: '😡' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'heart', emoji: '❤️' },
  { id: 'brain', emoji: '🧠' },
  { id: 'skull', emoji: '☠️' },
  { id: 'sweat', emoji: '😅' },
  { id: 'clown', emoji: '🤡' },
] as const;

export type EmoteId = (typeof EMOTES)[number]['id'];

const RATE_LIMIT_MS = 2000;

const PickerShell = styled(XStack, {
  name: 'EmotePickerShell',
  gap: 4,
  padding: 6,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '$glassBorder',
  backgroundColor: '$glassBg',
  flexWrap: 'wrap',
  justifyContent: 'center',
});

const EmoteBtn = styled(XStack, {
  name: 'EmotePickerBtn',
  width: 40,
  height: 40,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$backgroundHover' },
  pressStyle: { backgroundColor: '$backgroundPress', scale: 0.92 },
});

const EmoteLabel = styled(Text, {
  name: 'EmotePickerLabel',
  fontSize: 9,
  fontWeight: '600',
  color: '$colorMuted',
  textAlign: 'center',
  numberOfLines: 1,
});

interface EmotePickerProps {
  onEmote: (emoteId: EmoteId) => void;
  disabled?: boolean;
}

export function EmotePicker({ onEmote, disabled }: EmotePickerProps) {
  const [cooldown, setCooldown] = useState(false);
  const lastSentRef = useRef(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(false), RATE_LIMIT_MS);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleEmote = useCallback(
    (id: EmoteId) => {
      if (disabled || cooldown) return;
      const now = Date.now();
      if (now - lastSentRef.current < RATE_LIMIT_MS) return;
      lastSentRef.current = now;
      setCooldown(true);
      onEmote(id);
    },
    [onEmote, cooldown, disabled],
  );

  return (
    <PickerShell>
      {EMOTES.map((e) => (
        <YStack key={e.id} alignItems="center" gap={2}>
          <EmoteBtn
            onPress={() => handleEmote(e.id)}
            opacity={cooldown ? 0.5 : 1}
            aria-label={t(`games.emotes.${e.id}` as TranslationKey)}
          >
            <Text fontSize={20}>{e.emoji}</Text>
          </EmoteBtn>
          <EmoteLabel>{t(`games.emotes.${e.id}` as TranslationKey)}</EmoteLabel>
        </YStack>
      ))}
    </PickerShell>
  );
}
