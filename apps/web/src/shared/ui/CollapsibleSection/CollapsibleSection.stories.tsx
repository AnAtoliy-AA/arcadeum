import type { Meta, StoryObj } from '@storybook/react';
import { CollapsibleSection } from './CollapsibleSection';

const meta: Meta<typeof CollapsibleSection> = {
  title: 'Layout/CollapsibleSection',
  component: CollapsibleSection,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    defaultExpanded: {
      control: 'boolean',
      description: 'Whether the section starts expanded',
    },
    showLabel: {
      control: 'text',
      description: 'Label for show button',
    },
    hideLabel: {
      control: 'text',
      description: 'Label for hide button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

export const Default: Story = {
  args: {
    title: 'Collapsible Section',
    children: (
      <div
        style={{
          padding: '1rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
        }}
      >
        <p>This content can be collapsed by clicking the toggle button.</p>
        <p>The section remembers its state while you interact with the page.</p>
      </div>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Settings',
    description: 'Manage your account preferences and application settings.',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" /> Enable notifications
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" /> Dark mode
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" /> Auto-save
        </label>
      </div>
    ),
  },
};

export const WithHeaderContent: Story = {
  args: {
    title: 'Expansion Packs',
    headerContent: (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.05)',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        <input type="checkbox" />
        Select All
      </label>
    ),
    children: (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '0.5rem',
        }}
      >
        {['Pack 1', 'Pack 2', 'Pack 3', 'Pack 4'].map((pack) => (
          <label
            key={pack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" />
            {pack}
          </label>
        ))}
      </div>
    ),
  },
};

export const InitiallyCollapsed: Story = {
  args: {
    title: 'Advanced Options',
    description: 'Click to expand and see advanced settings.',
    defaultExpanded: false,
    children: (
      <div
        style={{
          padding: '1rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
        }}
      >
        <p>These are advanced options that are hidden by default.</p>
        <p>Users can expand this section when needed.</p>
      </div>
    ),
  },
};

export const CustomLabels: Story = {
  args: {
    title: 'Game Rules',
    showLabel: 'View Rules',
    hideLabel: 'Hide Rules',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p>1. Each player draws 7 cards at the start.</p>
        <p>2. Take turns playing or drawing cards.</p>
        <p>3. First player to empty their hand wins.</p>
      </div>
    ),
  },
};
