import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MultiSelectDropdown } from './MultiSelectDropdown';

const meta: Meta<typeof MultiSelectDropdown> = {
  title: 'Components/MultiSelectDropdown',
  component: MultiSelectDropdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MultiSelectDropdown>;

const statusOptions = [
  { id: 'lobby', label: 'Lobby', count: 5 },
  { id: 'in_progress', label: 'In Progress', count: 18 },
  { id: 'completed', label: 'Completed', count: 42 },
] as const;

export const Default: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <MultiSelectDropdown
          label="Status"
          options={statusOptions}
          selectedValues={selected}
          onChange={setSelected}
        />
      );
    }
    return <Example />;
  },
};

export const WithSelectedValues: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState<string[]>([
        'lobby',
        'in_progress',
      ]);
      return (
        <MultiSelectDropdown
          label="Status"
          options={statusOptions}
          selectedValues={selected}
          onChange={setSelected}
        />
      );
    }
    return <Example />;
  },
};

export const Disabled: Story = {
  render: () => (
    <MultiSelectDropdown
      disabled
      label="Status"
      options={statusOptions}
      selectedValues={[]}
      onChange={() => {}}
    />
  ),
};
