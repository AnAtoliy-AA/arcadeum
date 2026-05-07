import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LaunchButton } from './LaunchButton';

const meta: Meta<typeof LaunchButton> = {
  title: 'Shared/LaunchButton',
  component: LaunchButton,
  tags: ['autodocs'],
  argTypes: {
    isLaunching: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof LaunchButton>;

export const Default: Story = {
  args: { children: 'Launch message' },
};

export const Launching: Story = {
  args: { children: 'Sending…', isLaunching: true },
};

export const Disabled: Story = {
  args: { children: 'Launch message', disabled: true },
};

export const FullWidth: Story = {
  args: { children: 'Launch message', fullWidth: true },
};
