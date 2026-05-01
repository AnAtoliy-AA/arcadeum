import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageLayout } from './PageLayout';
import { PageTitle } from '../PageTitle';
import { Container } from '../Container';

const meta: Meta<typeof PageLayout> = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageLayout>;

export const Default: Story = {
  render: () => (
    <PageLayout>
      <Container size="md">
        <PageTitle>Page Title</PageTitle>
        <p>This is page content inside a container.</p>
      </Container>
    </PageLayout>
  ),
};
