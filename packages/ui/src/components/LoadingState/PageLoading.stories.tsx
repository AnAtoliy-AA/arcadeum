import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageLoading } from './PageLoading';

const meta: Meta<typeof PageLoading> = {
  title: 'Feedback/PageLoading',
  component: PageLoading,
  argTypes: {
    layout: {
      control: 'select',
      options: [
        'standard',
        'stats',
        'grid',
        'room',
        'auth',
        'home',
        'cards',
        'table',
        'chat',
        'profile',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageLoading>;

export const Standard: Story = {
  args: {
    layout: 'standard',
  },
};

export const Home: Story = {
  args: {
    layout: 'home',
  },
};

export const Grid: Story = {
  args: {
    layout: 'grid',
  },
};

export const Room: Story = {
  args: {
    layout: 'room',
  },
};

export const Stats: Story = {
  args: {
    layout: 'stats',
  },
};

export const Auth: Story = {
  args: {
    layout: 'auth',
  },
};

export const Cards: Story = {
  args: {
    layout: 'cards',
  },
};

export const Table: Story = {
  args: {
    layout: 'table',
  },
};

export const Chat: Story = {
  args: {
    layout: 'chat',
  },
};

export const Profile: Story = {
  args: {
    layout: 'profile',
  },
};
