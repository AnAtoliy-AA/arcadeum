import { Meta, StoryObj } from '@storybook/react';
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
      <div className="flex flex-col gap-3" style={{ maxWidth: 520 }}>
        <span
          style={{
            fontSize: 14,
            letterSpacing: '2px',
            opacity: 0.7,
            color: 'var(--mythicAccent)',
          }}
        >
          LIVE · SEASON 4
        </span>
        <span className="box-border text-[48px] font-black tracking-[-1px]">
          Race the leaderboard.
        </span>
        <span className="box-border text-[18px] opacity-[0.85]">
          Updated every 30 seconds. Top 100 players gear up for the Champions
          Cup.
        </span>
      </div>
    </HeroBackdrop>
  ),
};
