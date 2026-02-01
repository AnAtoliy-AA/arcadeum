import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTranslation } from '@/lib/i18n';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

interface ControlsProps {
  actionBusy: 'draw' | 'fold' | 'check' | 'call' | 'raise' | 'all-in' | null;
  callAmount: number;
  onAction: (
    action: 'fold' | 'check' | 'call' | 'raise',
    raiseAmount?: number,
  ) => void;
}

const Controls: React.FC<ControlsProps> = ({
  actionBusy,
  callAmount,
  onAction,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const [raiseAmount, setRaiseAmount] = useState<string>('20');

  const handleRaise = useCallback(() => {
    const amount = parseInt(raiseAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      onAction('raise', amount);
    }
  }, [raiseAmount, onAction]);

  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={[styles.button, styles.dangerButton]}
        onPress={() => onAction('fold')}
        disabled={actionBusy === 'fold'}
      >
        <Text style={styles.buttonText}>
          {actionBusy === 'fold'
            ? t('games.texasHoldem.folding')
            : t('games.texasHoldem.fold')}
        </Text>
      </TouchableOpacity>

      {callAmount === 0 ? (
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => onAction('check')}
          disabled={actionBusy === 'check'}
        >
          <Text style={styles.buttonText}>
            {actionBusy === 'check'
              ? t('games.texasHoldem.checking')
              : t('games.texasHoldem.check')}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => onAction('call')}
          disabled={actionBusy === 'call'}
        >
          <Text style={styles.buttonText}>
            {actionBusy === 'call'
              ? t('games.texasHoldem.calling')
              : t('games.texasHoldem.call', { amount: callAmount })}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.raiseContainer}>
        <TextInput
          style={styles.raiseInput}
          value={raiseAmount}
          onChangeText={setRaiseAmount}
          keyboardType="numeric"
          placeholder={t('games.texasHoldem.raiseAmount')}
          placeholderTextColor={styles.placeholderColor.color}
        />
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleRaise}
          disabled={actionBusy === 'raise'}
        >
          <Text style={styles.buttonText}>
            {actionBusy === 'raise'
              ? t('games.texasHoldem.raising')
              : t('games.texasHoldem.raise')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function createStyles(palette: Palette) {
  const isLight = palette.isLight;

  return StyleSheet.create({
    controls: {
      padding: 16,
      gap: 12,
      backgroundColor: isLight
        ? 'rgba(0, 0, 0, 0.05)'
        : 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      margin: 16,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: '#10b981',
    },
    secondaryButton: {
      backgroundColor: palette.icon,
    },
    dangerButton: {
      backgroundColor: palette.error,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    raiseContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    raiseInput: {
      flex: 1,
      backgroundColor: palette.cardBackground,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isLight ? '#d1d5db' : palette.icon + '40',
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: palette.text,
    },
    placeholderColor: {
      color: palette.icon,
    },
  });
}

export default Controls;
