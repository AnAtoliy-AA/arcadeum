import { Meta, StoryObj } from '@storybook/react';
import { Text, YStack } from 'tamagui';
import { HeroBackdrop } from './HeroBackdrop';

const meta: Meta<typeof HeroBackdrop> = {
  title: 'Leaderboards/HeroBackdrop',
  component: HeroBackdrop,
};
export default meta;

type Story = StoryObj<typeof HeroBackdrop>;

export const Default: Story = {
  render: () => (
    <HeroBackdrop>
      <YStack gap="$3" maxWidth={520}>
        <Text
          fontSize="$2"
          letterSpacing={2}
          opacity={0.7}
          color="$mythicAccent"
        >
          LIVE · SEASON 4
        </Text>
        <Text fontSize="$10" fontWeight="900" letterSpacing={-1}>
          Race the leaderboard.
        </Text>
        <Text fontSize="$4" opacity={0.85}>
          Updated every 30 seconds. Top 100 players gear up for the Champions
          Cup.
        </Text>
      </YStack>
    </HeroBackdrop>
  ),
};
