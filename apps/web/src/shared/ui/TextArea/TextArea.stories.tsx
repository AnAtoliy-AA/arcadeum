import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Shared/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make textarea full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue:
      'This is a longer text that spans multiple lines.\n\nIt can contain paragraphs.',
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Invalid input',
    error: true,
    defaultValue: 'This content has errors',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
    defaultValue: 'Cannot edit this content',
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: 'Full width textarea',
    fullWidth: true,
  },
};

export const CustomRows: Story = {
  args: {
    placeholder: 'Larger textarea',
    rows: 8,
    style: { minHeight: '200px' },
  },
};
