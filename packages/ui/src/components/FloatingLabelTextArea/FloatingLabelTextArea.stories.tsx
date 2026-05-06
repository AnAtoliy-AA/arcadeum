import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FloatingLabelTextArea } from './FloatingLabelTextArea';

const meta: Meta<typeof FloatingLabelTextArea> = {
  title: 'Shared/FloatingLabelTextArea',
  component: FloatingLabelTextArea,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    maxLength: { control: 'number' },
    required: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingLabelTextArea>;

export const Default: Story = {
  args: { label: 'Message' },
};

export const Required: Story = {
  args: { label: 'Message', required: true },
};

export const WithCounter: Story = {
  args: { label: 'Message', maxLength: 1200 },
};

export const NearLimit: Story = {
  args: {
    label: 'Message',
    maxLength: 120,
    defaultValue:
      'Lorem ipsum dolor sit amet consectetur adipiscing elit. Curabitur volutpat dignissim risus, sed faucibus est lacinia.',
  },
};
