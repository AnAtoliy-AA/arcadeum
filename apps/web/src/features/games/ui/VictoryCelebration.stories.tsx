import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { VictoryCelebration } from './VictoryCelebration';

const meta: Meta<typeof VictoryCelebration> = {
  title: 'Features/Games/VictoryCelebration',
  component: VictoryCelebration,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="relative flex h-[600px] flex-col items-stretch overflow-hidden bg-[#0b0d0e]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VictoryCelebration>;

export const Victory: Story = { args: { tone: 'victory' } };
export const Defeat: Story = { args: { tone: 'defeat' } };
export const Draw: Story = { args: { tone: 'draw' } };

export const CyberpunkVictory: Story = {
  args: { tone: 'victory', theme: 'cyberpunk' },
};

export const UnderwaterVictory: Story = {
  args: { tone: 'victory', theme: 'underwater' },
};

export const ZenVictory: Story = {
  args: { tone: 'victory', theme: 'zen' },
};
