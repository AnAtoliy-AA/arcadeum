import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { YStack } from 'tamagui';
import { VictoryCelebration } from './VictoryCelebration';

const meta: Meta<typeof VictoryCelebration> = {
  title: 'Features/Games/VictoryCelebration',
  component: VictoryCelebration,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  // The layer is absolutely positioned; render it inside a tall dark stage so
  // the falling confetti and rising sparkles are visible in isolation.
  decorators: [
    (Story) => (
      <YStack
        position="relative"
        height={600}
        backgroundColor="#0b0d0e"
        overflow="hidden"
      >
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VictoryCelebration>;

export const Victory: Story = { args: { tone: 'victory' } };
export const Defeat: Story = { args: { tone: 'defeat' } };
export const Draw: Story = { args: { tone: 'draw' } };
