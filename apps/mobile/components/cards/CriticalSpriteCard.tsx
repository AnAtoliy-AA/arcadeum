import React, { memo } from 'react';
import { Image, ImageStyle, Platform, StyleSheet, View } from 'react-native';
import type { CriticalCard } from '@/pages/GamesScreen/components/CriticalTable/types';

// Same as Web: 7x7 grid
const SPRITE_GRID_SIZE = 7;

// Mapping independent of game types to avoid circular deps if possible,
// or we assume known keys. Mapping based on Web's card-sprites.ts
const CARD_SPRITE_MAP: Record<CriticalCard, number> = {
  // SPECIAL
  critical_event: 1,
  neutralizer: 2,

  // CORE
  strike: 3,
  evade: 4,
  trade: 5,
  reorder: 6,
  insight: 7,
  cancel: 8,

  // COLLECTION
  collection_alpha: 9,
  collection_beta: 10,
  collection_gamma: 11,
  collection_delta: 12,
  collection_epsilon: 13,

  // ATTACK PACK
  targeted_strike: 14,
  private_strike: 15,
  recursive_strike: 16,
  mega_evade: 17,
  invert: 18,

  // FUTURE PACK
  see_future_5x: 19,
  alter_future_3x: 20,
  alter_future_5x: 21,
  reveal_future_3x: 22,
  share_future_3x: 23,
  draw_bottom: 24,
  swap_top_bottom: 25,
  bury: 26,

  // THEFT PACK
  wildcard: 27,
  mark: 28,
  steal_draw: 29,
  stash: 30,

  // DEITY PACK
  omniscience: 31,
  miracle: 32,
  smite: 33,
  rapture: 34,

  // CHAOS PACK (Planned/Extra)
  critical_implosion: 35,
  containment_field: 36,
  fission: 37,
  tribute: 38,
  blackout: 39,
};

interface CriticalSpriteCardProps {
  card: CriticalCard | 'back';
  variant: string; // 'cyberpunk' | 'underwater' | etc.
  width?: number | string;
  height?: number | string;
  accessibilityLabel?: string;
  accessibilityRole?: string; // 'none' | 'button' | 'image' | ...
  accessible?: boolean;
}

const getImageSource = (variant: string) => {
  switch (variant) {
    case 'cyberpunk':
      return require('@/assets/cards/cyberpunk_sprites.png');
    case 'underwater':
      return require('@/assets/cards/underwater_sprites.png');
    case 'crime':
      return require('@/assets/cards/crime_sprites.png');
    case 'horror':
      return require('@/assets/cards/horror_sprites.png');
    case 'adventure':
      return require('@/assets/cards/adventure_sprites.png');
    default:
      return require('@/assets/cards/cyberpunk_sprites.png');
  }
};

export const CriticalSpriteCard = memo(
  ({
    card,
    variant,
    width = '100%',
    height = '100%',
    accessibilityLabel,
    accessibilityRole,
    accessible,
  }: CriticalSpriteCardProps) => {
    // 0 is typically the Card Back in the sprite sheet (based on web usage)
    const spriteIndex =
      card === 'back' ? 0 : (CARD_SPRITE_MAP[card as CriticalCard] ?? 0);

    // Calculate position
    // Web logic:
    // const x = col * (100 / (SPRITE_GRID_SIZE - 1));
    // const y = row * (100 / (SPRITE_GRID_SIZE - 1));
    // background-size: 700% 700%
    //
    // In RN with Image inside View:
    // Container size: W x H
    // Image size: (W * GRID_SIZE) x (H * GRID_SIZE)
    // Image Offset: -col * W, -row * H

    const col = spriteIndex % SPRITE_GRID_SIZE;
    const row = Math.floor(spriteIndex / SPRITE_GRID_SIZE);

    const isAccessibilityDisabled = accessible === false;
    const normalizedAccessible =
      Platform.OS === 'web' && isAccessibilityDisabled ? undefined : accessible;

    return (
      <View
        style={[
          styles.container,
          { width: width as number, height: height as number },
        ]}
        accessible={normalizedAccessible}
        accessibilityRole={
          isAccessibilityDisabled
            ? undefined
            : ((accessibilityRole as
                | 'none'
                | 'button'
                | 'togglebutton'
                | 'link'
                | 'header'
                | 'search'
                | 'image'
                | 'keyboardkey'
                | 'text'
                | 'adjustable'
                | 'imagebutton'
                | 'alert'
                | 'checkbox'
                | 'combobox'
                | 'menu'
                | 'menubar'
                | 'menuitem'
                | 'progressbar'
                | 'radio'
                | 'radiogroup'
                | 'scrollbar'
                | 'spinbutton'
                | 'switch'
                | 'tab'
                | 'tablist'
                | 'timer'
                | 'toolbar') ?? 'image')
        }
        accessibilityLabel={accessibilityLabel}
      >
        <Image
          source={getImageSource(variant)}
          style={
            {
              width: `${100 * SPRITE_GRID_SIZE}%` as unknown as number,
              height: `${100 * SPRITE_GRID_SIZE}%` as unknown as number,
              // Let's use absolute positioning for safety
              position: 'absolute',
              left: `${-col * 100}%` as unknown as number,
              top: `${-row * 100}%` as unknown as number,
            } as ImageStyle
          }
          resizeMode="stretch" // Use stretch to fill the calculated big size exactly
        />
      </View>
    );
  },
);

CriticalSpriteCard.displayName = 'CriticalSpriteCard';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // Ensure bg color is transparent or matches
    backgroundColor: 'transparent',
  },
});
