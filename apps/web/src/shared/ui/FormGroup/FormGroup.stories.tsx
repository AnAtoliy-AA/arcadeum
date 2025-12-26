import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FormGroup } from './FormGroup';
import { Input } from '../Input';
import { Select } from '../Select';
import { TextArea } from '../TextArea';

const meta: Meta<typeof FormGroup> = {
  title: 'Shared/FormGroup',
  component: FormGroup,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    required: {
      control: 'boolean',
      description: 'Show required indicator',
    },
    description: {
      control: 'text',
      description: 'Help text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormGroup>;

export const Default: Story = {
  args: {
    label: 'Username',
    htmlFor: 'username',
  },
  render: (args) => (
    <FormGroup {...args}>
      <Input id="username" placeholder="Enter username" fullWidth />
    </FormGroup>
  ),
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    htmlFor: 'email',
    required: true,
  },
  render: (args) => (
    <FormGroup {...args}>
      <Input id="email" type="email" placeholder="you@example.com" fullWidth />
    </FormGroup>
  ),
};

export const WithError: Story = {
  args: {
    label: 'Password',
    htmlFor: 'password',
    required: true,
    error: 'Password must be at least 8 characters',
  },
  render: (args) => (
    <FormGroup {...args}>
      <Input
        id="password"
        type="password"
        placeholder="Enter password"
        error
        fullWidth
      />
    </FormGroup>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'Display Name',
    htmlFor: 'displayname',
    description: 'This is how your name will appear to other players',
  },
  render: (args) => (
    <FormGroup {...args}>
      <Input id="displayname" placeholder="Your display name" fullWidth />
    </FormGroup>
  ),
};

export const WithSelect: Story = {
  args: {
    label: 'Game Type',
    htmlFor: 'gametype',
    required: true,
  },
  render: (args) => (
    <FormGroup {...args}>
      <Select id="gametype" fullWidth>
        <option value="">Select a game...</option>
        <option value="exploding_kittens">Exploding Kittens</option>
        <option value="texas_holdem">Texas Hold&apos;em</option>
      </Select>
    </FormGroup>
  ),
};

export const WithTextArea: Story = {
  args: {
    label: 'Room Notes',
    htmlFor: 'notes',
    description: 'Add any notes or rules for your game room',
  },
  render: (args) => (
    <FormGroup {...args}>
      <TextArea id="notes" placeholder="Enter notes..." fullWidth />
    </FormGroup>
  ),
};

export const CompleteForm: Story = {
  render: () => (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '400px',
      }}
    >
      <FormGroup label="Room Name" htmlFor="roomname" required>
        <Input id="roomname" placeholder="My Awesome Room" fullWidth />
      </FormGroup>
      <FormGroup label="Game" htmlFor="game" required>
        <Select id="game" fullWidth>
          <option value="">Select a game...</option>
          <option value="exploding_kittens">Exploding Kittens</option>
        </Select>
      </FormGroup>
      <FormGroup
        label="Max Players"
        htmlFor="maxplayers"
        description="Leave empty for default"
      >
        <Input
          id="maxplayers"
          type="number"
          min="2"
          max="10"
          placeholder="4"
          fullWidth
        />
      </FormGroup>
      <FormGroup label="Notes" htmlFor="notes">
        <TextArea id="notes" placeholder="Any house rules?" fullWidth />
      </FormGroup>
    </form>
  ),
};
