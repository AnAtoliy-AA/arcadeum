import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { ChannelTile } from './ChannelTile';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('ChannelTile', () => {
  it('renders title and sub', () => {
    render(
      <ChannelTile
        icon={<span>I</span>}
        title="Discord"
        sub="Live chat · 12.4k members"
      />,
    );
    expect(screen.getByText('Discord')).toBeInTheDocument();
    expect(screen.getByText('Live chat · 12.4k members')).toBeInTheDocument();
  });

  it('renders an anchor when href is provided', () => {
    render(
      <ChannelTile icon={<span>I</span>} title="GitHub" href="https://example" />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example');
  });

  it('opens external links in a new tab with rel=noopener', () => {
    render(
      <ChannelTile
        icon={<span>I</span>}
        title="X"
        href="https://x.com"
        external
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <ChannelTile
        icon={<span>I</span>}
        title="Telegram"
        href="#"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalled();
  });
});
