import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const demoItems = [
  { id: 'all', label: 'All' },
  { id: 'lobby', label: 'Lobby', count: 4 },
  { id: 'in_progress', label: 'In Progress', count: 12 },
  { id: 'completed', label: 'Completed' },
] as const;

export const SingleSelect: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState('all');
      return (
        <SegmentedControl
          items={demoItems}
          value={selected}
          onChange={setSelected}
        />
      );
    }
    return <Example />;
  },
};

export const MultiSelect: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState<string[]>(['lobby']);

      const handleToggle = (id: string) => {
        if (id === 'all') {
          setSelected([]);
          return;
        }
        setSelected((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
      };

      return (
        <SegmentedControl
          items={demoItems}
          value={selected.length === 0 ? 'all' : selected}
          onChange={handleToggle}
        />
      );
    }
    return <Example />;
  },
};

export const SmallSize: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState('lobby');
      return (
        <SegmentedControl
          size="sm"
          items={demoItems}
          value={selected}
          onChange={setSelected}
        />
      );
    }
    return <Example />;
  },
};
