import React from 'react';
import { Animated, Platform, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ExplodingCatsCard as ExplodingCatsArtwork } from '@/components/cards';
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { CardKey } from '@/components/cards';
import type {
  ExplodingCatsCard,
  ActionEffectType,
  ProcessedPlayer,
} from '../types';
import { PlayerSeat } from './PlayerSeat';
import type { ExplodingCatsTableStyles } from '../styles';

const ACCESSIBILITY_DISABLED_PROPS: { accessible?: boolean } =
  Platform.OS === 'web' ? {} : { accessible: false };

interface TableCenterProps {
  discardTop: ExplodingCatsCard | null;
  discardArt: { key: CardKey; variant: 1 | 2 | 3 } | null;
  activeEffect: ActionEffectType | null;
  animations: {
    effectOpacity: Animated.Value;
    effectScale: Animated.Value;
    effectRotate: Animated.Value;
  };
  tableSeats: {
    player: ProcessedPlayer;
    position: { left: number; top: number };
  }[];
  isSessionActive: boolean;
  isSessionCompleted: boolean;
  translateCardName: (card: ExplodingCatsCard) => string;
  emptyLabel: string;
  styles: ExplodingCatsTableStyles;
}

export function TableCenter({
  discardTop,
  discardArt,
  activeEffect,
  animations,
  tableSeats,
  isSessionActive,
  isSessionCompleted,
  translateCardName,
  emptyLabel,
  styles,
}: TableCenterProps) {
  const discardArtVariant = discardArt ? discardArt.variant : 1;

  return (
    <View style={styles.tableCenter as object}>
      <View
        style={[
          styles.tableInfoCard as object,
          discardTop ? (styles.tableInfoCardWithArtwork as object) : null,
        ]}
      >
        {discardTop && discardArt ? (
          <View style={styles.tableInfoArtwork as object}>
            <ExplodingCatsArtwork
              {...ACCESSIBILITY_DISABLED_PROPS}
              card={discardArt.key}
              variant={discardArtVariant}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              focusable={false}
            />
          </View>
        ) : (
          <IconSymbol
            name="arrow.triangle.2.circlepath"
            size={18}
            color={(styles.tableInfoIcon as { color: string }).color}
          />
        )}
        <ThemedText style={styles.tableInfoTitle as object}>
          {discardTop ? translateCardName(discardTop) : emptyLabel}
        </ThemedText>
      </View>
      {activeEffect ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.effectOverlay as object,
            {
              opacity: animations.effectOpacity,
              transform: [
                { scale: animations.effectScale },
                {
                  rotate: animations.effectRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.effectCircle as object,
              activeEffect === 'draw'
                ? (styles.effectCircleDraw as object)
                : activeEffect === 'attack'
                  ? (styles.effectCircleAttack as object)
                  : activeEffect === 'skip'
                    ? (styles.effectCircleSkip as object)
                    : activeEffect === 'cat_combo'
                      ? (styles.effectCircleCombo as object)
                      : (styles.effectCircleDefault as object),
            ]}
          />
          {activeEffect === 'attack' ? (
            <Animated.View style={styles.effectIconWrap as object}>
              <IconSymbol
                name="bolt.fill"
                size={28}
                color={(styles.effectIcon as { color: string }).color}
              />
            </Animated.View>
          ) : null}
        </Animated.View>
      ) : null}
      {tableSeats.map((seat) => {
        const isCurrent =
          seat.player.isCurrentTurn && isSessionActive && !isSessionCompleted;
        return (
          <PlayerSeat
            key={seat.player.playerId}
            player={seat.player}
            position={seat.position}
            isCurrent={isCurrent}
            styles={styles}
          />
        );
      })}
    </View>
  );
}
