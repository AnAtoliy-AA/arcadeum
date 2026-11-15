import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameMilestoneToast } from './GameMilestoneToast';

const meta: Meta<typeof GameMilestoneToast> = {
  title: 'Features/Games/GameMilestoneToast',
  component: GameMilestoneToast,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="relative flex h-[350px] w-full items-center justify-center bg-neutral-900 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GameMilestoneToast>;

export const AmberMilestone: Story = {
  args: {
    isOpen: true,
    icon: '⚡',
    badge: 'Milestone',
    title: '512 Reached!',
    description: 'Keep building toward 2048',
    actionLabel: 'Keep Going',
    tone: 'amber',
    onDismiss: () => {},
  },
};

export const OrangeMilestone: Story = {
  args: {
    isOpen: true,
    icon: '🔥',
    badge: 'Blazing',
    title: '1024 Reached!',
    description: 'Almost at 2048',
    actionLabel: 'Keep Going',
    tone: 'orange',
    onDismiss: () => {},
  },
};

export const YellowMilestone: Story = {
  args: {
    isOpen: true,
    icon: '👑',
    badge: 'Champion',
    title: '2048 Achieved!',
    description: 'You unlocked the legendary 2048 tile!',
    actionLabel: 'Continue',
    tone: 'yellow',
    sparkles: ['✨', '👑', '🎉'],
    onDismiss: () => {},
  },
};

export const FuchsiaMilestone: Story = {
  args: {
    isOpen: true,
    icon: '💎',
    badge: 'Master',
    title: '4096 Master!',
    description: 'Ascending to greatness',
    actionLabel: 'Continue',
    tone: 'fuchsia',
    sparkles: ['✨', '💎', '🌟'],
    onDismiss: () => {},
  },
};

export const CyanMilestone: Story = {
  args: {
    isOpen: true,
    icon: '🌌',
    badge: 'Cosmic',
    title: '8192 Cosmic!',
    description: 'Beyond all limits',
    actionLabel: 'Claim Victory',
    tone: 'cyan',
    sparkles: ['✨', '🌌', '⚡', '🌟'],
    onDismiss: () => {},
  },
};

export const EmeraldMilestone: Story = {
  args: {
    isOpen: true,
    icon: '🏆',
    badge: 'Victory',
    title: 'Level Cleared!',
    description: 'All mines flagged successfully',
    actionLabel: 'Next Level',
    tone: 'emerald',
    onDismiss: () => {},
  },
};

export const PurpleMilestone: Story = {
  args: {
    isOpen: true,
    icon: '🔮',
    badge: 'Streak',
    title: '5x Combo!',
    description: 'Flawless line clearing run',
    actionLabel: 'Keep Rolling',
    tone: 'purple',
    onDismiss: () => {},
  },
};
