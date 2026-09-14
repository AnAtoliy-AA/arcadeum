import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameSpecTable } from './GameSpecTable';

const meta: Meta<typeof GameSpecTable> = {
  title: 'Shared/GameSpecTable',
  component: GameSpecTable,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameSpecTable>;

export const ChessSpecifications: Story = {
  args: {
    title: 'Arcadeum Chess Specifications',
    kicker: 'Key Technical Facts',
    items: [
      { label: 'Engine', value: 'Stockfish 19', badge: 'SFNNv16 NNUE', hint: '3500+ Elo rated strength' },
      { label: 'Variants', value: 'Standard & Chess960', hint: 'Fischer Random positions' },
      { label: 'Time Controls', value: '1+0 to 14-day Daily', hint: 'Bullet, Blitz, Rapid, Classical' },
      { label: 'AI Opponents', value: '20 Personalities', badge: '250–3200 Elo' },
      { label: 'Endgames', value: 'Syzygy 7-Piece', hint: '100% tablebase precision' },
      { label: 'Cost & Access', value: '100% Free · No Ads', badge: 'Zero Friction', hint: 'No download or signup required' },
    ],
  },
};

export const GeneralGameSpecifications: Story = {
  args: {
    title: 'Game Specifications',
    kicker: 'Quick Facts',
    items: [
      { label: 'Players', value: '2 Players', hint: 'Online PvP & Bots' },
      { label: 'Platform', value: 'Web & Mobile', badge: 'Zero Install' },
      { label: 'Rating System', value: 'Glicko-2', hint: 'Matchmaking within ±100 Elo' },
    ],
  },
};
