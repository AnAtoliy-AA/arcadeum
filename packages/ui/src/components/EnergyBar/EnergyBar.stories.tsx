import { Meta, StoryObj } from '@storybook/react';
import { EnergyBar } from './EnergyBar';

const meta: Meta<typeof EnergyBar> = {
  title: 'Leaderboards/EnergyBar',
  component: EnergyBar,
};
export default meta;

type Story = StoryObj<typeof EnergyBar>;

export const Spectrum: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-3">
      <EnergyBar value={2870} max={2870} />
      <EnergyBar value={2806} max={2870} />
      <EnergyBar value={2400} max={2870} />
      <EnergyBar value={1700} max={2870} />
      <EnergyBar value={900} max={2870} />
    </div>
  ),
};
