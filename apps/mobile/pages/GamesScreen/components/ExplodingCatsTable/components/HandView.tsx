import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import type { ExplodingCatsCard, ProcessedPlayer } from '../types';
import type { ExplodingCatsTableStyles } from '../styles';

interface HandViewProps {
  selfPlayer: ProcessedPlayer | null;
  handViewMode: 'row' | 'grid';
  onViewModeChange: (mode: 'row' | 'grid') => void;
  gridColumns: number;
  onGridColumnsChange: (delta: number) => void;
  maxColumnsByWidth: number;
  showHandHeader: boolean;
  canDraw: boolean;
  canPlaySkip: boolean;
  canPlayAttack: boolean;
  canPlayNope: boolean;
  canPlaySeeTheFuture: boolean;
  actionBusy: string | null;
  onDraw: () => void;
  onPlay: (card: 'skip' | 'attack') => void;
  onPlayNope: () => void;
  onPlaySeeTheFuture: () => void;
  // Card rendering props
  renderHandCard: (
    card: ExplodingCatsCard,
    index: number,
    count: number,
    mode?: 'row' | 'grid',
  ) => React.ReactNode;
  handScrollRef: React.RefObject<ScrollView | null>;
  gridContainerWidth: number;
  onGridContainerLayout: (width: number) => void;
  styles: ExplodingCatsTableStyles;
}

export function HandView({
  selfPlayer,
  handViewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
  maxColumnsByWidth,
  showHandHeader,
  canDraw,
  canPlaySkip,
  canPlayAttack,
  canPlayNope,
  canPlaySeeTheFuture,
  actionBusy,
  onDraw,
  onPlay,
  onPlayNope,
  onPlaySeeTheFuture,
  renderHandCard,
  handScrollRef,
  onGridContainerLayout,
  styles,
}: HandViewProps) {
  const { t } = useTranslation();

  if (!selfPlayer) {
    return null;
  }

  const MIN_GRID_COLUMNS = 1;
  const canDecreaseGridColumns = gridColumns > MIN_GRID_COLUMNS;
  const canIncreaseGridColumns = gridColumns < maxColumnsByWidth;

  // Group cards by type and count
  const uniqueCards = Array.from(new Set(selfPlayer.hand));
  const cardCounts = new Map<ExplodingCatsCard, number>();
  selfPlayer.hand.forEach((card) => {
    cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
  });

  return (
    <View style={styles.handSection}>
      {showHandHeader ? (
        <View style={styles.handHeader}>
          <IconSymbol
            name="hand.draw.fill"
            size={18}
            color={styles.handTitleIcon.color as string}
          />
          <ThemedText style={styles.handTitle}>
            {t('games.table.hand.title')}
          </ThemedText>
          <View
            style={[
              styles.handStatusPill,
              selfPlayer.alive ? styles.handStatusAlive : styles.handStatusOut,
            ]}
          >
            <ThemedText
              style={[
                styles.handStatusText,
                selfPlayer.alive ? null : styles.handStatusTextOut,
              ]}
            >
              {t(
                selfPlayer.alive
                  ? 'games.table.hand.statusAlive'
                  : 'games.table.hand.statusOut',
              )}
            </ThemedText>
          </View>
          <View style={styles.handHeaderControls}>
            <View
              style={[
                styles.handSizeControls,
                handViewMode === 'grid' ? null : styles.handSizeControlsHidden,
              ]}
              pointerEvents={handViewMode === 'grid' ? 'auto' : 'none'}
            >
              <TouchableOpacity
                style={[
                  styles.handSizeButton,
                  !canDecreaseGridColumns
                    ? styles.handSizeButtonDisabled
                    : null,
                ]}
                onPress={() => onGridColumnsChange(-1)}
                accessibilityRole="button"
                accessibilityLabel={t('games.table.hand.sizeDecrease')}
                accessibilityState={{ disabled: !canDecreaseGridColumns }}
                disabled={!canDecreaseGridColumns}
              >
                <IconSymbol
                  name="minus"
                  size={12}
                  color={styles.handTitleIcon.color as string}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.handSizeButton,
                  !canIncreaseGridColumns
                    ? styles.handSizeButtonDisabled
                    : null,
                ]}
                onPress={() => onGridColumnsChange(1)}
                accessibilityRole="button"
                accessibilityLabel={t('games.table.hand.sizeIncrease')}
                accessibilityState={{ disabled: !canIncreaseGridColumns }}
                disabled={!canIncreaseGridColumns}
              >
                <IconSymbol
                  name="plus"
                  size={12}
                  color={styles.handTitleIcon.color as string}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.handViewButton,
                handViewMode === 'grid' ? styles.handViewButtonActive : null,
              ]}
              onPress={() => onViewModeChange('grid')}
              accessibilityRole="button"
              accessibilityLabel={t('games.table.hand.viewGrid')}
              accessibilityState={{ selected: handViewMode === 'grid' }}
            >
              <IconSymbol
                name="square.grid.2x2"
                size={14}
                color={
                  (handViewMode === 'grid'
                    ? styles.handViewButtonIconActive.color
                    : styles.handTitleIcon.color) as string
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.handViewButton,
                handViewMode === 'row' ? styles.handViewButtonActive : null,
              ]}
              onPress={() => onViewModeChange('row')}
              accessibilityRole="button"
              accessibilityLabel={t('games.table.hand.viewRow')}
              accessibilityState={{ selected: handViewMode === 'row' }}
            >
              <IconSymbol
                name="rectangle"
                size={14}
                color={
                  (handViewMode === 'row'
                    ? styles.handViewButtonIconActive.color
                    : styles.handTitleIcon.color) as string
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {selfPlayer.hand.length ? (
        handViewMode === 'row' ? (
          <ScrollView
            horizontal
            style={styles.handScroll}
            ref={handScrollRef}
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={styles.handScrollContent}
          >
            {uniqueCards.map((card, index) =>
              renderHandCard(card, index, cardCounts.get(card) || 1),
            )}
          </ScrollView>
        ) : (
          <View
            style={styles.handGridContainer}
            onLayout={({ nativeEvent: { layout } }) => {
              const layoutWidth = Math.round(layout.width);
              onGridContainerLayout(layoutWidth);
            }}
          >
            {uniqueCards.map((card, index) =>
              renderHandCard(card, index, cardCounts.get(card) || 1, 'grid'),
            )}
          </View>
        )
      ) : (
        <View style={styles.handEmpty}>
          <ThemedText style={styles.handEmptyText}>
            {t('games.table.hand.empty')}
          </ThemedText>
        </View>
      )}

      <View style={styles.handActions}>
        {canDraw ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              actionBusy && actionBusy !== 'draw'
                ? styles.primaryButtonDisabled
                : null,
            ]}
            onPress={onDraw}
            disabled={actionBusy === 'draw'}
          >
            {actionBusy === 'draw' ? (
              <ActivityIndicator
                size="small"
                color={styles.primaryButtonText.color as string}
              />
            ) : (
              <>
                <IconSymbol
                  name="hand.draw.fill"
                  size={16}
                  color={styles.primaryButtonText.color as string}
                />
                <ThemedText style={styles.primaryButtonText}>
                  {t('games.table.actions.draw')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {canPlaySkip ? (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              actionBusy && actionBusy !== 'skip'
                ? styles.secondaryButtonDisabled
                : null,
            ]}
            onPress={() => onPlay('skip')}
            disabled={actionBusy === 'skip'}
          >
            {actionBusy === 'skip' ? (
              <ActivityIndicator
                size="small"
                color={styles.secondaryButtonText.color as string}
              />
            ) : (
              <>
                <IconSymbol
                  name="figure.walk"
                  size={16}
                  color={styles.secondaryButtonText.color as string}
                />
                <ThemedText style={styles.secondaryButtonText}>
                  {t('games.table.actions.playSkip')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {canPlayAttack ? (
          <TouchableOpacity
            style={[
              styles.destructiveButton,
              actionBusy && actionBusy !== 'attack'
                ? styles.destructiveButtonDisabled
                : null,
            ]}
            onPress={() => onPlay('attack')}
            disabled={actionBusy === 'attack'}
          >
            {actionBusy === 'attack' ? (
              <ActivityIndicator
                size="small"
                color={styles.destructiveButtonText.color as string}
              />
            ) : (
              <>
                <IconSymbol
                  name="bolt.fill"
                  size={16}
                  color={styles.destructiveButtonText.color as string}
                />
                <ThemedText style={styles.destructiveButtonText}>
                  {t('games.table.actions.playAttack')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {canPlayNope ? (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              actionBusy && actionBusy !== 'nope'
                ? styles.secondaryButtonDisabled
                : null,
            ]}
            onPress={onPlayNope}
            disabled={actionBusy === 'nope'}
          >
            {actionBusy === 'nope' ? (
              <ActivityIndicator
                size="small"
                color={styles.secondaryButtonText.color as string}
              />
            ) : (
              <>
                <IconSymbol
                  name="xmark.circle.fill"
                  size={16}
                  color={styles.secondaryButtonText.color as string}
                />
                <ThemedText style={styles.secondaryButtonText}>
                  {t('games.table.actions.playNope')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {canPlaySeeTheFuture ? (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              actionBusy && actionBusy !== 'see_the_future'
                ? styles.secondaryButtonDisabled
                : null,
            ]}
            onPress={onPlaySeeTheFuture}
            disabled={actionBusy === 'see_the_future'}
          >
            {actionBusy === 'see_the_future' ? (
              <ActivityIndicator
                size="small"
                color={styles.secondaryButtonText.color as string}
              />
            ) : (
              <>
                <IconSymbol
                  name="eye.fill"
                  size={16}
                  color={styles.secondaryButtonText.color as string}
                />
                <ThemedText style={styles.secondaryButtonText}>
                  {t('games.table.cards.seeTheFuture')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {!selfPlayer.alive ? (
        <ThemedText style={styles.eliminatedNote}>
          {t('games.table.hand.eliminatedNote')}
        </ThemedText>
      ) : null}
    </View>
  );
}
