import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { YStack } from 'tamagui';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Typography',
  component: Typography,
  argTypes: {
    uiSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    weight: {
      control: 'select',
      options: ['400', '500', '600', '700', '800'],
    },
    alpha: {
      control: 'select',
      options: ['low', 'medium', 'high'],
    },
    tracking: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    gradient: {
      control: 'select',
      options: ['primary', 'gold', 'silver'],
    },
    textCenter: { control: 'boolean' },
    textRight: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

export const Variants: Story = {
  render: () => (
    <YStack gap="$4">
      <Typography variant="heading" uiSize="3xl">Heading 3XL</Typography>
      <Typography variant="subheading" uiSize="xl">Subheading XL</Typography>
      <Typography variant="body">Body (Default)</Typography>
      <Typography variant="label" uiSize="sm">Label SM</Typography>
      <Typography variant="caption" uiSize="xs">Caption XS</Typography>
    </YStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <YStack gap="$4">
      <Typography uiSize="3xl">Typography 3XL</Typography>
      <Typography uiSize="2xl">Typography 2XL</Typography>
      <Typography uiSize="xl">Typography XL</Typography>
      <Typography uiSize="md">Typography MD</Typography>
      <Typography uiSize="sm">Typography SM</Typography>
      <Typography uiSize="xs">Typography XS</Typography>
    </YStack>
  ),
};

export const Gradients: Story = {
  render: () => (
    <YStack gap="$4">
      <Typography uiSize="3xl" gradient="primary" weight="800">Primary Gradient</Typography>
      <Typography uiSize="3xl" gradient="gold" weight="800">Gold Gradient</Typography>
      <Typography uiSize="3xl" gradient="silver" weight="800">Silver Gradient</Typography>
      <Typography variant="label" uiSize="lg" gradient="primary" tracking="lg">Label Gradient</Typography>
    </YStack>
  ),
};

export const Weights: Story = {
  render: () => (
    <YStack gap="$4">
      <Typography weight="800">Weight 800</Typography>
      <Typography weight="700">Weight 700</Typography>
      <Typography weight="600">Weight 600</Typography>
      <Typography weight="500">Weight 500</Typography>
      <Typography weight="400">Weight 400</Typography>
    </YStack>
  ),
};

export const Alphas: Story = {
  render: () => (
    <YStack gap="$4">
      <Typography alpha="high">Alpha High (0.8)</Typography>
      <Typography alpha="medium">Alpha Medium (0.5)</Typography>
      <Typography alpha="low">Alpha Low (0.3)</Typography>
    </YStack>
  ),
};
