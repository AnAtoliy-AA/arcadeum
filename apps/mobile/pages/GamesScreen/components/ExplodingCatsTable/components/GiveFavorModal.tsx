import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from '@/lib/i18n';
import type { ExplodingCatsCard } from '../types';
import { ExplodingCatsCard as CardArtwork } from '@/components/cards';
import { CARD_ART_SETTINGS } from '../constants';

interface GiveFavorModalProps {
  visible: boolean;
  requesterName: string;
  myHand: ExplodingCatsCard[];
  onGiveCard: (card: ExplodingCatsCard) => void;
}

const CARD_DISPLAY_NAMES: Record<ExplodingCatsCard, string> = {
  exploding_cat: 'Exploding Cat',
  defuse: 'Defuse',
  attack: 'Attack',
  skip: 'Skip',
  favor: 'Favor',
  shuffle: 'Shuffle',
  see_the_future: 'See the Future',
  nope: 'Nope',
  tacocat: 'Tacocat',
  hairy_potato_cat: 'Hairy Potato Cat',
  rainbow_ralphing_cat: 'Rainbow Cat',
  cattermelon: 'Cattermelon',
  bearded_cat: 'Bearded Cat',
};

export function GiveFavorModal({
  visible,
  requesterName,
  myHand,
  onGiveCard,
}: GiveFavorModalProps) {
  const { t } = useTranslation();
  // Track by index to handle duplicate cards
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedIndex !== null && myHand[selectedIndex]) {
      onGiveCard(myHand[selectedIndex]);
      setSelectedIndex(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>
            🤲 {t('games.table.giveFavor.title')}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t('games.table.giveFavor.description', { player: requesterName })}
          </ThemedText>

          <ScrollView
            style={styles.cardScrollContainer}
            contentContainerStyle={styles.cardGrid}
            showsVerticalScrollIndicator={false}
          >
            {myHand.map((card, index) => {
              const cardArt =
                CARD_ART_SETTINGS[card] ?? CARD_ART_SETTINGS.exploding_cat;
              return (
                <TouchableOpacity
                  key={`${card}-${index}`}
                  style={[
                    styles.cardOption,
                    selectedIndex === index && styles.cardOptionSelected,
                  ]}
                  onPress={() => setSelectedIndex(index)}
                >
                  <View style={styles.cardArtwork}>
                    <CardArtwork
                      card={cardArt.key}
                      variant={cardArt.variant}
                      width={50}
                      height={70}
                    />
                  </View>
                  <ThemedText style={styles.cardName}>
                    {CARD_DISPLAY_NAMES[card] || card}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedIndex === null && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedIndex === null}
          >
            <ThemedText style={styles.confirmText}>
              {t('games.table.giveFavor.confirm')}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardScrollContainer: {
    maxHeight: 300,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  cardOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 80,
  },
  cardOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  cardArtwork: {
    marginBottom: 4,
  },
  cardName: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.8,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.6,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
