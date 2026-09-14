import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlatformComparisonTable } from './PlatformComparisonTable';

const meta: Meta<typeof PlatformComparisonTable> = {
  title: 'Shared/PlatformComparisonTable',
  component: PlatformComparisonTable,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlatformComparisonTable>;

export const ArcadeumAdvantagesOnly: Story = {
  args: {
    title: 'Arcadeum Games Chess Advantages & Capabilities',
    kicker: 'Platform Features',
    subtitle: 'Grandmaster-grade engine analysis and competitive features included for all players.',
    columns: [
      { key: 'arcadeum', name: 'Arcadeum Games', isHighlighted: true, badge: '100% Free · Included' },
    ],
    rows: [
      {
        feature: 'Stockfish 19 NNUE Engine',
        hint: 'SFNNv16 neural network running at 3500+ Elo depth',
        values: { arcadeum: 'Full Speed · SFNNv16' },
      },
      {
        feature: 'Unlimited Game Review & Accuracy',
        hint: 'Move classification (Blunder, Mistake, Brilliant) with accuracy graph',
        values: { arcadeum: 'Free & Unlimited' },
      },
      {
        feature: '100% Ad-Free Experience',
        hint: 'Zero commercial interruptions during gameplay',
        values: { arcadeum: true },
      },
      {
        feature: 'Instant Guest Play (No Signup)',
        hint: 'Opponents join directly in browser without registering',
        values: { arcadeum: true },
      },
      {
        feature: '20 AI Bot Personalities',
        hint: 'Graduated difficulty from 250 to 3200 Elo',
        values: { arcadeum: '20 Personalities Included' },
      },
      {
        feature: '7-Piece Syzygy Endgame Tablebases',
        hint: 'Flawless theoretical endgame lookup with DTZ and DTM',
        values: { arcadeum: 'Instant Syzygy Lookup' },
      },
    ],
  },
};

export const MultiPlatformComparison: Story = {
  args: {
    title: 'Platform Comparison',
    kicker: 'Feature Matrix',
    subtitle: 'Transparent feature comparison.',
    columns: [
      { key: 'arcadeum', name: 'Arcadeum Games', isHighlighted: true, badge: 'Recommended' },
      { key: 'traditional', name: 'Traditional Platforms' },
    ],
    rows: [
      {
        feature: 'Engine Analysis',
        hint: 'Stockfish version',
        values: { arcadeum: 'Stockfish 19 SFNNv16', traditional: 'Stockfish 16' },
      },
      {
        feature: 'Full Game Review',
        values: { arcadeum: 'Free Unlimited', traditional: 'Subscription Paywall' },
      },
      {
        feature: 'Zero Ads',
        values: { arcadeum: true, traditional: false },
      },
    ],
  },
};
