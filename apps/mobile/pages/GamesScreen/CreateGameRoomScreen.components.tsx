import React from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import type {
  CreateGameRoomFieldChangeHandler,
  CreateGameRoomState,
} from './CreateGameRoomScreen.hooks';
import type { CreateGameRoomStyles } from './CreateGameRoomScreen.styles';
import type { GameCatalogueEntry } from './catalog';

interface IntroSectionProps {
  title: string;
  subtitle: string;
  styles: CreateGameRoomStyles;
}

export function IntroSection({
  title,
  subtitle,
  styles,
}: IntroSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText style={styles.sectionSubtitle}>{subtitle}</ThemedText>
    </View>
  );
}

interface GameSelectionSectionProps {
  availableGames: GameCatalogueEntry[];
  playableGames: GameCatalogueEntry[];
  selectedGameId: string;
  sectionTitle: string;
  comingSoonLabel: string;
  disabledAlertTitle: string;
  disabledAlertMessage: string;
  onSelectGame: (gameId: string) => void;
  styles: CreateGameRoomStyles;
}

export function GameSelectionSection({
  availableGames,
  playableGames,
  selectedGameId,
  sectionTitle,
  comingSoonLabel,
  disabledAlertTitle,
  disabledAlertMessage,
  onSelectGame,
  styles,
}: GameSelectionSectionProps): React.JSX.Element {
  const hasPlayableGames = playableGames.length > 0;

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{sectionTitle}</ThemedText>
      <View style={styles.gameSelector}>
        {availableGames.map((game) => {
          const isActive = game.id === selectedGameId;
          const isDisabled = hasPlayableGames && !game.isPlayable;
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
                  Alert.alert(disabledAlertTitle, disabledAlertMessage);
                  return;
                }
                onSelectGame(game.id);
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
                  {comingSoonLabel}
                </ThemedText>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

interface DetailsFormSectionProps {
  sectionTitle: string;
  labels: {
    name: string;
    maxPlayers: string;
    visibility: string;
    notes: string;
  };
  placeholders: {
    name: string;
    maxPlayers: string;
    notes: string;
  };
  visibilityLabels: {
    public: string;
    private: string;
  };
  formState: CreateGameRoomState;
  onChange: CreateGameRoomFieldChangeHandler;
  onToggleVisibility: () => void;
  styles: CreateGameRoomStyles;
}

export function DetailsFormSection({
  sectionTitle,
  labels,
  placeholders,
  visibilityLabels,
  formState,
  onChange,
  onToggleVisibility,
  styles,
}: DetailsFormSectionProps): React.JSX.Element {
  const visibilityText =
    formState.visibility === 'public'
      ? visibilityLabels.public
      : visibilityLabels.private;

  const visibilityIcon =
    formState.visibility === 'public' ? 'sparkles' : 'lock.fill';

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{sectionTitle}</ThemedText>
      <View style={styles.formGroup}>
        <View style={styles.formField}>
          <ThemedText style={styles.inputLabel}>{labels.name}</ThemedText>
          <ThemedTextInput
            styles={styles}
            placeholder={placeholders.name}
            value={formState.name}
            onChangeText={onChange('name')}
            returnKeyType="done"
          />
        </View>
        <View style={styles.formFieldRow}>
          <View style={styles.formFieldHalf}>
            <ThemedText style={styles.inputLabel}>
              {labels.maxPlayers}
            </ThemedText>
            <ThemedTextInput
              styles={styles}
              placeholder={placeholders.maxPlayers}
              value={formState.maxPlayers}
              onChangeText={onChange('maxPlayers')}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>
          <View style={styles.formFieldHalf}>
            <ThemedText style={styles.inputLabel}>
              {labels.visibility}
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.visibilityToggle,
                formState.visibility === 'public'
                  ? styles.visibilityTogglePublic
                  : styles.visibilityTogglePrivate,
              ]}
              onPress={onToggleVisibility}
              accessibilityRole="button"
              accessibilityState={{
                checked: formState.visibility === 'public',
              }}
            >
              <IconSymbol
                name={visibilityIcon}
                size={18}
                color={styles.visibilityToggleIcon.color as string}
              />
              <ThemedText style={styles.visibilityToggleText}>
                {visibilityText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formField}>
          <ThemedText style={styles.inputLabel}>{labels.notes}</ThemedText>
          <ThemedTextInput
            styles={styles}
            placeholder={placeholders.notes}
            value={formState.notes}
            onChangeText={onChange('notes')}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    </View>
  );
}

interface PreviewSectionProps {
  sectionTitle: string;
  selectedGame?: GameCatalogueEntry;
  styles: CreateGameRoomStyles;
}

export function PreviewSection({
  sectionTitle,
  selectedGame,
  styles,
}: PreviewSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">{sectionTitle}</ThemedText>
      <ThemedView style={styles.previewCard}>
        <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
          {selectedGame?.name}
        </ThemedText>
        <ThemedText style={styles.previewSummary}>
          {selectedGame?.tagline}
        </ThemedText>
        <View style={styles.previewMetaRow}>
          <MetaChip
            styles={styles}
            label={selectedGame?.players ?? ''}
            icon="person.3.fill"
          />
          <MetaChip
            styles={styles}
            label={selectedGame?.duration ?? ''}
            icon="clock.fill"
          />
          <MetaChip
            styles={styles}
            label={selectedGame?.mechanics[0] ?? ''}
            icon="sparkles"
          />
        </View>
      </ThemedView>
    </View>
  );
}

interface SubmitButtonProps {
  isLoading: boolean;
  loadingLabel: string;
  label: string;
  onSubmit: () => void;
  styles: CreateGameRoomStyles;
}

export function SubmitButton({
  isLoading,
  loadingLabel,
  label,
  onSubmit,
  styles,
}: SubmitButtonProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
      onPress={onSubmit}
      disabled={isLoading}
    >
      <ThemedText style={styles.submitButtonText}>
        {isLoading ? loadingLabel : label}
      </ThemedText>
    </TouchableOpacity>
  );
}

interface AlertFallbackProps {
  message: string;
  styles: CreateGameRoomStyles;
}

export function AlertFallback({
  message,
  styles,
}: AlertFallbackProps): React.JSX.Element {
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
      <ThemedText style={styles.alertFallbackText}>{message}</ThemedText>
    </View>
  );
}

interface ThemedTextInputProps extends React.ComponentProps<typeof TextInput> {
  styles: CreateGameRoomStyles;
}

export function ThemedTextInput({
  styles,
  ...props
}: ThemedTextInputProps): React.JSX.Element {
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

interface MetaChipProps {
  label: string;
  icon: Parameters<typeof IconSymbol>[0]['name'];
  styles: CreateGameRoomStyles;
}

export function MetaChip({
  label,
  icon,
  styles,
}: MetaChipProps): React.JSX.Element {
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
