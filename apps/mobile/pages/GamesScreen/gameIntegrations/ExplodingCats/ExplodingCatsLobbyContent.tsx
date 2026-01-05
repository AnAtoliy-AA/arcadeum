import React from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from '@/lib/i18n';
import { formatRoomHost, getRoomStatusLabel } from '../../roomUtils';
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
  onReorderParticipants?: (userIds: string[]) => void;
  isHost: boolean;
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
  onReorderParticipants,
  isHost,
}: ExplodingCatsLobbyContentProps) {
  const { t } = useTranslation();

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    if (!room?.members || !onReorderParticipants) return;
    const currentOrder = room.members.map((m) => m.id);
    const newOrder = [...currentOrder];

    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [
        newOrder[index - 1],
        newOrder[index],
      ];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
    } else {
      return;
    }

    onReorderParticipants(newOrder);
  };

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
            <ThemedText type="title" style={styles.roomTitle} numberOfLines={2}>
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
                    icon={
                      room.visibility === 'private' ? 'lock.fill' : 'sparkles'
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

        {room?.members && room.members.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <IconSymbol
                name="person.3.fill"
                size={14}
                color={styles.metaLabel.color as string}
              />
              <ThemedText style={[styles.metaLabel, { marginLeft: 6 }]}>
                {t('games.room.meta.players')} ({room.members.length}/
                {room.maxPlayers || '∞'})
              </ThemedText>
            </View>

            {room.members.map((item, index) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  marginBottom: 4,
                  borderRadius: 8,
                }}
              >
                <ThemedText
                  style={{
                    flex: 1,
                    color: styles.metaValue.color as string,
                    fontSize: 14,
                  }}
                >
                  {item.displayName} {item.isHost ? '👑' : ''}
                </ThemedText>
                {isHost && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => handleMovePlayer(index, 'up')}
                      disabled={index === 0}
                      style={{ paddingHorizontal: 8 }}
                    >
                      <IconSymbol
                        name="arrow.up"
                        size={20}
                        color={styles.metaValue.color as string}
                        style={{ opacity: index === 0 ? 0.3 : 1 }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMovePlayer(index, 'down')}
                      disabled={index === (room.members?.length ?? 0) - 1}
                      style={{ paddingHorizontal: 8 }}
                    >
                      <IconSymbol
                        name="arrow.down"
                        size={20}
                        color={styles.metaValue.color as string}
                        style={{
                          opacity:
                            index === (room.members?.length ?? 0) - 1 ? 0.3 : 1,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

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
