import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BettingRound } from '../types';
import { useTranslation } from '@/lib/i18n';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

interface PotInfoProps {
  pot: number;
  bettingRound: BettingRound;
  currentBet: number;
}

const PotInfo: React.FC<PotInfoProps> = ({ pot, bettingRound, currentBet }) => {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <>
      <View style={styles.potContainer}>
        <Text style={styles.potText}>
          {t('games.texasHoldem.pot', { amount: pot })} |{' '}
          {t('games.texasHoldem.round', { round: bettingRound })}
        </Text>
      </View>
      {currentBet > 0 && (
        <Text style={styles.infoText}>
          {t('games.texasHoldem.currentBet', { amount: currentBet })}
        </Text>
      )}
    </>
  );
};

function createStyles(palette: Palette) {
  const isLight = palette.isLight;

  return StyleSheet.create({
    potContainer: {
      backgroundColor: isLight
        ? 'rgba(0, 0, 0, 0.1)'
        : 'rgba(255, 255, 255, 0.1)',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginBottom: 16,
    },
    potText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    infoText: {
      textAlign: 'center',
      color: palette.icon,
      fontSize: 14,
      padding: 16,
    },
  });
}

export default PotInfo;
