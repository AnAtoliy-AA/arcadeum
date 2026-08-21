import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    size: 'lg',
    children: (
      <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 text-[var(--foreground)]">
        Responsive container content with side paddings
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 text-[var(--foreground)]">
        Small container content
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: (
      <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 text-[var(--foreground)]">
        Extra large container content
      </div>
    ),
  },
};
