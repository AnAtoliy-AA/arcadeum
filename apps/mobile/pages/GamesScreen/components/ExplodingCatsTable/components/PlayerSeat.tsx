import React from 'react';
import { Platform, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { ProcessedPlayer } from '../types';
import type { ExplodingCatsTableStyles } from '../styles';

const ACCESSIBILITY_DISABLED_PROPS: { accessible?: boolean } =
  Platform.OS === 'web' ? {} : { accessible: false };

interface PlayerSeatProps {
  player: ProcessedPlayer;
  position: { left: number; top: number };
  isCurrent: boolean;
  styles: ExplodingCatsTableStyles;
}

export function PlayerSeat({
  player,
  position,
  isCurrent,
  styles,
}: PlayerSeatProps) {
  return (
    <View
      style={[
        styles.tableSeatAnchor,
        {
          left: position.left,
          top: position.top,
        },
      ]}
    >
      <View
        style={[
          styles.tableSeatRow,
          isCurrent ? styles.tableSeatRowCurrent : null,
          !player.alive ? styles.tableSeatRowOut : null,
        ]}
      >
        <View style={styles.seatAvatarColumn}>
          <View style={styles.seatAvatar}>
            <IconSymbol
              name="person.circle.fill"
              size={28}
              color={styles.seatAvatarIcon.color as string}
            />
            <View
              style={[
                styles.seatStatusDot,
                player.alive
                  ? styles.seatStatusDotAlive
                  : styles.seatStatusDotOut,
              ]}
            />
          </View>
          <ThemedText style={styles.seatName} numberOfLines={1}>
            {player.displayName}
          </ThemedText>
          <View style={styles.seatCardStrip}>
            {Array.from({
              length: Math.min(player.handSize, 6),
            }).map((_, cardIndex) => (
              <View
                key={cardIndex}
                style={[
                  styles.seatCardBack,
                  cardIndex > 0 ? styles.seatCardBackStacked : null,
                ]}
              />
            ))}
            <ThemedText style={styles.seatCardCount}>
              {player.handSize}
              {player.handSize > 6 ? '+' : ''}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}
