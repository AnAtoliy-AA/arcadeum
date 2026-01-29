import type { Meta, StoryObj } from '@storybook/react';
import { PageTitle } from './PageTitle';

const meta: Meta<typeof PageTitle> = {
  title: 'Typography/PageTitle',
  component: PageTitle,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    gradient: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageTitle>;

export const Default: Story = {
  args: {
    children: 'Page Title',
    size: 'lg',
    gradient: false,
  },
};

export const Small: Story = {
  args: {
    children: 'Small Title',
    size: 'sm',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Title',
    size: 'xl',
  },
};

export const Gradient: Story = {
  args: {
    children: 'Gradient Title',
    size: 'xl',
    gradient: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PageTitle size="sm">Small Title</PageTitle>
      <PageTitle size="md">Medium Title</PageTitle>
      <PageTitle size="lg">Large Title</PageTitle>
      <PageTitle size="xl">Extra Large Title</PageTitle>
      <PageTitle size="xl" gradient>
        Gradient Title
      </PageTitle>
    </div>
  ),
};
