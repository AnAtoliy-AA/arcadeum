'use client';

import { YStack, Text, styled } from 'tamagui';
import { EMOTES, type EmoteId } from '@/widgets/GameChat/ui/EmotePicker';

const BubbleContainer = styled(YStack, {
  name: 'EmoteBubbleContainer',
  position: 'absolute',
  top: -8,
  right: -8,
  zIndex: 10,
  pointerEvents: 'none',
});

const Bubble = styled(YStack, {
  name: 'EmoteBubble',
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(15, 5, 24, 0.85)',
  borderWidth: 1.5,
  borderColor: 'rgba(236, 72, 153, 0.5)',
  shadowColor: '#EC4899',
  shadowRadius: 10,
  shadowOpacity: 0.6,
});

const Emoji = styled(Text, {
  name: 'EmoteBubbleEmoji',
  fontSize: 20,
  lineHeight: 24,
});

interface ActiveEmote {
  id: string;
  emoteId: EmoteId;
}

interface EmoteBubbleProps {
  playerId: string;
  activeEmotes: ActiveEmote[];
}

function findEmoji(emoteId: EmoteId): string {
  return EMOTES.find((e) => e.id === emoteId)?.emoji ?? '❓';
}

export function EmoteBubble({ playerId, activeEmotes }: EmoteBubbleProps) {
  const current = activeEmotes.find((e) => e.id === playerId);
  if (!current) return null;

  return (
    <BubbleContainer>
      <Bubble key={current.id}>
        <Emoji>{findEmoji(current.emoteId)}</Emoji>
      </Bubble>
    </BubbleContainer>
  );
}
