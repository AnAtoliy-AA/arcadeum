import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card as CardType } from '../types';
import Card from './Card';

interface CommunityCardsProps {
  cards: CardType[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  if (cards.length === 0) return null;

  return (
    <View style={styles.communityCards}>
      {cards.map((card, idx) => (
        <Card key={idx} card={card} index={idx} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  communityCards: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default CommunityCards;
