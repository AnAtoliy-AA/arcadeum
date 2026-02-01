import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { AutoplayControls } from './AutoplayControls';

// Mock autoplay state that matches what useAutoplay returns
const createMockAutoplayState = (overrides = {}) => ({
  allEnabled: false,
  autoDrawEnabled: true,
  autoSkipEnabled: true,
  autoShuffleAfterDefuseEnabled: true,
  autoDrawSkipAfterShuffleEnabled: true,
  autoNopeAttackEnabled: true,
  autoGiveFavorEnabled: true,
  autoDefuseEnabled: true,
  setAllEnabled: fn(),
  setAutoDrawEnabled: fn(),
  setAutoSkipEnabled: fn(),
  setAutoShuffleAfterDefuseEnabled: fn(),
  setAutoDrawSkipAfterShuffleEnabled: fn(),
  setAutoNopeAttackEnabled: fn(),
  setAutoGiveFavorEnabled: fn(),
  setAutoDefuseEnabled: fn(),
  ...overrides,
});

const meta: Meta<typeof AutoplayControls> = {
  title: 'Widgets/Critical/AutoplayControls',
  component: AutoplayControls,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    t: (key: string) => key,
    autoplayState: createMockAutoplayState(),
  },
};

export default meta;
type Story = StoryObj<typeof AutoplayControls>;

export const Default: Story = {};

export const AllEnabled: Story = {
  args: {
    autoplayState: createMockAutoplayState({ allEnabled: true }),
  },
};

export const SomeDisabled: Story = {
  args: {
    autoplayState: createMockAutoplayState({
      autoDrawEnabled: false,
      autoNopeAttackEnabled: false,
    }),
  },
};
