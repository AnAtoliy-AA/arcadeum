import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CosmeticBadge } from './CosmeticBadge';

const meta: Meta<typeof CosmeticBadge> = {
  title: 'Shared/CosmeticBadge',
  component: CosmeticBadge,
  tags: ['autodocs'],
  argTypes: {
    badgeId: {
      control: 'select',
      options: ['badge_social_butterfly', 'badge_legend_recruiter'],
      description: 'Badge identifier',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CosmeticBadge>;

export const SocialButterfly: Story = {
  args: {
    badgeId: 'badge_social_butterfly',
  },
};

export const LegendRecruiter: Story = {
  args: {
    badgeId: 'badge_legend_recruiter',
  },
};

export const AllBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <CosmeticBadge badgeId="badge_social_butterfly" />
      <CosmeticBadge badgeId="badge_legend_recruiter" />
    </div>
  ),
};

export const InlineWithUsername: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>PlayerOne</span>
      <CosmeticBadge badgeId="badge_social_butterfly" />
      <CosmeticBadge badgeId="badge_legend_recruiter" />
    </div>
  ),
};
