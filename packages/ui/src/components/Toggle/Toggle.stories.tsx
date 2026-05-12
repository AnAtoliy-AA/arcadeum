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

function ControlledToggle(args: React.ComponentProps<typeof Toggle>) {
  const [checked, setChecked] = useState(args.checked);
  return (
    <Toggle {...args} checked={checked} onCheckedChange={setChecked} />
  );
}

export const On: Story = {
  args: { checked: true, ariaLabel: 'Sample toggle' },
  render: (args) => <ControlledToggle {...args} />,
};

export const Off: Story = {
  args: { checked: false, ariaLabel: 'Sample toggle' },
  render: (args) => <ControlledToggle {...args} />,
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, ariaLabel: 'Sample toggle' },
  render: (args) => <ControlledToggle {...args} />,
};

export const CustomLabels: Story = {
  args: {
    checked: false,
    ariaLabel: 'Auto play',
    onLabel: 'AUTO',
    offLabel: 'MAN',
  },
  render: (args) => <ControlledToggle {...args} />,
};
