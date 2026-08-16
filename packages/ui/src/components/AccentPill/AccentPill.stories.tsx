import { Meta, StoryObj } from '@storybook/react';
import { AccentPill } from './AccentPill';

const meta: Meta<typeof AccentPill> = {
  title: 'Badges/AccentPill',
  component: AccentPill,
};
export default meta;

type Story = StoryObj<typeof AccentPill>;

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2 bg-[#0b0f12] p-4">
      <AccentPill accent="#3b82f6">Rare</AccentPill>
      <AccentPill accent="#a855f7">Epic</AccentPill>
      <AccentPill accent="#facc15">Legendary</AccentPill>
      <AccentPill accent="#22d3ee" dot={false}>
        No dot
      </AccentPill>
    </div>
  ),
};
