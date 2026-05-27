import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { PlayerAvatar } from './PlayerAvatar';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('PlayerAvatar', () => {
  it('renders initials when no avatarUrl', () => {
    render(<PlayerAvatar name="Jane Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders the avatar image when avatarUrl is provided', () => {
    render(<PlayerAvatar name="Jane" avatarUrl="/x.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/x.png');
  });

  it('does not render badge / frame / aura / banner at icon size', () => {
    render(
      <PlayerAvatar
        name="J"
        size="icon"
        badgeUrl="/b.png"
        frameColor="#abcdef"
        auraColor="#ff0"
        bannerColor="#0f0"
        data-testid="pa"
      />,
    );
    expect(screen.queryByTestId('pa-badge')).toBeNull();
    expect(screen.queryByTestId('pa-frame')).toBeNull();
    expect(screen.queryByTestId('pa-aura')).toBeNull();
    expect(screen.queryByTestId('pa-banner')).toBeNull();
  });

  it('renders the badge at sm/md/card sizes', () => {
    const { rerender } = render(
      <PlayerAvatar name="J" badgeUrl="/b.png" size="sm" data-testid="pa" />,
    );
    expect(screen.getByTestId('pa-badge')).toBeInTheDocument();

    rerender(
      <TamaguiProvider config={config} defaultTheme="dark">
        <PlayerAvatar name="J" badgeUrl="/b.png" size="md" data-testid="pa" />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('pa-badge')).toBeInTheDocument();

    rerender(
      <TamaguiProvider config={config} defaultTheme="dark">
        <PlayerAvatar name="J" badgeUrl="/b.png" size="card" data-testid="pa" />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('pa-badge')).toBeInTheDocument();
  });

  it('renders the frame ring at sm/md/card', () => {
    const { rerender } = render(
      <PlayerAvatar
        name="J"
        frameColor="#ff00ff"
        size="sm"
        data-testid="pa"
      />,
    );
    expect(screen.getByTestId('pa-frame')).toBeInTheDocument();

    rerender(
      <TamaguiProvider config={config} defaultTheme="dark">
        <PlayerAvatar
          name="J"
          frameColor="#ff00ff"
          size="md"
          data-testid="pa"
        />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('pa-frame')).toBeInTheDocument();
  });

  it('renders the aura halo at md/card only', () => {
    const { rerender } = render(
      <PlayerAvatar name="J" auraColor="#ff0" size="sm" data-testid="pa" />,
    );
    expect(screen.queryByTestId('pa-aura')).toBeNull();

    rerender(
      <TamaguiProvider config={config} defaultTheme="dark">
        <PlayerAvatar name="J" auraColor="#ff0" size="md" data-testid="pa" />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('pa-aura')).toBeInTheDocument();
  });

  it('renders banner sentinel, name label, and presence line only at card', () => {
    const { rerender } = render(
      <PlayerAvatar
        name="Jane"
        bannerColor="#0f0"
        presenceLine="Level 42"
        size="md"
        data-testid="pa"
      />,
    );
    expect(screen.queryByTestId('pa-banner')).toBeNull();
    expect(screen.queryByTestId('pa-name')).toBeNull();
    expect(screen.queryByText('Level 42')).toBeNull();

    rerender(
      <TamaguiProvider config={config} defaultTheme="dark">
        <PlayerAvatar
          name="Jane"
          bannerColor="#0f0"
          presenceLine="Level 42"
          size="card"
          data-testid="pa"
        />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('pa-banner')).toBeInTheDocument();
    expect(screen.getByTestId('pa-name')).toHaveTextContent('Jane');
    expect(screen.getByText('Level 42')).toBeInTheDocument();
  });

  it('calls onPress when clicked', () => {
    const onPress = vi.fn();
    render(<PlayerAvatar name="J" onPress={onPress} data-testid="pa" />);
    fireEvent.click(screen.getByTestId('pa'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders banner sentinel, name label, and presence line at profile size', () => {
    render(
      <PlayerAvatar
        name="Jane"
        bannerColor="#0f0"
        presenceLine="Level 99"
        size="profile"
        data-testid="pa"
      />,
    );
    expect(screen.getByTestId('pa-banner')).toBeInTheDocument();
    expect(screen.getByTestId('pa-name')).toHaveTextContent('Jane');
    expect(screen.getByText('Level 99')).toBeInTheDocument();
  });

  it('uses low-alpha hex tint + full border for solid frame color', () => {
    render(
      <PlayerAvatar
        name="J"
        frameColor="#ff00ff"
        size="md"
        data-testid="pa"
      />,
    );
    const disc = screen.getByTestId('pa-disc');
    expect(disc.style.backgroundColor || disc.style.background).toMatch(
      /#ff00ff33|rgba\(255,\s*0,\s*255,\s*0\.2\)/i,
    );
    expect(disc.style.borderColor).toMatch(
      /#ff00ff|rgb\(255,\s*0,\s*255\)/i,
    );
  });

  it('uses dark wash composite + first-hex border for gradient frame', () => {
    render(
      <PlayerAvatar
        name="J"
        frameColor="linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)"
        size="md"
        data-testid="pa"
      />,
    );
    const disc = screen.getByTestId('pa-disc');
    expect(disc.style.backgroundImage).toMatch(
      /rgba\(15,\s*23,\s*42,\s*0\.55\)/,
    );
    expect(disc.style.backgroundImage).toContain('linear-gradient(135deg');
    expect(disc.style.borderColor).toMatch(
      /#22d3ee|rgb\(34,\s*211,\s*238\)/i,
    );
  });

  it('renders the rays layer at md+ when aura is set', () => {
    render(
      <PlayerAvatar name="J" auraColor="#ff0" size="md" data-testid="pa" />,
    );
    expect(screen.getByTestId('pa-rays')).toBeInTheDocument();
  });

  it('renders the rays layer at md+ using rarityGlow when aura is absent', () => {
    render(
      <PlayerAvatar
        name="J"
        rarityGlow="rgba(168,85,247,0.26)"
        size="md"
        data-testid="pa"
      />,
    );
    expect(screen.getByTestId('pa-rays')).toBeInTheDocument();
  });

  it('does not render the rays layer at sm', () => {
    render(
      <PlayerAvatar name="J" auraColor="#ff0" size="sm" data-testid="pa" />,
    );
    expect(screen.queryByTestId('pa-rays')).toBeNull();
  });

  it('does not render the rays layer when neither aura nor rarityGlow set', () => {
    render(<PlayerAvatar name="J" size="md" data-testid="pa" />);
    expect(screen.queryByTestId('pa-rays')).toBeNull();
  });

  it('renders the skin chip at card/profile when skinChip prop set', () => {
    render(
      <PlayerAvatar
        name="J"
        skinChip={{ id: 'skin-1', label: 'Neon' }}
        size="card"
        data-testid="pa"
      />,
    );
    expect(screen.getByTestId('pa-skin')).toHaveTextContent(/NEON/i);
  });

  it('does not render the skin chip below card', () => {
    render(
      <PlayerAvatar
        name="J"
        skinChip={{ id: 'skin-1', label: 'Neon' }}
        size="md"
        data-testid="pa"
      />,
    );
    expect(screen.queryByTestId('pa-skin')).toBeNull();
  });

  it('renders topLeftOverlay above the disc', () => {
    render(
      <PlayerAvatar
        name="J"
        size="profile"
        topLeftOverlay={<span data-testid="overlay">TRY-ON</span>}
        data-testid="pa"
      />,
    );
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });
});
