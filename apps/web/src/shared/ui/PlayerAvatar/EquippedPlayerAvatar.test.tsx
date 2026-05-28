import { render as rtlRender, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import { EquippedPlayerAvatar } from './EquippedPlayerAvatar';
import * as hook from '@/features/shop/hooks/useEquippedCosmetics';

vi.mock('@/features/shop/hooks/useEquippedCosmetics');

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

const allNulls = {
  avatarUrl: null,
  avatarItem: null,
  badgeUrl: null,
  badgeItem: null,
  nameColor: null,
  nameColorItem: null,
  frameColor: null,
  frameItem: null,
  auraColor: null,
  auraItem: null,
  bannerColor: null,
  bannerItem: null,
  skinItem: null,
  skinChip: null,
  backgroundItem: null,
  backgroundColor: null,
};

describe('EquippedPlayerAvatar', () => {
  it('passes resolved urls/colors to PlayerAvatar', () => {
    vi.mocked(hook.useEquippedCosmetics).mockReturnValue({
      ...allNulls,
      avatarUrl: '/a.png',
      badgeUrl: '/b.png',
      nameColor: '#fff',
      frameColor: '#ff0',
      auraColor: '#0ff',
      bannerColor: '#f0f',
    });
    render(
      <EquippedPlayerAvatar
        name="Jane"
        size="card"
        equippedAvatarId="a-1"
        equippedBadgeId="b-1"
        equippedFrameId="f-1"
        equippedAuraId="au-1"
        equippedBannerId="bn-1"
        data-testid="epa"
      />,
    );
    expect(screen.getByTestId('epa-banner')).toBeInTheDocument();
    expect(screen.getByTestId('epa-name')).toHaveTextContent('Jane');
  });

  it('passes skinChip from useEquippedCosmetics to PlayerAvatar', () => {
    vi.mocked(hook.useEquippedCosmetics).mockReturnValue({
      ...allNulls,
      skinItem: null,
      skinChip: { id: 'skin-neon', label: 'items.game_skin.skin-neon.name' },
    });
    render(
      <EquippedPlayerAvatar
        name="Jane"
        size="card"
        equippedAvatarId={null}
        equippedBadgeId={null}
        equippedGameSkinId="skin-neon"
        data-testid="pa"
      />,
    );
    const skin = screen.getByTestId('pa-skin');
    expect(skin).toBeInTheDocument();
    expect(skin.textContent ?? '').toMatch(/SKIN/);
  });

  it('falls back to fallbackAvatarUrl when catalog returns null', () => {
    vi.mocked(hook.useEquippedCosmetics).mockReturnValue(allNulls);
    render(
      <EquippedPlayerAvatar
        name="Jane"
        equippedAvatarId={null}
        equippedBadgeId={null}
        fallbackAvatarUrl="/legacy.png"
        data-testid="epa"
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', '/legacy.png');
  });
});
