import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { gamesCatalog, type GameCatalogueEntry } from './catalog';
import { createGameRoom, type CreateGameRoomParams } from './api/gamesApi';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';

export default function CreateGameRoomScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ gameId?: string }>();
  const { shouldBlock } = useSessionScreenGate({ enableOn: ['web'], whenUnauthenticated: '/auth', blockWhenUnauthenticated: true });
  const { tokens, refreshTokens } = useSessionTokens();

  const initialGameId = useMemo(() => {
    const value = params?.gameId;
    if (!value) return gamesCatalog[0]?.id ?? '';
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [state, setState] = useState({
    gameId: initialGameId,
    name: '',
    visibility: 'public' as CreateGameRoomParams['visibility'],
    maxPlayers: '',
    notes: '',
    loading: false,
  });

  const selectedGame: GameCatalogueEntry | undefined = useMemo(
    () => gamesCatalog.find(game => game.id === state.gameId) ?? gamesCatalog[0],
    [state.gameId],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/games');
    }
  }, [router]);

  const handleChange = useCallback((field: 'name' | 'maxPlayers' | 'notes') => (value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleVisibility = useCallback(() => {
    setState(prev => ({ ...prev, visibility: prev.visibility === 'public' ? 'private' : 'public' }));
  }, []);

  const handleSelectGame = useCallback((gameId: string) => {
    setState(prev => ({ ...prev, gameId }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!tokens.accessToken) {
      Alert.alert('Sign in required', 'Please sign in again to create a game room.');
      return;
    }
    if (!state.name.trim()) {
      Alert.alert('Name required', 'Give your room a fun name to help friends recognize it.');
      return;
    }
    const maxPlayers = state.maxPlayers.trim() ? Number(state.maxPlayers) : undefined;
    if (maxPlayers !== undefined && (Number.isNaN(maxPlayers) || maxPlayers < 2)) {
      Alert.alert('Invalid player count', 'Max players should be a number greater than or equal to 2.');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
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
      Alert.alert('Room created', `Invite code: ${response.room.inviteCode ?? 'pending'}`);
      router.replace({ pathname: '/games/[id]', params: { id: state.gameId } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create room.';
      Alert.alert('Couldn\'t create room', message);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [refreshTokens, router, state.gameId, state.maxPlayers, state.name, state.notes, state.visibility, tokens.accessToken]);

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <AlertFallback />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name="chevron.left" size={20} color={styles.backButtonText.color as string} />
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.visibilityToggle} onPress={handleToggleVisibility}>
              <IconSymbol
                name={state.visibility === 'public' ? 'sparkles' : 'lock.fill'}
                size={18}
                color={styles.visibilityToggleText.color as string}
              />
              <ThemedText style={styles.visibilityToggleText}>
                {state.visibility === 'public' ? 'Public room' : 'Private room'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText type="title">Create a room</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Pick your game, name the lobby, and share the invite with your crew.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">Game</ThemedText>
            <View style={styles.gameSelector}>
              {gamesCatalog.map(game => {
                const isActive = game.id === state.gameId;
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.gameTile, isActive && styles.gameTileActive]}
                    onPress={() => handleSelectGame(game.id)}
                  >
                    <ThemedText style={[styles.gameTileName, isActive && styles.gameTileNameActive]}>{game.name}</ThemedText>
                    <ThemedText style={[styles.gameTileSummary, isActive && styles.gameTileSummaryActive]} numberOfLines={2}>
                      {game.summary}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">Room details</ThemedText>
            <View style={styles.formGroup}>
              <View style={styles.formField}>
                <ThemedText style={styles.inputLabel}>Room name</ThemedText>
                <ThemedTextInput
                  placeholder={`e.g. ${selectedGame?.name ?? 'Game'} squad`}
                  value={state.name}
                  onChangeText={handleChange('name')}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.formFieldRow}>
                <View style={styles.formFieldHalf}>
                  <ThemedText style={styles.inputLabel}>Max players</ThemedText>
                  <ThemedTextInput
                    placeholder="Auto"
                    value={state.maxPlayers}
                    onChangeText={handleChange('maxPlayers')}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <ThemedText style={styles.inputLabel}>Visibility</ThemedText>
                  <View style={[styles.pill, state.visibility === 'public' ? styles.pillPublic : styles.pillPrivate]}>
                    <ThemedText style={styles.pillText}>{state.visibility === 'public' ? 'Public' : 'Private'}</ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.formField}>
                <ThemedText style={styles.inputLabel}>Notes</ThemedText>
                <ThemedTextInput
                  placeholder="Rules, house twists, or reminders"
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
            <ThemedText type="subtitle">Preview</ThemedText>
            <ThemedView style={styles.previewCard}>
              <ThemedText type="defaultSemiBold" style={styles.previewTitle}>{selectedGame?.name}</ThemedText>
              <ThemedText style={styles.previewSummary}>{selectedGame?.tagline}</ThemedText>
              <View style={styles.previewMetaRow}>
                <MetaChip label={selectedGame?.players ?? ''} icon="person.3.fill" />
                <MetaChip label={selectedGame?.duration ?? ''} icon="clock.fill" />
                <MetaChip label={selectedGame?.mechanics[0] ?? ''} icon="sparkles" />
              </View>
            </ThemedView>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, state.loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={state.loading}
        >
          <ThemedText style={styles.submitButtonText}>{state.loading ? 'Creating...' : 'Create room'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

function AlertFallback() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.alertFallback}>
      <ActivityIndicator size="large" color={styles.alertFallbackSpinner.color as string} />
      <IconSymbol name="sparkles" size={36} color={styles.alertFallbackIcon.color as string} />
      <ThemedText style={styles.alertFallbackText}>Hold tight while we load your session...</ThemedText>
    </View>
  );
}

function ThemedTextInput(props: React.ComponentProps<typeof TextInput>) {
  const styles = useThemedStyles(createStyles);
  return (
    <TextInput
      {...props}
      style={[styles.textInput, props.multiline && styles.textInputMultiline, props.style]}
      placeholderTextColor={styles.textInputPlaceholder.color as string}
    />
  );
}

function MetaChip({ label, icon }: { label: string; icon: Parameters<typeof IconSymbol>[0]['name'] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.metaChip}>
      <IconSymbol name={icon} size={16} color={styles.metaChipIcon.color as string} />
      <ThemedText style={styles.metaChipText}>{label}</ThemedText>
    </View>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const surfaceShadow = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(8, 10, 15, 0.45)';

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
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    visibilityToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
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
    gameTileName: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 16,
    },
    gameTileNameActive: {
      color: palette.tint,
    },
    gameTileSummary: {
      color: palette.icon,
      lineHeight: 18,
    },
    gameTileSummaryActive: {
      color: palette.text,
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
    pill: {
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillPublic: {
      backgroundColor: '#1fb6ff33',
    },
    pillPrivate: {
      backgroundColor: '#bf5af233',
    },
    pillText: {
      color: palette.text,
      fontWeight: '600',
    },
    previewCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 20,
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
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
