import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useTranslation } from '@/lib/i18n';
import { InviteCodeDialog } from './InviteCodeDialog';
import { GamesHeader } from './components/GamesHeader';
import { FilterSection } from './components/FilterSection';
import { RoomsList } from './components/RoomsList';
import { useGamesScreenState } from './hooks/useGamesScreenState';
import { useRoomActions } from './hooks/useRoomActions';
import { useFilterOptions } from './hooks/useFilterOptions';

export default function GamesScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();

  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
  });

  const {
    rooms,
    setRooms,
    roomsLoading,
    setRoomsLoading,
    roomsRefreshing,
    setRoomsRefreshing,
    roomsError,
    setRoomsError,
    joiningRoomId,
    setJoiningRoomId,
    invitePrompt,
    setInvitePrompt,
    statusFilter,
    setStatusFilter,
    participationFilter,
    setParticipationFilter,
    updateRoomList,
  } = useGamesScreenState();

  const isAuthenticated = Boolean(tokens.accessToken && tokens.userId);

  const { statusOptions, participationOptions } =
    useFilterOptions(isAuthenticated);

  const filtersActive = useMemo(() => {
    return statusFilter !== 'all' || participationFilter !== 'all';
  }, [participationFilter, statusFilter]);

  const {
    fetchRooms,
    joinRoom,
    joinRoomByInviteCode,
    handleJoinRoom,
    handleWatchRoom,
  } = useRoomActions({
    tokens,
    refreshTokens,
    statusFilter,
    participationFilter,
    setRooms,
    setRoomsLoading,
    setRoomsRefreshing,
    setRoomsError,
    setJoiningRoomId,
    setInvitePrompt,
    updateRoomList,
    router,
  });

  useEffect(() => {
    if (!isAuthenticated && participationFilter !== 'all') {
      setParticipationFilter('all');
    }
  }, [isAuthenticated, participationFilter, setParticipationFilter]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useFocusEffect(
    useCallback(() => {
      fetchRooms('refresh');
    }, [fetchRooms]),
  );

  const navigateToCreate = useCallback(
    (gameId?: string) => {
      if (gameId) {
        router.push({ pathname: '/games/create', params: { gameId } } as never);
      } else {
        router.push('/games/create' as never);
      }
    },
    [router],
  );

  const handleManualInvite = useCallback(() => {
    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.alerts.signInInviteMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.signIn'),
            onPress: () => router.push('/auth' as never),
          },
        ],
      );
      return;
    }

    setInvitePrompt({
      visible: true,
      room: null,
      mode: 'manual',
      loading: false,
      error: null,
    });
  }, [router, setInvitePrompt, t, tokens.accessToken]);

  const handleInviteCancel = useCallback(() => {
    setInvitePrompt({
      visible: false,
      room: null,
      mode: 'room',
      loading: false,
      error: null,
    });
  }, [setInvitePrompt]);

  const handleInviteSubmit = useCallback(
    (code: string) => {
      if (invitePrompt.mode === 'manual') {
        void joinRoomByInviteCode(code);
        return;
      }

      if (!invitePrompt.room) {
        return;
      }

      void joinRoom(invitePrompt.room, code);
    },
    [invitePrompt.mode, invitePrompt.room, joinRoom, joinRoomByInviteCode],
  );

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl
            refreshing={roomsRefreshing}
            onRefresh={() => fetchRooms('refresh')}
            tintColor={styles.refreshControlTint.color as string}
          />
        }
      >
        <GamesHeader
          onCreateRoom={() => navigateToCreate()}
          onManualInvite={handleManualInvite}
        />

        <FilterSection
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          participationFilter={participationFilter}
          setParticipationFilter={setParticipationFilter}
          statusOptions={statusOptions}
          participationOptions={participationOptions}
          isAuthenticated={isAuthenticated}
        />

        <RoomsList
          rooms={rooms}
          loading={roomsLoading}
          error={roomsError}
          joiningRoomId={joiningRoomId}
          filtersActive={filtersActive}
          onJoinRoom={handleJoinRoom}
          onWatchRoom={handleWatchRoom}
          onRetry={() => fetchRooms('refresh')}
          userId={tokens.userId}
        />
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

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 16,
      paddingBottom: 48,
    },
    refreshControlTint: {
      color: palette.tint,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
  });
}
