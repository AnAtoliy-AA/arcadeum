import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameResultModal } from './GameResultModal';

const mockTranslation = (key: string) => {
  const dictionary: Record<string, string> = {
    'games.table.victory.title': 'Victory!',
    'games.table.victory.message': 'You won the match! Excellent strategy.',
    'games.table.defeat.title': 'Defeat',
    'games.table.defeat.message': 'Better luck next time. Analyze your moves.',
    'games.table.draw.title': 'Draw',
    'games.table.draw.message': 'The battle ended in a stalemate.',
    'games.ranking.ratingUpdated': 'Rating Updated',
    'games.table.rematch.button': 'Request Rematch',
    'games.table.rematch.loading': 'Waiting for opponent...',
    'games.common.actions.backToHome': 'Back to Home',
    'games.table.modals.common.close': 'Close',
  };
  return dictionary[key] ?? key;
};

const meta: Meta<typeof GameResultModal> = {
  title: 'Features/Games/GameResultModal',
  component: GameResultModal,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GameResultModal>;

export const Victory: Story = {
  args: {
    isOpen: true,
    result: 'victory',
    t: mockTranslation,
    onRematch: () => {},
    onClose: () => {},
  },
};

export const Defeat: Story = {
  args: {
    isOpen: true,
    result: 'defeat',
    t: mockTranslation,
    onRematch: () => {},
    onClose: () => {},
  },
};

export const Draw: Story = {
  args: {
    isOpen: true,
    result: 'draw',
    t: mockTranslation,
    onRematch: () => {},
    onClose: () => {},
  },
};

export const ThemedCyberpunkVictoryWithStats: Story = {
  args: {
    isOpen: true,
    result: 'victory',
    theme: 'cyberpunk',
    t: mockTranslation,
    stats: {
      duration: 245,
      turns: 28,
      score: 1450,
      accuracy: '94%',
    },
    ratingDelta: {
      elo: 1620,
      tier: 'diamond',
      delta: 24,
    },
    onRematch: () => {},
    onClose: () => {},
  },
};

export const ThemedUnderwaterDefeat: Story = {
  args: {
    isOpen: true,
    result: 'defeat',
    theme: 'underwater',
    t: mockTranslation,
    stats: {
      duration: 180,
      turns: 15,
      score: 320,
    },
    ratingDelta: {
      elo: 1480,
      tier: 'platinum',
      delta: -18,
    },
    onRematch: () => {},
    onClose: () => {},
  },
};
