import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';

type PaymentStatus = 'idle' | 'pending' | 'success' | 'cancelled';

interface PaymentSessionResponse {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

export default function PaymentScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GEL');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const normalizedAmount = Number(amount.replace(',', '.'));
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setFormError(t('payments.errors.amountRequired'));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setStatus('idle');

    try {
      const response = await fetchWithRefresh(
        resolveApiUrl('/payments/session'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: normalizedAmount,
            currency: currency.trim().toUpperCase(),
            description: note.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`payment-session-failed:${response.status}`);
      }

      const payload = (await response.json()) as PaymentSessionResponse;
      if (!payload?.paymentUrl) {
        throw new Error('payment-session-missing-url');
      }

      setStatus('pending');

      const canLaunch = await Linking.canOpenURL(payload.paymentUrl);
      if (!canLaunch) {
        throw new Error('payment-session-invalid-url');
      }

      await Linking.openURL(payload.paymentUrl);

      setStatus('success');
      setAmount('');
      setNote('');
    } catch (error) {
      console.error('payment-session-error', error);
      setStatus('idle');
      setFormError(t('payments.errors.sessionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, currency, note, t]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={styles.title}>
          {t('payments.title')}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{t('payments.intro')}</ThemedText>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>
            {t('payments.amountLabel')}
          </ThemedText>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            inputMode="decimal"
            value={amount}
            onChangeText={setAmount}
            placeholder={t('payments.amountPlaceholder')}
            placeholderTextColor={styles.placeholder.color as string}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>
            {t('payments.currencyLabel')}
          </ThemedText>
          <TextInput
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            value={currency}
            onChangeText={setCurrency}
            placeholder={t('payments.currencyPlaceholder')}
            placeholderTextColor={styles.placeholder.color as string}
            editable={!isSubmitting}
            maxLength={8}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>
            {t('payments.noteLabel')}
          </ThemedText>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={note}
            onChangeText={setNote}
            placeholder={t('payments.notePlaceholder')}
            placeholderTextColor={styles.placeholder.color as string}
            editable={!isSubmitting}
            multiline
            numberOfLines={3}
          />
        </View>

        {formError ? (
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        ) : null}
        {status !== 'idle' ? (
          <ThemedText
            style={
              status === 'success'
                ? styles.successText
                : status === 'cancelled'
                  ? styles.warningText
                  : styles.infoText
            }
          >
            {t(`payments.status.${status}`)}
          </ThemedText>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color={styles.primaryButtonText.color as string}
            />
          ) : (
            <>
              <IconSymbol
                name="creditcard.fill"
                size={16}
                color={styles.primaryButtonText.color as string}
              />
              <ThemedText style={styles.primaryButtonText}>
                {t('payments.submit')}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 24,
    },
    title: {
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 20,
      color: palette.icon,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    input: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      backgroundColor: palette.cardBackground,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: palette.text,
    },
    multilineInput: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
    placeholder: {
      color: palette.icon,
    },
    errorText: {
      color: palette.destructive,
      fontSize: 14,
    },
    infoText: {
      color: palette.tint,
      fontSize: 14,
    },
    successText: {
      color: palette.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    warningText: {
      color: palette.warning,
      fontSize: 14,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.tint,
      borderRadius: 16,
      paddingVertical: 14,
    },
    disabledButton: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: palette.background,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
