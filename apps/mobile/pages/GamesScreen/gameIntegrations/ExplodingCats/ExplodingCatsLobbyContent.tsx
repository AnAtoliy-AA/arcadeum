import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import {
  formatRoomHost,
  formatRoomTimestamp,
  getRoomStatusLabel,
} from '../../roomUtils';
import { ExplodingCatsRoomMetaItem as MetaItem } from '../components/ExplodingCatsRoomMetaItem';
import { HERO_GRADIENT_COORDS } from './ExplodingCatsRoom.constants';
import type { ExplodingCatsRoomStyles } from './ExplodingCatsRoom.styles';
import type { GameRoomSummary } from '../../api/gamesApi';

interface ExplodingCatsLobbyContentProps {
  room: GameRoomSummary | null;
  displayName: string;
  displayGame: string | undefined;
  heroGradientColors: readonly [string, string, ...string[]];
  statusStyle: object;
  isLoading: boolean;
  error: string | null;
  styles: ExplodingCatsRoomStyles;
}

export function ExplodingCatsLobbyContent({
  room,
  displayName,
  displayGame,
  heroGradientColors,
  statusStyle,
  isLoading,
  error,
  styles,
}: ExplodingCatsLobbyContentProps) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.headerCard}>
      <LinearGradient
        colors={heroGradientColors}
        start={HERO_GRADIENT_COORDS.start}
        end={HERO_GRADIENT_COORDS.end}
        style={styles.heroGradientLayer}
        pointerEvents="none"
      />
      <View style={styles.heroBackdrop} pointerEvents="none" />
      <View style={styles.heroGlow} pointerEvents="none" />
      <View style={styles.heroGlowSecondary} pointerEvents="none" />
      <View style={styles.heroOrbit} pointerEvents="none" />
      <View style={styles.heroAccentTop} pointerEvents="none" />
      <View style={styles.heroAccentBottom} pointerEvents="none" />
      <View style={styles.headerContent}>
        <View style={styles.heroHeader}>
          <View style={styles.heroBadge}>
            <IconSymbol
              name="gamecontroller.fill"
              size={16}
              color={styles.heroBadgeIcon.color as string}
            />
            <ThemedText style={styles.heroBadgeText} numberOfLines={1}>
              {displayGame ?? t('games.rooms.unknownGame')}
            </ThemedText>
          </View>
          <View style={[styles.statusPill, statusStyle]}>
            <ThemedText style={styles.statusText}>
              {t(getRoomStatusLabel(room?.status ?? 'lobby'))}
            </ThemedText>
          </View>
        </View>

        <View style={styles.heroTitleStack}>
          <ThemedText style={styles.heroTagline} numberOfLines={1}>
            {t('games.room.heroTagline')}
          </ThemedText>
          <View style={styles.heroTitleFrame}>
            <View style={styles.heroTitleGlow} pointerEvents="none" />
            <ThemedText
              type="title"
              style={styles.roomTitle}
              numberOfLines={2}
            >
              {displayName}
            </ThemedText>
          </View>
        </View>

        {displayGame ? (
          <ThemedText style={styles.gameLabel}>{displayGame}</ThemedText>
        ) : null}

        <View style={styles.heroDividerRow}>
          <View style={styles.heroDividerDot} />
          <View style={styles.heroDividerLine} />
          <View style={styles.heroDividerDotSecondary} />
        </View>

        {room ? (
          <View style={styles.metaGrid}>
            {(() => {
              const hostLabelRaw =
                room.host?.displayName ?? formatRoomHost(room.hostId);
              const hostValue =
                hostLabelRaw === 'mystery captain'
                  ? t('games.rooms.mysteryHost')
                  : hostLabelRaw;
              const baseCapacity = room.maxPlayers
                ? t('games.rooms.capacityWithMax', {
                    current: room.playerCount,
                    max: room.maxPlayers,
                  })
                : t('games.rooms.capacityWithoutMax', {
                    count: room.playerCount,
                  });
              const playerNames = room.members
                ?.map((member) => member.displayName)
                .filter(Boolean)
                .join(', ');
              const playersValue = playerNames
                ? `${baseCapacity} • ${playerNames}`
                : baseCapacity;
              const createdRaw = formatRoomTimestamp(room.createdAt);
              const createdValue =
                createdRaw === 'Just created'
                  ? t('games.rooms.justCreated')
                  : createdRaw;
              const accessValue =
                room.visibility === 'private'
                  ? t('games.rooms.visibility.private')
                  : t('games.rooms.visibility.public');
              return (
                <>
                  <MetaItem
                    icon="person.crop.circle"
                    label={t('games.room.meta.host')}
                    value={hostValue}
                    styles={styles}
                  />
                  <MetaItem
                    icon="person.3.fill"
                    label={t('games.room.meta.players')}
                    value={playersValue}
                    styles={styles}
                  />
                  <MetaItem
                    icon="clock.fill"
                    label={t('games.room.meta.created')}
                    value={t('games.rooms.created', {
                      timestamp: createdValue,
                    })}
                    styles={styles}
                  />
                  <MetaItem
                    icon={
                      room.visibility === 'private'
                        ? 'lock.fill'
                        : 'sparkles'
                    }
                    label={t('games.room.meta.access')}
                    value={accessValue}
                    styles={styles}
                  />
                  {room.inviteCode ? (
                    <MetaItem
                      icon="number"
                      label={t('games.room.meta.inviteCode')}
                      value={room.inviteCode}
                      styles={styles}
                    />
                  ) : null}
                </>
              );
            })()}
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator
              size="small"
              color={styles.refreshTint.color as string}
            />
            <ThemedText style={styles.loadingText}>
              {t('games.room.loading')}
            </ThemedText>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={18}
              color={styles.errorText.color as string}
            />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : null}
      </View>
    </ThemedView>
  );
}
