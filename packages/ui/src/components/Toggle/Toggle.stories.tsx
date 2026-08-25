import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Shared/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onLabel: { control: 'text' },
    offLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

function ControlledToggle({
  initialChecked = false,
  disabled,
  ariaLabel = 'Sample toggle',
  onLabel,
  offLabel,
}: {
  initialChecked?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onLabel?: string;
  offLabel?: string;
}) {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <Toggle
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
      ariaLabel={ariaLabel}
      onLabel={onLabel}
      offLabel={offLabel}
    />
  );
}

export const On: Story = {
  render: () => <ControlledToggle initialChecked ariaLabel="Sample toggle" />,
};

export const Off: Story = {
  render: () => <ControlledToggle ariaLabel="Sample toggle" />,
};

export const Disabled: Story = {
  render: () => <ControlledToggle initialChecked disabled ariaLabel="Sample toggle" />,
};

export const CustomLabels: Story = {
  render: () => (
    <ControlledToggle ariaLabel="Auto play" onLabel="AUTO" offLabel="MAN" />
  ),
};
