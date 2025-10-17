import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export interface InviteCodeDialogProps {
  visible: boolean;
  roomName?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (code: string) => void;
  onCancel: () => void;
}

export function InviteCodeDialog({
  visible,
  roomName,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
}: InviteCodeDialogProps) {
  const styles = useThemedStyles(createStyles);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!visible) {
      setCode('');
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
  }, [code, onSubmit]);

  const handleChange = useCallback((value: string) => {
    setCode(value.toUpperCase());
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <TouchableWithoutFeedback onPress={loading ? undefined : onCancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <IconSymbol name="lock.fill" size={20} color={styles.headerIcon.color as string} />
            <ThemedText type="subtitle">
              Enter invite code
            </ThemedText>
          </View>
          <ThemedText style={styles.description}>
            {roomName
              ? `This lobby is invite-only. Ask the host for their code to join “${roomName}”.`
              : 'This lobby is invite-only. Enter the code from the host to join.'}
          </ThemedText>
          <TextInput
            value={code}
            onChangeText={handleChange}
            placeholder="ABC123"
            placeholderTextColor={styles.inputPlaceholder.color as string}
            autoCapitalize="characters"
            autoCorrect={false}
            textAlign="center"
            style={styles.input}
            editable={!loading}
          />
          {error ? (
            <View style={styles.errorRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color={styles.errorText.color as string} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <ThemedText style={styles.secondaryButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color={styles.primaryButtonText.color as string} />
              ) : (
                <ThemedText style={styles.primaryButtonText}>Join room</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const overlayBackground = 'rgba(0, 0, 0, 0.55)';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: overlayBackground,
    },
    sheet: {
      width: '85%',
      borderRadius: 20,
      padding: 24,
      gap: 16,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(0, 0, 0, 0.6)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 10,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIcon: {
      color: palette.tint,
    },
    description: {
      color: palette.icon,
      lineHeight: 20,
      textAlign: 'center',
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 4,
      color: palette.text,
      backgroundColor: palette.background,
    },
    inputPlaceholder: {
      color: palette.icon,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'center',
    },
    errorText: {
      color: '#F97316',
      fontSize: 13,
      fontWeight: '600',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    primaryButton: {
      backgroundColor: palette.tint,
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    secondaryButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: palette.background,
    },
    secondaryButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
  });
}
