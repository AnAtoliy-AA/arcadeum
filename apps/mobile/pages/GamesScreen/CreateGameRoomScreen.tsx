import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import {
  AlertFallback,
  DetailsFormSection,
  GameSelectionSection,
  HouseRulesSection,
  IntroSection,
  PreviewSection,
  SubmitButton,
} from './CreateGameRoomScreen.components';
import { useCreateGameRoomController } from './CreateGameRoomScreen.hooks';
import { useCreateGameRoomLabels } from './CreateGameRoomScreen.labels';
import { createStyles } from './CreateGameRoomScreen.styles';

export default function CreateGameRoomScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    shouldBlock,
    availableGames,
    playableGames,
    selectedGame,
    formState,
    handleChange,
    handleToggleVisibility,
    handleToggleActionCardCombos,
    handleToggleIdleTimer,
    handleSelectGame,
    handleSubmit,
    t,
  } = useCreateGameRoomController();

  const labels = useCreateGameRoomLabels(
    t as (key: string, replacements?: Record<string, unknown>) => string,
    selectedGame,
  );

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <AlertFallback
          message={labels.loadingFallbackMessage}
          styles={styles}
        />
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
          <IntroSection
            title={labels.introTitle}
            subtitle={labels.introSubtitle}
            styles={styles}
          />
          <GameSelectionSection
            availableGames={availableGames}
            playableGames={playableGames}
            selectedGameId={formState.gameId}
            sectionTitle={labels.sectionGame}
            comingSoonLabel={labels.comingSoonLabel}
            disabledAlertTitle={labels.disabledAlertTitle}
            disabledAlertMessage={labels.disabledAlertMessage}
            onSelectGame={handleSelectGame}
            styles={styles}
          />
          {selectedGame?.id === 'exploding_kittens_v1' && (
            <HouseRulesSection
              sectionTitle={labels.sectionHouseRules}
              allowActionCardCombos={formState.allowActionCardCombos}
              actionCardCombosLabel={labels.actionCardCombosLabel}
              actionCardCombosHint={labels.actionCardCombosHint}
              onToggleActionCardCombos={handleToggleActionCardCombos}
              idleTimerEnabled={formState.idleTimerEnabled}
              idleTimerLabel={labels.idleTimerLabel}
              idleTimerHint={labels.idleTimerHint}
              onToggleIdleTimer={handleToggleIdleTimer}
              styles={styles}
            />
          )}
          <DetailsFormSection
            sectionTitle={labels.sectionDetails}
            labels={labels.detailLabels}
            placeholders={labels.detailPlaceholders}
            visibilityLabels={labels.visibilityLabels}
            formState={formState}
            onChange={handleChange}
            onToggleVisibility={handleToggleVisibility}
            styles={styles}
          />
          <PreviewSection
            sectionTitle={labels.sectionPreview}
            selectedGame={selectedGame}
            styles={styles}
          />
        </ScrollView>

        <SubmitButton
          isLoading={formState.loading}
          loadingLabel={labels.submitCreatingLabel}
          label={labels.submitLabel}
          onSubmit={handleSubmit}
          styles={styles}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
