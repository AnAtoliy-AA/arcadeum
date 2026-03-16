import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProgressCircle, ProgressBar, WinRateBadge } from './Progress';
import { YStack, XStack, Text, styled } from 'tamagui';

const meta: Meta<typeof ProgressCircle> = {
  title: 'Shared/Progress',
  component: ProgressCircle,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Percentage value (0-100)',
    },
    size: {
      control: { type: 'number', min: 40, max: 200 },
      description: 'Size in pixels',
    },
    strokeWidth: {
      control: { type: 'number', min: 2, max: 20 },
      description: 'Stroke width in pixels',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage label',
    },
    animate: {
      control: 'boolean',
      description: 'Animate progress on mount',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const CircleDefault: Story = {
  args: {
    value: 75,
    size: 100,
    strokeWidth: 10,
    showLabel: true,
    animate: true,
  },
};

export const CircleSizes: Story = {
  render: () => (
    <Row>
      <Column>
        <ProgressCircle value={65} size={60} strokeWidth={6} />
        <Label>Small (60px)</Label>
      </Column>
      <Column>
        <ProgressCircle value={65} size={100} strokeWidth={10} />
        <Label>Medium (100px)</Label>
      </Column>
      <Column>
        <ProgressCircle value={65} size={140} strokeWidth={14} />
        <Label>Large (140px)</Label>
      </Column>
    </Row>
  ),
};

export const CircleColors: Story = {
  render: () => (
    <Row>
      <Column>
        <ProgressCircle value={85} color="#10b981" />
        <Label>High (Green)</Label>
      </Column>
      <Column>
        <ProgressCircle value={55} color="#f59e0b" />
        <Label>Medium (Yellow)</Label>
      </Column>
      <Column>
        <ProgressCircle value={25} color="#ef4444" />
        <Label>Low (Red)</Label>
      </Column>
    </Row>
  ),
};

export const CircleAutoColor: Story = {
  render: () => (
    <Row>
      <Column>
        <ProgressCircle value={90} />
        <Label>90% - Auto Green</Label>
      </Column>
      <Column>
        <ProgressCircle value={50} />
        <Label>50% - Auto Yellow</Label>
      </Column>
      <Column>
        <ProgressCircle value={20} />
        <Label>20% - Auto Red</Label>
      </Column>
    </Row>
  ),
};

export const ProgressBarDefault: Story = {
  render: () => (
    <BarContainer>
      <ProgressBar value={75} height={12} />
    </BarContainer>
  ),
};

export const ProgressBarSizes: Story = {
  render: () => (
    <Stack>
      <div>
        <Label>Small (4px)</Label>
        <ProgressBar value={65} height={4} />
      </div>
      <div>
        <Label>Medium (8px)</Label>
        <ProgressBar value={65} height={8} />
      </div>
      <div>
        <Label>Large (16px)</Label>
        <ProgressBar value={65} height={16} showLabel />
      </div>
      <div>
        <Label>XL (24px)</Label>
        <ProgressBar value={65} height={24} showLabel />
      </div>
    </Stack>
  ),
};

export const ProgressBarColors: Story = {
  render: () => (
    <Stack>
      <div>
        <Label>Custom Blue</Label>
        <ProgressBar value={70} height={8} color="#3b82f6" />
      </div>
      <div>
        <Label>Custom Purple</Label>
        <ProgressBar value={60} height={8} color="#8b5cf6" />
      </div>
      <div>
        <Label>Custom Pink</Label>
        <ProgressBar value={80} height={8} color="#ec4899" />
      </div>
    </Stack>
  ),
};

export const WinRateBadgeDefault: Story = {
  render: () => <WinRateBadge wins={42} losses={18} size="md" />,
};

export const WinRateBadgeSizes: Story = {
  render: () => (
    <Stack>
      <div>
        <Label>Small</Label>
        <WinRateBadge wins={30} losses={20} size="sm" />
      </div>
      <div>
        <Label>Medium</Label>
        <WinRateBadge wins={45} losses={15} size="md" />
      </div>
      <div>
        <Label>Large</Label>
        <WinRateBadge wins={80} losses={20} size="lg" />
      </div>
    </Stack>
  ),
};

export const WinRateBadgeCompact: Story = {
  render: () => (
    <Row>
      <WinRateBadge wins={10} losses={5} size="sm" showStats={false} />
      <WinRateBadge wins={25} losses={25} size="sm" showStats={false} />
      <WinRateBadge wins={5} losses={20} size="sm" showStats={false} />
    </Row>
  ),
};

export const StatsDashboard: Story = {
  render: () => (
    <Dashboard>
      <DashboardCard>
        <CardTitle>Win Rate</CardTitle>
        <ProgressCircle value={72} size={100} />
      </DashboardCard>
      <DashboardCard>
        <CardTitle>Goals Completed</CardTitle>
        <ProgressCircle value={85} size={100} color="#3b82f6" suffix="%" />
      </DashboardCard>
      <DashboardCard>
        <CardTitle>Level Progress</CardTitle>
        <div style={{ width: '100%' }}>
          <ProgressBar value={45} height={12} color="#8b5cf6" />
          <BarText>Level 7 • 45% to Level 8</BarText>
        </div>
      </DashboardCard>
    </Dashboard>
  ),
};

// Styled helpers
const Row = styled(XStack, {
  alignItems: 'center',
  gap: '$5',
});

const Column = styled(YStack, {
  alignItems: 'center',
  gap: '$3',
});

const Label = styled(Text, {
  fontSize: '$2',
  color: '$color',
  opacity: 0.7,
});

const Stack = styled(YStack, {
  gap: '$4',
  width: 300,
});

const BarContainer = styled(YStack, {
  width: 300,
});

const Dashboard = styled(YStack, {
  display: 'grid' as unknown as 'inherit',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$4',
  width: '100%',
  maxWidth: 600,
});

const DashboardCard = styled(YStack, {
  padding: '$5',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$5',
  alignItems: 'center',
  gap: '$4',
});

const CardTitle = styled(Text, {
  fontSize: '$2',
  fontWeight: '500',
  color: '$color',
  opacity: 0.8,
});

const BarText = styled(Text, {
  marginTop: '$2',
  fontSize: '$1',
  color: '$color',
  opacity: 0.7,
  textAlign: 'center',
});
