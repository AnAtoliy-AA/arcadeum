import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { getGameById } from './catalog';
import { useSessionTokens } from '@/stores/sessionTokens';
import { InviteCodeDialog } from './InviteCodeDialog';
import { useTranslation } from '@/lib/i18n';
import { useAppName } from '@/hooks/useAppName';
import { createStyles } from './GameDetailScreen.styles';
import { Section, MetaChip, RoomCard } from './GameDetailScreen.components';
import {
  useRoomManagement,
  useRoomActions,
  useGameActions,
} from './GameDetailScreen.hooks';

export default function GameDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string }>();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t, locale } = useTranslation();
  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
    whenUnauthenticated: '/auth',
    blockWhenUnauthenticated: true,
  });
  const appName = useAppName();

  const gameId = useMemo(() => {
    const value = params?.id;
    if (Array.isArray(value)) return value[0];
    return value ?? undefined;
  }, [params]);

  const game = useMemo(
    () => (gameId ? getGameById(gameId) : undefined),
    [gameId],
  );

  const isPlayable = Boolean(game?.isPlayable);

  const localizedOverview = useMemo(() => {
    return game?.localizations?.[locale]?.overview ?? game?.overview ?? '';
  }, [game, locale]);

  const localizedSummary = useMemo(() => {
    return game?.localizations?.[locale]?.summary ?? game?.summary ?? '';
  }, [game, locale]);

  const localizedHowToPlay = useMemo(() => {
    return game?.localizations?.[locale]?.howToPlay ?? game?.howToPlay ?? [];
  }, [game, locale]);

  const {
    sortedRooms,
    roomsLoading,
    roomsRefreshing,
    roomsError,
    isFetchingRooms,
    joiningRoomId,
    invitePrompt,
    fetchRooms,
    updateRoomList,
    setJoiningRoomId,
    setInvitePrompt,
  } = useRoomManagement({ gameId, tokens, refreshTokens });

  const { handleJoinRoom, handleInviteCancel, handleInviteSubmit } =
    useRoomActions({
      tokens,
      refreshTokens,
      updateRoomList,
      fetchRooms,
      setJoiningRoomId,
      invitePrompt,
      setInvitePrompt,
    });

  const { handleCreateRoom, handleInvite } = useGameActions({
    game,
    appName,
  });

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  useFocusEffect(
    useCallback(() => {
      if (!gameId || !tokens.accessToken) {
        return undefined;
      }
      void fetchRooms('refresh');
      return undefined;
    }, [fetchRooms, gameId, tokens.accessToken]),
  );

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!game) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView style={styles.emptyCard}>
            <IconSymbol
              name="sparkles"
              size={36}
              color={styles.emptyIcon.color as string}
            />
            <ThemedText type="title" style={styles.emptyTitle}>
              {t('games.detail.emptyTitle')}
            </ThemedText>
            <ThemedText style={styles.emptyCopy}>
              {t('games.detail.emptyDescription')}
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  const statusStyle =
    game.status === 'In prototype'
      ? styles.statusPrototype
      : game.status === 'In design'
        ? styles.statusDesign
        : styles.statusRoadmap;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={roomsRefreshing}
            onRefresh={() => fetchRooms('refresh')}
            tintColor={styles.refreshControlTint.color as string}
          />
        }
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
            <IconSymbol
              name="paperplane.fill"
              size={18}
              color={styles.inviteText.color as string}
            />
            <ThemedText style={styles.inviteText}>
              {t('games.detail.inviteButton')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleBlock}>
              <ThemedText type="title" style={styles.title}>
                {game.name}
              </ThemedText>
              <ThemedText style={styles.tagline}>{game.tagline}</ThemedText>
            </View>
            <View style={[styles.statusPill, statusStyle]}>
              <ThemedText style={styles.statusText}>{game.status}</ThemedText>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MetaChip label={game.players} icon="person.3.fill" />
            <MetaChip label={game.duration} icon="clock.fill" />
            <MetaChip label={game.mechanics[0]} icon="sparkles" />
          </View>
          <ThemedText style={styles.overview}>{localizedOverview}</ThemedText>
          <View style={styles.tagGroup}>
            {game.bestFor.map((item) => (
              <View key={item} style={styles.tagChip}>
                <ThemedText style={styles.tagText}>{item}</ThemedText>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isPlayable && styles.primaryButtonDisabled,
            ]}
            onPress={handleCreateRoom}
            disabled={!isPlayable}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isPlayable }}
          >
            <ThemedText
              style={[
                styles.primaryButtonText,
                !isPlayable && styles.primaryButtonTextDisabled,
              ]}
            >
              {t('games.common.createRoom')}
            </ThemedText>
          </TouchableOpacity>
          {!isPlayable ? (
            <ThemedText style={styles.comingSoonHint}>
              {t('games.create.badgeComingSoon')}
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView style={styles.roomsCard}>
          <View style={styles.roomsHeader}>
            <ThemedText type="subtitle">
              {t('games.detail.openRoomsTitle')}
            </ThemedText>
            <TouchableOpacity
              style={styles.roomsRefreshButton}
              onPress={() => fetchRooms('refresh')}
              disabled={isFetchingRooms}
            >
              {isFetchingRooms ? (
                <ActivityIndicator
                  size="small"
                  color={styles.roomsRefreshText.color as string}
                />
              ) : (
                <>
                  <IconSymbol
                    name="arrow.clockwise"
                    size={16}
                    color={styles.roomsRefreshText.color as string}
                  />
                  <ThemedText style={styles.roomsRefreshText}>
                    {t('games.detail.refresh')}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.roomsCaption}>
            {t('games.detail.openRoomsCaption')}
          </ThemedText>

          {roomsLoading ? (
            <View style={styles.roomsSkeletonRow}>
              <ActivityIndicator
                size="small"
                color={styles.roomsSkeletonSpinner.color as string}
              />
              <ThemedText style={styles.roomsSkeletonText}>
                {t('games.detail.loadingRooms')}
              </ThemedText>
            </View>
          ) : roomsError ? (
            <View style={styles.roomsErrorCard}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={20}
                color={styles.roomsErrorIcon.color as string}
              />
              <View style={styles.roomsErrorCopy}>
                <ThemedText style={styles.roomsErrorTitle}>
                  {t('games.detail.errorTitle')}
                </ThemedText>
                <ThemedText style={styles.roomsErrorText}>
                  {roomsError}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.roomsRetryButton}
                onPress={() => fetchRooms('refresh')}
              >
                <IconSymbol
                  name="arrow.clockwise"
                  size={16}
                  color={styles.roomsRetryText.color as string}
                />
                <ThemedText style={styles.roomsRetryText}>
                  {t('common.retry')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : sortedRooms.length === 0 ? (
            <View style={styles.roomsEmptyState}>
              <IconSymbol
                name="sparkles"
                size={24}
                color={styles.roomsEmptyIcon.color as string}
              />
              <ThemedText style={styles.roomsEmptyTitle}>
                {t('games.detail.emptyRoomsTitle')}
              </ThemedText>
              <ThemedText style={styles.roomsEmptyText}>
                {t('games.detail.emptyRoomsCaption')}
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.roomsEmptyButton,
                  !isPlayable && styles.roomsEmptyButtonDisabled,
                ]}
                onPress={handleCreateRoom}
                disabled={!isPlayable}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isPlayable }}
              >
                <ThemedText
                  style={[
                    styles.roomsEmptyButtonText,
                    !isPlayable && styles.roomsEmptyButtonTextDisabled,
                  ]}
                >
                  {t('games.common.createRoom')}
                </ThemedText>
              </TouchableOpacity>
              {!isPlayable ? (
                <ThemedText style={styles.comingSoonHint}>
                  {t('games.create.badgeComingSoon')}
                </ThemedText>
              ) : null}
            </View>
          ) : (
            sortedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                joiningRoomId={joiningRoomId}
                onJoinRoom={handleJoinRoom}
              />
            ))
          )}
        </ThemedView>

        <Section
          title={t('games.detail.highlightsTitle')}
          description={localizedSummary}
        >
          {game.highlights.map((feature) => (
            <View key={feature.title} style={styles.listItem}>
              <IconSymbol
                name="sparkles"
                size={20}
                color={styles.listIcon.color as string}
              />
              <View style={styles.listCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={styles.listBody}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </Section>

        <Section
          title={t('games.detail.howToPlayTitle')}
          description={t('games.detail.howToPlayCaption')}
        >
          {localizedHowToPlay.map((step) => (
            <View key={step.title} style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <ThemedText style={styles.stepBadgeText}>
                  {String(localizedHowToPlay.indexOf(step) + 1).padStart(
                    2,
                    '0',
                  )}
                </ThemedText>
              </View>
              <View style={styles.stepCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText style={styles.listBody}>{step.detail}</ThemedText>
              </View>
            </View>
          ))}
        </Section>

        <Section
          title={t('games.detail.comingSoonTitle')}
          description={t('games.detail.comingSoonCaption')}
        >
          {game.comingSoon.map((item) => (
            <View key={item.title} style={styles.listItem}>
              <IconSymbol
                name="gamecontroller.fill"
                size={20}
                color={styles.listIcon.color as string}
              />
              <View style={styles.listCopy}>
                <ThemedText type="defaultSemiBold" style={styles.listTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.listBody}>
                  {item.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </Section>
      </ScrollView>
      <InviteCodeDialog
        visible={invitePrompt.visible}
        roomName={invitePrompt.room?.name}
        mode={invitePrompt.mode}
        loading={invitePrompt.loading}
        error={invitePrompt.error}
        onSubmit={handleInviteSubmit}
        onCancel={handleInviteCancel}
      />
    </ThemedView>
  );
}
