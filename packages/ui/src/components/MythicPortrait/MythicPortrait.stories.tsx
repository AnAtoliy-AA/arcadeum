import { Meta, StoryObj } from '@storybook/react';
import { MythicPortrait } from './MythicPortrait';

const meta: Meta<typeof MythicPortrait> = {
  title: 'Leaderboards/MythicPortrait',
  component: MythicPortrait,
};
export default meta;

type Story = StoryObj<typeof MythicPortrait>;

export const Default: Story = { args: { monogram: 'NB' } };
export const Large: Story = { args: { monogram: 'OX', size: 144 } };
