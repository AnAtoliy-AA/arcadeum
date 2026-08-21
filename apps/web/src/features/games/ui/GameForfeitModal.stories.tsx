import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { GameForfeitModal } from './GameForfeitModal';
import { withTranslations } from '../../../../.storybook/i18n-decorator';

const meta: Meta<typeof GameForfeitModal> = {
  title: 'Games/Shared/GameForfeitModal',
  component: GameForfeitModal,
  tags: ['autodocs'],
  decorators: [withTranslations],
  parameters: { layout: 'centered' },
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GameForfeitModal>;

export const Open: Story = {};

export const CustomLabels: Story = {
  args: {
    labels: {
      title: 'Surrender the match?',
      message: 'You will lose this match if you surrender.',
      confirm: 'Surrender',
      cancel: 'Keep playing',
    },
  },
};
