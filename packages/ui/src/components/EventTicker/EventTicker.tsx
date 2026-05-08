'use client';
import { useEffect, useState } from 'react';
import { XStack, View, Text, styled } from 'tamagui';
import { LiveChip } from '../LiveChip/LiveChip';

export type TickerEvent = {
  who: string;
  what: string;
  color?: string;
};

export type EventTickerProps = {
  events: TickerEvent[];
  intervalMs?: number;
  liveLabel?: string;
  testID?: string;
};

const Root = styled(XStack, {
  name: 'EventTicker',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.02)',
  overflow: 'hidden',
});

export function EventTicker({
  events,
  intervalMs = 2800,
  liveLabel = 'Live',
  testID,
}: EventTickerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (events.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % events.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [events.length, intervalMs]);

  if (!events.length) return null;
  const current = events[index] ?? events[0];
  if (!current) return null;

  return (
    <Root testID={testID}>
      <LiveChip label={liveLabel} />
      <View
        width={6}
        height={6}
        borderRadius={3}
        backgroundColor={current.color ?? '#ec4899'}
      />
      <Text
        fontSize="$3"
        fontWeight="700"
        color={current.color ?? '$mythicAccent'}
        numberOfLines={1}
      >
        {current.who}
      </Text>
      <Text fontSize="$3" opacity={0.85} numberOfLines={1} flex={1}>
        {current.what}
      </Text>
    </Root>
  );
}
