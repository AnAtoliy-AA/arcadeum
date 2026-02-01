import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TexasHoldemPlayerState } from '../types';
import Card from './Card';
import { useTranslation } from '@/lib/i18n';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

interface PlayerProps {
  player: TexasHoldemPlayerState;
  isCurrent: boolean;
  isTurn: boolean;
  isDealer: boolean;
}

const Player: React.FC<PlayerProps> = ({
  player,
  isCurrent,
  isTurn,
  isDealer,
}) => {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[
        styles.playerCard,
        isCurrent && styles.currentPlayerCard,
        isTurn && styles.turnPlayerCard,
      ]}
    >
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>
          {player.playerId} {isDealer && '🎯'}
        </Text>
        {player.folded && (
          <View style={[styles.badge, styles.foldedBadge]}>
            <Text style={styles.badgeText}>
              {t('games.texasHoldem.folded')}
            </Text>
          </View>
        )}
        {player.allIn && (
          <View style={[styles.badge, styles.allInBadge]}>
            <Text style={styles.badgeText}>{t('games.texasHoldem.allIn')}</Text>
          </View>
        )}
      </View>

      <Text style={styles.playerInfo}>
        {t('games.texasHoldem.chips', { amount: player.chips })}
      </Text>
      <Text style={styles.playerInfo}>
        {t('games.texasHoldem.bet', { amount: player.currentBet })}
      </Text>

      {/* Player's hand (only show to current user) */}
      {isCurrent && player.hand.length > 0 && (
        <View style={styles.playerHand}>
          {player.hand.map((card, idx) => (
            <Card key={idx} card={card} index={idx} />
          ))}
        </View>
      )}
    </View>
  );
};

function createStyles(palette: Palette) {
  const isLight = palette.isLight;

  return StyleSheet.create({
    playerCard: {
      backgroundColor: isLight ? '#4b5563' : palette.cardBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    currentPlayerCard: {
      backgroundColor: palette.tint,
    },
    turnPlayerCard: {
      borderColor: '#fbbf24',
      shadowColor: '#fbbf24',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 8,
    },
    playerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    playerName: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    foldedBadge: {
      backgroundColor: palette.error,
    },
    allInBadge: {
      backgroundColor: '#f59e0b',
    },
    badgeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
    },
    playerInfo: {
      color: isLight ? '#e5e7eb' : palette.icon,
      fontSize: 14,
      marginTop: 4,
    },
    playerHand: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      justifyContent: 'center',
    },
  });
}

export default Player;
