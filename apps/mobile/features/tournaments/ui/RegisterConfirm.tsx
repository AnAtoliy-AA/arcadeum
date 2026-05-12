import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

export interface RegisterConfirmLabels {
  title: string;
  /** Use {fee} and {balance} as placeholders. */
  body: string;
  confirm: string;
  cancel: string;
  errors: { insufficientFunds: string };
}

export interface RegisterConfirmProps {
  tournamentId: string;
  entryFeeCoins: number;
  /** Pass null if wallet balance is unavailable; dialog omits balance line. */
  currentBalanceCoins: number | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Called with tournamentId, should throw on failure. */
  onRegister: (id: string) => Promise<void>;
  labels: RegisterConfirmLabels;
}

export function RegisterConfirm({
  tournamentId,
  entryFeeCoins,
  currentBalanceCoins,
  visible,
  onClose,
  onSuccess,
  onRegister,
  labels,
}: RegisterConfirmProps) {
  const styles = useThemedStyles(createStyles);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const hasEnoughBalance =
    currentBalanceCoins === null || currentBalanceCoins >= entryFeeCoins;

  const bodyText =
    currentBalanceCoins !== null
      ? labels.body
          .replace('{fee}', entryFeeCoins.toLocaleString())
          .replace('{balance}', currentBalanceCoins.toLocaleString())
      : labels.body
          .replace(' Your balance: {balance} coins.', '')
          .replace(' Tu saldo: {balance} monedas.', '')
          .replace(' Votre solde : {balance} pièces.', '')
          .replace('{fee}', entryFeeCoins.toLocaleString());

  const handleConfirm = async () => {
    if (!hasEnoughBalance) {
      setErrorMsg(labels.errors.insufficientFunds);
      return;
    }
    setErrorMsg(null);
    setIsPending(true);
    try {
      await onRegister(tournamentId);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : '';
      if (message === 'wallet.insufficientFunds') {
        setErrorMsg(labels.errors.insufficientFunds);
      } else {
        setErrorMsg(labels.errors.insufficientFunds);
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    if (isPending) return;
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID="register-confirm-modal"
    >
      <View style={styles.overlay}>
        <View style={styles.dialog} testID="register-confirm-dialog">
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {labels.title}
          </ThemedText>

          <ThemedText style={styles.body}>{bodyText}</ThemedText>

          {errorMsg !== null && (
            <ThemedText
              style={styles.errorText}
              testID="register-confirm-error"
            >
              {errorMsg}
            </ThemedText>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.btn, styles.cancelBtn]}
              onPress={handleClose}
              disabled={isPending}
              testID="register-confirm-cancel"
            >
              <ThemedText style={styles.cancelText}>{labels.cancel}</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.confirmBtn]}
              onPress={() => void handleConfirm()}
              disabled={isPending}
              testID="register-confirm-submit"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.confirmText}>
                  {labels.confirm}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    dialog: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      padding: 24,
      gap: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
    },
    title: {
      fontSize: 17,
      color: palette.text,
    },
    body: {
      fontSize: 14,
      color: palette.text,
      lineHeight: 20,
      opacity: 0.85,
    },
    errorText: {
      fontSize: 13,
      color: '#ef4444',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 4,
    },
    btn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      minWidth: 80,
      alignItems: 'center',
    },
    cancelBtn: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    confirmBtn: {
      backgroundColor: palette.tint,
    },
    confirmText: {
      fontSize: 14,
      fontWeight: '700',
      color: palette.background,
    },
  });
}
