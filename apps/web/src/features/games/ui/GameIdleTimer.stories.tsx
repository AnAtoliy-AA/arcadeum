import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { GameIdleTimer } from './GameIdleTimer';
import { withTranslations } from '../../../../.storybook/i18n-decorator';

const meta: Meta<typeof GameIdleTimer> = {
  title: 'Games/Shared/GameIdleTimer',
  component: GameIdleTimer,
  tags: ['autodocs'],
  decorators: [withTranslations],
  parameters: { layout: 'centered' },
  args: {
    enabled: true,
    isMyTurn: true,
    canAct: true,
    autoplayTriggered: false,
    onTimeout: fn(),
    onStop: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GameIdleTimer>;

export const Countdown: Story = {};

export const AutoplayActive: Story = {
  args: {
    autoplayTriggered: true,
  },
};

export const Disabled: Story = {
  args: {
    enabled: false,
  },
};
