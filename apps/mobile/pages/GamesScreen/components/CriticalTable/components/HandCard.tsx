import React from 'react';
import { Animated, ActivityIndicator, Platform, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { CriticalCard as CriticalArtwork } from '@/components/cards';
import type { CriticalCard, CriticalCatCard } from '../types';
import type { CriticalTableStyles } from '../styles';
import { CARD_ART_SETTINGS, CAT_COMBO_CARDS } from '../constants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(
  require('react-native').TouchableOpacity,
);
const ACCESSIBILITY_DISABLED_PROPS: { accessible?: boolean } =
  Platform.OS === 'web' ? {} : { accessible: false };

type CardArtworkVariant = 1 | 2 | 3;

interface HandCardProps {
  card: CriticalCard;
  index: number;
  count: number;
  mode: 'row' | 'grid';
  cardWidth: number;
  cardHeight: number;
  isPlayable: boolean;
  isBusy: boolean;
  isAnimating: boolean;
  animationScale: Animated.Value;
  actionHint?: string;
  comboHint?: string;
  translateCardName: (card: CriticalCard) => string;
  translateCardDescription: (card: CriticalCard) => string;
  onPress: () => void;
  styles: CriticalTableStyles;
}

export function HandCard({
  card,
  index,
  count,
  mode,
  cardWidth,
  cardHeight,
  isPlayable,
  isBusy,
  isAnimating,
  animationScale,
  actionHint,
  comboHint,
  translateCardName,
  translateCardDescription,
  onPress,
  styles,
}: HandCardProps) {
  const cardKey = `${card}-${index}`;
  const cardArt = CARD_ART_SETTINGS[card] ?? CARD_ART_SETTINGS.exploding_cat;
  const cardVariant = ((((cardArt.variant ?? 1) - 1 + index) % 3) +
    1) as CardArtworkVariant;
  const isGrid = mode === 'grid';
  const overlayTitleLines = isGrid ? 1 : 2;
  const overlayDescriptionLines = isGrid ? 2 : 3;

  return (
    <AnimatedTouchableOpacity
      key={cardKey}
      style={[
        isGrid ? styles.handCardGrid : styles.handCard,
        isGrid ? { width: cardWidth, height: cardHeight } : null,
        isPlayable ? styles.handCardPlayable : null,
        isPlayable ? null : styles.handCardDisabled,
        isBusy ? styles.handCardBusy : null,
        isAnimating ? { transform: [{ scale: animationScale }] } : null,
      ]}
      activeOpacity={isPlayable ? 0.82 : 1}
      onPress={onPress}
      disabled={!isPlayable || isBusy}
      accessibilityRole={isPlayable ? 'button' : 'text'}
      accessibilityLabel={translateCardName(card)}
      accessibilityHint={isPlayable && actionHint ? actionHint : undefined}
    >
      {isBusy ? (
        <ActivityIndicator
          size="small"
          color={styles.handCardBusySpinner.color as string}
        />
      ) : (
        <>
          <View
            style={[
              styles.handCardArt,
              isGrid ? { height: Math.round(cardHeight * 0.68) } : null,
            ]}
            {...ACCESSIBILITY_DISABLED_PROPS}
          >
            <CriticalArtwork
              {...ACCESSIBILITY_DISABLED_PROPS}
              card={cardArt.key}
              variant={cardVariant}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              focusable={false}
            />
            <View
              style={styles.handCardOverlay}
              {...ACCESSIBILITY_DISABLED_PROPS}
            >
              <ThemedText
                style={styles.handCardOverlayTitle}
                numberOfLines={overlayTitleLines}
              >
                {translateCardName(card)}
              </ThemedText>
              <ThemedText
                style={styles.handCardOverlayDescription}
                numberOfLines={overlayDescriptionLines}
              >
                {translateCardDescription(card)}
              </ThemedText>
            </View>
            {count > 1 && (
              <View
                style={styles.handCardCountBadge}
                {...ACCESSIBILITY_DISABLED_PROPS}
              >
                <ThemedText style={styles.handCardCountText}>
                  {count}
                </ThemedText>
              </View>
            )}
          </View>
          <View
            style={[
              styles.handCardMeta,
              isGrid ? { paddingHorizontal: 2, maxWidth: '100%' } : null,
            ]}
            {...ACCESSIBILITY_DISABLED_PROPS}
          >
            {actionHint ? (
              <ThemedText style={styles.handCardHint} numberOfLines={1}>
                {actionHint}
              </ThemedText>
            ) : null}
            {comboHint ? (
              <ThemedText style={styles.handCardHint} numberOfLines={1}>
                {comboHint}
              </ThemedText>
            ) : null}
          </View>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
}
