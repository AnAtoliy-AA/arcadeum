import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { XStack } from 'tamagui';
import { FilterChip } from './FilterChip';

const meta: Meta<typeof FilterChip> = {
  title: 'Components/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

export const Default: Story = {
  render: () => <FilterChip>In Progress</FilterChip>,
};

export const Active: Story = {
  render: () => <FilterChip active>In Progress</FilterChip>,
};

export const Disabled: Story = {
  render: () => <FilterChip disabled>In Progress</FilterChip>,
};

export const MultiSelect: Story = {
  render: () => {
    function Example() {
      const [selected, setSelected] = useState<string[]>(['lobby']);
      const options = ['all', 'lobby', 'in_progress', 'completed'] as const;

      const toggle = (value: string) => {
        if (value === 'all') {
          setSelected([]);
          return;
        }
        setSelected((prev) =>
          prev.includes(value)
            ? prev.filter((v) => v !== value)
            : [...prev, value],
        );
      };

      const isAllActive =
        selected.length === 0 || selected.length === options.length - 1;

      return (
        <XStack gap="$2" flexWrap="wrap">
          {options.map((opt) => (
            <FilterChip
              key={opt}
              active={opt === 'all' ? isAllActive : selected.includes(opt)}
              onClick={() => toggle(opt)}
            >
              {opt === 'all' ? 'All' : opt.replace('_', ' ')}
            </FilterChip>
          ))}
        </XStack>
      );
    }
    return <Example />;
  },
};
