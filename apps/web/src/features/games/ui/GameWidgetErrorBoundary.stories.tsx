import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameWidgetErrorBoundary } from './GameWidgetErrorBoundary';
import { withTranslations } from '../../../../.storybook/i18n-decorator';

function HealthyGame() {
  return (
    <div className="rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-6">
      A healthy game widget renders fine here.
    </div>
  );
}

function CrashingGame(): React.ReactNode {
  throw new Error('Simulated widget crash');
}

const meta: Meta<typeof GameWidgetErrorBoundary> = {
  title: 'Games/Shared/GameWidgetErrorBoundary',
  component: GameWidgetErrorBoundary,
  tags: ['autodocs'],
  decorators: [withTranslations],
  parameters: { layout: 'padded' },
  args: {
    resetKey: 'critical_v1-room-1',
  },
};

export default meta;
type Story = StoryObj<typeof GameWidgetErrorBoundary>;

export const Healthy: Story = {
  args: {
    children: <HealthyGame />,
  },
};

export const Recovered: Story = {
  args: {
    children: <CrashingGame />,
  },
};

export const CustomFallback: Story = {
  args: {
    children: <CrashingGame />,
    fallback: <div>Custom fallback content</div>,
  },
};
