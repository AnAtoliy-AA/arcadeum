import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { useWalletBalance } from '@/features/wallet/api/useWallet';
import { useConversionRate } from '../api/useConversionRate';
import { useConvertGems } from '../api/useConvertGems';

export function ConvertGemsForm() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { data: balance } = useWalletBalance();
  const { data: rate } = useConversionRate();
  const convertGems = useConvertGems();

  const [gemsInput, setGemsInput] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);

  const gemsValue = parseInt(gemsInput, 10);
  const isValidInput = !Number.isNaN(gemsValue) && gemsValue > 0;
  const coinsOut =
    isValidInput && rate ? Math.floor(gemsValue * rate.coinsPerGem) : 0;

  const currentGems = balance?.gems ?? 0;
  const hasEnough = isValidInput && gemsValue <= currentGems;

  const handleChangeText = useCallback((text: string) => {
    setGemsInput(text.replace(/[^0-9]/g, ''));
    setInlineError(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!isValidInput) {
      setInlineError(t('gems.convert.errorInvalidAmount'));
      return;
    }
    if (!hasEnough) {
      setInlineError(t('gems.convert.errorInsufficientFunds'));
      return;
    }
    const conversionId = Crypto.randomUUID();
    setInlineError(null);
    try {
      await convertGems.mutateAsync({ gems: gemsValue, conversionId });
      setGemsInput('');
    } catch {
      setInlineError(t('gems.convert.errorFailed'));
    }
  }, [convertGems, gemsValue, hasEnough, isValidInput, t]);

  if (!rate) {
    return null;
  }

  return (
    <View style={styles.container} testID="convert-gems-form">
      <ThemedText style={styles.title}>{t('gems.convert.title')}</ThemedText>
      <ThemedText style={styles.rateLabel}>
        {t('gems.convert.rateLabel')
          .replace('{gemsPerCoin}', String(rate.gemsPerCoin))
          .replace('{coinsPerGem}', String(rate.coinsPerGem))}
      </ThemedText>

      <ThemedText style={styles.balanceLabel}>
        {t('gems.convert.currentGems').replace('{gems}', String(currentGems))}
      </ThemedText>

      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <ThemedText style={styles.inputLabel}>
            {t('gems.convert.gemsLabel')}
          </ThemedText>
          <TextInput
            style={styles.input}
            value={gemsInput}
            onChangeText={handleChangeText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#64748b"
            testID="convert-gems-input"
            accessibilityLabel={t('gems.convert.gemsLabel')}
          />
        </View>

        <ThemedText style={styles.arrow}>{'->'}</ThemedText>

        <View style={styles.inputWrapper}>
          <ThemedText style={styles.inputLabel}>
            {t('gems.convert.coinsLabel')}
          </ThemedText>
          <View style={styles.coinsDisplay} testID="convert-coins-out">
            <ThemedText style={styles.coinsValue}>
              {isValidInput ? coinsOut.toLocaleString() : '0'}
            </ThemedText>
          </View>
        </View>
      </View>

      {inlineError !== null && (
        <ThemedText style={styles.error} testID="convert-gems-error">
          {inlineError}
        </ThemedText>
      )}

      <Pressable
        style={[
          styles.confirmBtn,
          (!isValidInput || convertGems.isPending) && styles.confirmBtnDisabled,
        ]}
        onPress={() => void handleConfirm()}
        disabled={!isValidInput || convertGems.isPending}
        testID="convert-gems-submit"
        accessibilityRole="button"
      >
        {convertGems.isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText style={styles.confirmText}>
            {t('gems.convert.confirm')}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      margin: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      gap: 12,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: palette.text,
    },
    rateLabel: {
      fontSize: 13,
      color: palette.icon,
    },
    balanceLabel: {
      fontSize: 13,
      color: palette.icon,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    inputWrapper: {
      flex: 1,
      gap: 4,
    },
    inputLabel: {
      fontSize: 12,
      color: palette.icon,
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: palette.text,
      backgroundColor: palette.background,
    },
    arrow: {
      fontSize: 18,
      color: palette.icon,
      paddingBottom: 10,
    },
    coinsDisplay: {
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: 'rgba(148,163,184,0.08)',
    },
    coinsValue: {
      fontSize: 16,
      color: palette.text,
      fontWeight: '600',
    },
    error: {
      fontSize: 13,
      color: '#ef4444',
    },
    confirmBtn: {
      backgroundColor: palette.tint,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 4,
    },
    confirmBtnDisabled: {
      opacity: 0.5,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: '700',
      color: palette.background,
    },
  });
}
