import type { Meta, StoryObj } from '@storybook/react';
import { TableOfContents } from './TableOfContents';

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableOfContents>;

export const Default: Story = {
  args: {
    items: [
      { id: '1', title: '1. Agreement to Terms' },
      { id: '2', title: '2. Company Information' },
      { id: '3', title: '3. Description of Services' },
      { id: '4', title: '4. User Accounts' },
    ],
    activeId: '1',
    onSelect: (id) => console.log('Selected section:', id),
    accentColor: 'indigo',
  },
};
