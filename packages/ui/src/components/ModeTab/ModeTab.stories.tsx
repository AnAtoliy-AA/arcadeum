import { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';
import { ModeTab } from './ModeTab';

const meta: Meta<typeof ModeTab> = {
  title: 'Leaderboards/ModeTab',
  component: ModeTab,
};
export default meta;

type Story = StoryObj<typeof ModeTab>;

const GRADIENTS = {
  all: 'linear-gradient(135deg,#22d3ee,#a78bfa)',
  mafia: 'linear-gradient(135deg,#f472b6,#fbbf24)',
  werewolf: 'linear-gradient(135deg,#34d399,#22d3ee)',
};

export const Row: Story = {
  render: () => (
    <XStack gap="$3" flexWrap="wrap" role="tablist">
      <ModeTab
        id="all"
        name="All games"
        subtitle="Combined ladder"
        icon="◎"
        gradient={GRADIENTS.all}
        active
      />
      <ModeTab
        id="mafia"
        name="Mafia"
        subtitle="5v5 tactical"
        icon="♤"
        gradient={GRADIENTS.mafia}
      />
      <ModeTab
        id="werewolf"
        name="Werewolf"
        subtitle="Social deduction"
        icon="♢"
        gradient={GRADIENTS.werewolf}
      />
    </XStack>
  ),
};
