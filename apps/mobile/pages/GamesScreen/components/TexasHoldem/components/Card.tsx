import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card as CardType } from '../types';
import { getSuitColor, getSuitSymbol } from '../utils';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

interface CardProps {
  card: CardType;
  index: number;
}

const Card: React.FC<CardProps> = ({ card, index }) => {
  const styles = useThemedStyles(createStyles);
  const suitColor = getSuitColor(card.suit);
  
  return (
    <View key={`${card.suit}-${card.rank}-${index}`} style={styles.card}>
      <Text style={[styles.cardRank, { color: suitColor }]}>{card.rank}</Text>
      <Text style={[styles.cardSuit, { color: suitColor }]}>
        {getSuitSymbol(card.suit)}
      </Text>
    </View>
  );
};

function createStyles(palette: Palette) {
  return StyleSheet.create({
    card: {
      width: 50,
      height: 70,
      backgroundColor: palette.cardBackground,
      borderRadius: 8,
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: palette.icon,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    cardRank: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    cardSuit: {
      fontSize: 16,
    },
  });
}

export default Card;
