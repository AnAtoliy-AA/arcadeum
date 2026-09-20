import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: () => {
    function Example() {
      const [query, setQuery] = useState('');
      return (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search games..."
        />
      );
    }
    return <Example />;
  },
};

export const WithValue: Story = {
  render: () => {
    function Example() {
      const [query, setQuery] = useState('Critical');
      return (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search games..."
        />
      );
    }
    return <Example />;
  },
};

export const Sizes: Story = {
  render: () => {
    function Example() {
      const [valSm, setValSm] = useState('');
      const [valMd, setValMd] = useState('');
      const [valLg, setValLg] = useState('');
      return (
        <div className="flex flex-col gap-4">
          <SearchInput
            size="sm"
            value={valSm}
            onChange={setValSm}
            placeholder="Small search"
          />
          <SearchInput
            size="md"
            value={valMd}
            onChange={setValMd}
            placeholder="Medium search"
          />
          <SearchInput
            size="lg"
            value={valLg}
            onChange={setValLg}
            placeholder="Large search"
          />
        </div>
      );
    }
    return <Example />;
  },
};

export const FullWidth: Story = {
  render: () => {
    function Example() {
      const [query, setQuery] = useState('');
      return (
        <SearchInput
          fullWidth
          value={query}
          onChange={setQuery}
          placeholder="Full width search..."
        />
      );
    }
    return <Example />;
  },
};

export const Disabled: Story = {
  render: () => (
    <SearchInput
      disabled
      value="Disabled search"
      onChange={() => {}}
      placeholder="Search disabled"
    />
  ),
};
