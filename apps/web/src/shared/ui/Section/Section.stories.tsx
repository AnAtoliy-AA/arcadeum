import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    children: <p>This is section content.</p>,
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Settings',
    description: 'Manage your account preferences and application settings.',
    children: <p>Settings content goes here.</p>,
  },
};

export const NoTitle: Story = {
  args: {
    children: <p>A section without a title, just content.</p>,
  },
};

export const ComplexContent: Story = {
  args: {
    title: 'Your Profile',
    description: 'Update your personal information.',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>Name: John Doe</div>
        <div>Email: john@example.com</div>
        <div>Role: Admin</div>
      </div>
    ),
  },
};
