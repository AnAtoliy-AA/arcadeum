import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Shared/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make select full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <option value="">Select an option...</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </Select>
  ),
};

export const WithValue: Story = {
  render: (args) => (
    <Select {...args} defaultValue="option2">
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </Select>
  ),
};

export const Error: Story = {
  render: (args) => (
    <Select {...args} error>
      <option value="">Please select...</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
    </Select>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Select {...args} disabled defaultValue="option1">
      <option value="option1">Cannot change</option>
      <option value="option2">Option 2</option>
    </Select>
  ),
};

export const FullWidth: Story = {
  render: (args) => (
    <Select {...args} fullWidth>
      <option value="">Full width select...</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
    </Select>
  ),
};

export const GameSelect: Story = {
  render: (args) => (
    <Select {...args}>
      <option value="">Choose a game...</option>
      <option value="exploding_kittens">Exploding Kittens</option>
      <option value="texas_holdem">Texas Hold&apos;em</option>
      <option value="chess">Chess</option>
    </Select>
  ),
};
