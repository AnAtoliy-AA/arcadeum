import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { gamesCatalog, type GameCatalogueEntry } from './catalog';
import { createGameRoom, type CreateGameRoomParams } from './api/gamesApi';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useTranslation } from '@/lib/i18n';
import { platformShadow } from '@/lib/platformShadow';

export default function CreateGameRoomScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ gameId?: string }>();
  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
    whenUnauthenticated: '/auth',
    blockWhenUnauthenticated: true,
  });
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();

  const playableGames = useMemo(
    () => gamesCatalog.filter((game) => game.isPlayable),
    [],
  );
  const availableGames = gamesCatalog;

  const initialGameId = useMemo(() => {
    const value = params?.gameId;
    const requestedId = Array.isArray(value) ? value[0] : value;
    if (requestedId && playableGames.some((game) => game.id === requestedId)) {
      return requestedId;
    }
    return playableGames[0]?.id ?? gamesCatalog[0]?.id ?? '';
  }, [params, playableGames]);

  const [state, setState] = useState({
    gameId: initialGameId,
    name: '',
    visibility: 'public' as CreateGameRoomParams['visibility'],
    maxPlayers: '',
    notes: '',
    loading: false,
  });

  const selectedGame: GameCatalogueEntry | undefined = useMemo(
    () =>
      availableGames.find((game) => game.id === state.gameId) ??
      availableGames[0],
    [availableGames, state.gameId],
  );

  const handleChange = useCallback(
    (field: 'name' | 'maxPlayers' | 'notes') => (value: string) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleToggleVisibility = useCallback(() => {
    setState((prev) => ({
      ...prev,
      visibility: prev.visibility === 'public' ? 'private' : 'public',
    }));
  }, []);

  const handleSelectGame = useCallback(
    (gameId: string) => {
      if (
        playableGames.length &&
        !playableGames.some((game) => game.id === gameId)
      ) {
        return;
      }
      setState((prev) => ({ ...prev, gameId }));
    },
    [playableGames],
  );

  const handleSubmit = useCallback(async () => {
    if (!tokens.accessToken) {
      Alert.alert(
        t('games.alerts.signInRequiredTitle'),
        t('games.create.alerts.signInMessage'),
      );
      return;
    }
    if (!state.name.trim()) {
      Alert.alert(
        t('games.create.alerts.nameRequiredTitle'),
        t('games.create.alerts.nameRequiredMessage'),
      );
      return;
    }
    const maxPlayers = state.maxPlayers.trim()
      ? Number(state.maxPlayers)
      : undefined;
    if (
      maxPlayers !== undefined &&
      (Number.isNaN(maxPlayers) || maxPlayers < 2)
    ) {
      Alert.alert(
        t('games.create.alerts.invalidPlayersTitle'),
        t('games.create.alerts.invalidPlayersMessage'),
      );
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const payload: CreateGameRoomParams = {
        gameId: state.gameId,
        name: state.name.trim(),
        visibility: state.visibility,
        maxPlayers,
        notes: state.notes.trim() || undefined,
      };
      const response = await createGameRoom(payload, {
        accessToken: tokens.accessToken,
        refreshTokens,
      });
      Alert.alert(
        t('games.create.alerts.roomCreatedTitle'),
        t('games.create.alerts.roomCreatedMessage', {
          code:
            response.room.inviteCode ?? t('games.create.alerts.invitePending'),
        }),
      );
      router.replace({ pathname: '/games/[id]', params: { id: state.gameId } });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('games.create.alerts.createFailedMessage');
      Alert.alert(t('games.create.alerts.createFailedTitle'), message);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    refreshTokens,
    router,
    state.gameId,
    state.maxPlayers,
    state.name,
    state.notes,
    state.visibility,
    t,
    tokens.accessToken,
  ]);

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <AlertFallback />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <ThemedText type="title">{t('games.create.title')}</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              {t('games.create.subtitle')}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">
              {t('games.create.sectionGame')}
            </ThemedText>
            <View style={styles.gameSelector}>
              {availableGames.map((game) => {
                const isActive = game.id === state.gameId;
                const isDisabled =
                  Boolean(playableGames.length) && !game.isPlayable;
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={[
                      styles.gameTile,
                      isActive && styles.gameTileActive,
                      isDisabled && styles.gameTileDisabled,
                    ]}
                    onPress={() => {
                      if (isDisabled) {
                        Alert.alert(
                          t('games.create.alerts.gameUnavailableTitle'),
                          t('games.create.alerts.gameUnavailableMessage'),
                        );
                        return;
                      }
                      handleSelectGame(game.id);
                    }}
                    disabled={isDisabled}
                  >
                    <ThemedText
                      style={[
                        styles.gameTileName,
                        isActive && styles.gameTileNameActive,
                        isDisabled && styles.gameTileNameDisabled,
                      ]}
                    >
                      {game.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.gameTileSummary,
                        isActive && styles.gameTileSummaryActive,
                        isDisabled && styles.gameTileSummaryDisabled,
                      ]}
                      numberOfLines={2}
                    >
                      {game.summary}
                    </ThemedText>
                    {isDisabled ? (
                      <ThemedText style={styles.gameTileBadge}>
                        {t('games.create.badgeComingSoon')}
                      </ThemedText>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">
              {t('games.create.sectionDetails')}
            </ThemedText>
            <View style={styles.formGroup}>
              <View style={styles.formField}>
                <ThemedText style={styles.inputLabel}>
                  {t('games.create.fieldName')}
                </ThemedText>
                <ThemedTextInput
                  placeholder={t('games.create.namePlaceholder', {
                    example: selectedGame?.name ?? t('games.rooms.unknownGame'),
                  })}
                  value={state.name}
                  onChangeText={handleChange('name')}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.formFieldRow}>
                <View style={styles.formFieldHalf}>
                  <ThemedText style={styles.inputLabel}>
                    {t('games.create.fieldMaxPlayers')}
                  </ThemedText>
                  <ThemedTextInput
                    placeholder={t('games.create.autoPlaceholder')}
                    value={state.maxPlayers}
                    onChangeText={handleChange('maxPlayers')}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <ThemedText style={styles.inputLabel}>
                    {t('games.create.fieldVisibility')}
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.visibilityToggle,
                      state.visibility === 'public'
                        ? styles.visibilityTogglePublic
                        : styles.visibilityTogglePrivate,
                    ]}
                    onPress={handleToggleVisibility}
                    accessibilityRole="button"
                    accessibilityState={{
                      checked: state.visibility === 'public',
                    }}
                  >
                    <IconSymbol
                      name={
                        state.visibility === 'public' ? 'sparkles' : 'lock.fill'
                      }
                      size={18}
                      color={styles.visibilityToggleIcon.color as string}
                    />
                    <ThemedText style={styles.visibilityToggleText}>
                      {state.visibility === 'public'
                        ? t('games.create.visibilityPublic')
                        : t('games.create.visibilityPrivate')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.formField}>
                <ThemedText style={styles.inputLabel}>
                  {t('games.create.fieldNotes')}
                </ThemedText>
                <ThemedTextInput
                  placeholder={t('games.create.notesPlaceholder')}
                  value={state.notes}
                  onChangeText={handleChange('notes')}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">
              {t('games.create.sectionPreview')}
            </ThemedText>
            <ThemedView style={styles.previewCard}>
              <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
                {selectedGame?.name}
              </ThemedText>
              <ThemedText style={styles.previewSummary}>
                {selectedGame?.tagline}
              </ThemedText>
              <View style={styles.previewMetaRow}>
                <MetaChip
                  label={selectedGame?.players ?? ''}
                  icon="person.3.fill"
                />
                <MetaChip
                  label={selectedGame?.duration ?? ''}
                  icon="clock.fill"
                />
                <MetaChip
                  label={selectedGame?.mechanics[0] ?? ''}
                  icon="sparkles"
                />
              </View>
            </ThemedView>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.submitButton,
            state.loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={state.loading}
        >
          <ThemedText style={styles.submitButtonText}>
            {state.loading
              ? t('games.create.submitCreating')
              : t('games.common.createRoom')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

function AlertFallback() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.alertFallback}>
      <ActivityIndicator
        size="large"
        color={styles.alertFallbackSpinner.color as string}
      />
      <IconSymbol
        name="sparkles"
        size={36}
        color={styles.alertFallbackIcon.color as string}
      />
      <ThemedText style={styles.alertFallbackText}>
        Hold tight while we load your session...
      </ThemedText>
    </View>
  );
}

function ThemedTextInput(props: React.ComponentProps<typeof TextInput>) {
  const styles = useThemedStyles(createStyles);
  return (
    <TextInput
      {...props}
      style={[
        styles.textInput,
        props.multiline && styles.textInputMultiline,
        props.style,
      ]}
      placeholderTextColor={styles.textInputPlaceholder.color as string}
    />
  );
}

function MetaChip({
  label,
  icon,
}: {
  label: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaChip}>
      <IconSymbol
        name={icon}
        size={16}
        color={styles.metaChipIcon.color as string}
      />
      <ThemedText style={styles.metaChipText}>{label}</ThemedText>
    </View>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.isLight;
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const surfaceShadow = isLight
    ? 'rgba(15, 23, 42, 0.08)'
    : 'rgba(8, 10, 15, 0.45)';
  const disabledText = isLight ? '#8E97A7' : '#5A606D';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 20,
      paddingBottom: 120,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    alertFallback: {
      alignItems: 'center',
      gap: 12,
    },
    alertFallbackSpinner: {
      color: palette.tint,
    },
    alertFallbackIcon: {
      color: palette.tint,
    },
    alertFallbackText: {
      color: palette.icon,
    },
    visibilityToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: raisedBackground,
    },
    visibilityTogglePublic: {
      backgroundColor: '#1fb6ff33',
      borderColor: '#1fb6ff66',
    },
    visibilityTogglePrivate: {
      backgroundColor: '#bf5af233',
      borderColor: '#bf5af266',
    },
    visibilityToggleIcon: {
      color: palette.tint,
    },
    visibilityToggleText: {
      color: palette.tint,
      fontWeight: '600',
    },
    section: {
      gap: 12,
    },
    sectionSubtitle: {
      color: palette.icon,
      lineHeight: 20,
    },
    gameSelector: {
      gap: 12,
    },
    gameTile: {
      padding: 16,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: palette.background,
      gap: 6,
    },
    gameTileActive: {
      backgroundColor: cardBackground,
      borderColor: palette.tint,
    },
    gameTileDisabled: {
      opacity: 0.6,
      borderStyle: 'dashed',
      borderColor: disabledText,
    },
    gameTileName: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 16,
    },
    gameTileNameActive: {
      color: palette.tint,
    },
    gameTileNameDisabled: {
      color: disabledText,
    },
    gameTileSummary: {
      color: palette.icon,
      lineHeight: 18,
    },
    gameTileSummaryActive: {
      color: palette.text,
    },
    gameTileSummaryDisabled: {
      color: disabledText,
    },
    gameTileBadge: {
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: raisedBackground,
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    formGroup: {
      gap: 16,
    },
    formField: {
      gap: 8,
    },
    formFieldRow: {
      flexDirection: 'row',
      gap: 16,
    },
    formFieldHalf: {
      flex: 1,
      gap: 8,
    },
    inputLabel: {
      color: palette.icon,
      fontWeight: '600',
    },
    textInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: palette.text,
      backgroundColor: palette.background,
    },
    textInputMultiline: {
      height: 100,
    },
    textInputPlaceholder: {
      color: palette.icon,
    },
    previewCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 20,
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    previewTitle: {
      color: palette.text,
    },
    previewSummary: {
      color: palette.icon,
      lineHeight: 20,
    },
    previewMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: raisedBackground,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    metaChipIcon: {
      color: palette.tint,
    },
    metaChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    submitButton: {
      margin: 24,
      borderRadius: 16,
      backgroundColor: palette.tint,
      alignItems: 'center',
      paddingVertical: 16,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 17,
    },
  });
}
