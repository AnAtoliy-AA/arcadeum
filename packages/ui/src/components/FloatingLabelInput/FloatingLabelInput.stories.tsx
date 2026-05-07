import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FloatingLabelInput } from './FloatingLabelInput';

const meta: Meta<typeof FloatingLabelInput> = {
  title: 'Shared/FloatingLabelInput',
  component: FloatingLabelInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    type: { control: 'text' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingLabelInput>;

export const Default: Story = {
  args: { label: 'Your name' },
};

export const Required: Story = {
  args: { label: 'Email', type: 'email', required: true },
};

export const Filled: Story = {
  args: { label: 'Subject', defaultValue: 'Bug report from EU-West' },
};

export const ErrorState: Story = {
  args: { label: 'Email', error: true, defaultValue: 'invalid' },
};
