import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LinkButton } from './LinkButton';

const meta: Meta<typeof LinkButton> = {
  title: 'Navigation/LinkButton',
  component: LinkButton,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LinkButton>;

export const Primary: Story = {
  args: {
    href: '/example',
    variant: 'primary',
    children: 'Go to Page',
  },
};

export const Secondary: Story = {
  args: {
    href: '/example',
    variant: 'secondary',
    children: 'Learn More',
  },
};

export const Ghost: Story = {
  args: {
    href: '/example',
    variant: 'ghost',
    children: 'Cancel',
  },
};

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    variant: 'secondary',
    external: true,
    children: (
      <>
        Visit Site <span>↗</span>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <LinkButton href="/games" variant="primary">
        Create Game
      </LinkButton>
      <LinkButton href="/settings" variant="secondary">
        Settings
      </LinkButton>
      <LinkButton href="/" variant="ghost">
        Back Home
      </LinkButton>
    </div>
  ),
};
