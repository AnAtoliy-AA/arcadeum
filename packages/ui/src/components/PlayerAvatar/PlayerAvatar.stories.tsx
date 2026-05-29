import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlayerAvatar } from './PlayerAvatar';

const meta: Meta<typeof PlayerAvatar> = {
  title: 'Data Display/PlayerAvatar',
  component: PlayerAvatar,
  argTypes: {
    size: {
      control: 'select',
      options: ['icon', 'sm', 'md', 'lg', 'card', 'profile'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlayerAvatar>;

// Every size now renders the full cosmetic set (badge, frame ring, aura/rays
// halo, background wash), so each story below sets them — including the
// `backgroundColor` cosmetic, which overrides the frame-derived disc wash.
export const Icon: Story = {
  args: {
    name: 'Jane Doe',
    size: 'icon',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#6366f1',
    auraColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'linear-gradient(160deg, #0f172a 0%, #4c1d95 100%)',
  },
};

export const Sm: Story = {
  args: {
    name: 'Jane Doe',
    size: 'sm',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#6366f1',
    auraColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'linear-gradient(160deg, #0f172a 0%, #4c1d95 100%)',
  },
};

export const Md: Story = {
  args: {
    name: 'Jane Doe',
    size: 'md',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#22d3ee',
    auraColor: 'rgba(34, 211, 238, 0.6)',
    backgroundColor: 'linear-gradient(160deg, #0f172a 0%, #155e75 100%)',
  },
};

export const Card: Story = {
  args: {
    name: 'Jane Doe',
    size: 'card',
    badgeUrl: '/shop/badges/star.png',
    frameColor: '#a855f7',
    auraColor: 'rgba(168, 85, 247, 0.6)',
    backgroundColor: 'linear-gradient(160deg, #0f172a 0%, #4c1d95 100%)',
    bannerColor: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
    nameColor: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    presenceLine: 'Level 42',
  },
};

export const Profile: Story = {
  args: {
    name: 'Jane Doe',
    size: 'profile',
    avatarUrl: '/shop/avatars/jane.png',
    badgeUrl: '/shop/badges/star.png',
    frameColor: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)',
    auraColor: 'rgba(168, 85, 247, 0.6)',
    backgroundColor: 'linear-gradient(160deg, #0f172a 0%, #4c1d95 100%)',
    bannerColor: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
    nameColor: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    presenceLine: 'Level 42',
    skinChip: { id: 'skin-neon', label: 'Neon' },
  },
};

export const WithSkinChip: Story = {
  args: {
    name: 'Jane Doe',
    size: 'card',
    avatarUrl: '/shop/avatars/jane.png',
    skinChip: { id: 'skin-neon', label: 'Neon' },
    frameColor: '#22d3ee',
    auraColor: '#22d3ee',
  },
};

export const LoadingFromCatalog: Story = {
  args: {
    name: 'Jane Doe',
    size: 'md',
  },
};

// Same cosmetics applied across every size, so the disc-level decorations
// (badge, frame ring, aura/rays, background wash) should scale consistently
// while only the chrome (banner / name / skin chip) appears on card & profile.
export const AllSizes: Story = {
  render: () => {
    const shared = {
      name: 'Jane',
      badgeUrl: '/shop/badges/star.png',
      frameColor: '#a855f7',
      auraColor: 'rgba(168, 85, 247, 0.6)',
      backgroundColor: 'linear-gradient(160deg, #0f172a 0%, #4c1d95 100%)',
    } as const;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <PlayerAvatar {...shared} size="icon" />
        <PlayerAvatar {...shared} size="sm" />
        <PlayerAvatar {...shared} size="md" />
        <PlayerAvatar {...shared} size="lg" />
        <PlayerAvatar
          {...shared}
          size="card"
          bannerColor="#1e293b"
          presenceLine="Online"
        />
        <PlayerAvatar
          {...shared}
          size="profile"
          bannerColor="#1e293b"
          presenceLine="Level 42"
          skinChip={{ id: 'skin-neon', label: 'Neon' }}
        />
      </div>
    );
  },
};
