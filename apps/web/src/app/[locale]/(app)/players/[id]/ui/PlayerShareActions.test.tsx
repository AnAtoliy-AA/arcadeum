import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayerShareActions } from './PlayerShareActions';

describe('PlayerShareActions', () => {
  it('renders share button and copies link to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <PlayerShareActions
        playerId="user-1"
        playerName="Nightblade"
        isSelf={false}
      />,
    );

    const shareBtn = screen.getByTestId('share-profile-button');
    expect(shareBtn).toBeInTheDocument();
    expect(screen.getByTestId('challenge-player-link')).toBeInTheDocument();

    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText('Profile Link Copied!')).toBeInTheDocument();
    });
  });

  it('renders self management links when viewing own profile', () => {
    render(<PlayerShareActions playerId="me" playerName="You" isSelf={true} />);

    expect(screen.getByTestId('edit-cosmetics-link')).toBeInTheDocument();
    expect(screen.getByTestId('account-settings-link')).toBeInTheDocument();
    expect(
      screen.queryByTestId('challenge-player-link'),
    ).not.toBeInTheDocument();
  });
});
