import type { Meta, StoryObj } from '@storybook/react';
import { GamesSearch } from './GamesSearch';

const meta: Meta<typeof GamesSearch> = {
  title: 'Features/Games/GamesSearch',
  component: GamesSearch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSearch: { action: 'searched' },
  },
};

export default meta;
type Story = StoryObj<typeof GamesSearch>;

export const Default: Story = {
  args: {
    placeholder: 'Search games...',
    buttonLabel: 'Search',
  },
};

export const WithInitialValue: Story = {
  args: {
    initialValue: 'Coup',
    placeholder: 'Search games...',
    buttonLabel: 'Search',
  },
};

export const CustomDebounce: Story = {
  args: {
    debounceDelay: 500, // Faster debounce for testing
    placeholder: 'Fast debounce (500ms)...',
    buttonLabel: 'Go',
  },
};
