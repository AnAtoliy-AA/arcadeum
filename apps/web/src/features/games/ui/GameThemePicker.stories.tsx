import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { GameThemePicker } from './GameThemePicker';
import { withTranslations } from '../../../../.storybook/i18n-decorator';

const meta: Meta<typeof GameThemePicker> = {
  title: 'Games/Shared/GameThemePicker',
  component: GameThemePicker,
  tags: ['autodocs'],
  decorators: [withTranslations],
  parameters: { layout: 'padded' },
  args: {
    selectedTheme: 'cyberpunk',
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GameThemePicker>;

export const Default: Story = {};

export const Restricted: Story = {
  args: {
    allowedThemes: ['cyberpunk', 'galaxy', 'zen', 'random'],
    showComingSoon: true,
  },
};

export const CustomOptions: Story = {
  args: {
    options: [
      {
        id: 'classic',
        name: 'Classic',
        emoji: '🚢',
        gradient: 'linear-gradient(135deg, #2563eb, #7dd3fc)',
      },
      {
        id: 'arctic',
        name: 'Arctic',
        emoji: '🧊',
        gradient: 'linear-gradient(135deg, #e0f2fe, #67e8f9)',
      },
      {
        id: 'volcano',
        name: 'Volcano',
        emoji: '🌋',
        gradient: 'linear-gradient(135deg, #7c2d12, #f97316)',
        comingSoon: true,
      },
    ],
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Pick your theme',
  },
};
