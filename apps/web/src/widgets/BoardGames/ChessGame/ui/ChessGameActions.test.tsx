import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChessGameActions } from './ChessGameActions';

const t = ((key: string) => key) as never;

function setup(
  overrides: Partial<Parameters<typeof ChessGameActions>[0]> = {},
) {
  const props = {
    t,
    hasDrawOffer: false,
    isMyDrawOffer: false,
    hasTakebackOffer: false,
    isMyTakebackOffer: false,
    canAbort: false,
    onOfferDraw: vi.fn(),
    onAcceptDraw: vi.fn(),
    onDeclineDraw: vi.fn(),
    onResign: vi.fn(),
    onAbort: vi.fn(),
    onOfferTakeback: vi.fn(),
    onAcceptTakeback: vi.fn(),
    onDeclineTakeback: vi.fn(),
    ...overrides,
  };
  render(<ChessGameActions {...props} />);
  return props;
}

describe('ChessGameActions', () => {
  it('asks for confirmation before resigning', () => {
    const props = setup();
    fireEvent.click(screen.getByText('games.chess_v1.actions.resign'));
    expect(props.onResign).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeDefined();
    expect(document.activeElement?.textContent).toBe(
      'games.chess_v1.controls.yesResign',
    );
    fireEvent.click(screen.getByText('games.chess_v1.controls.yesResign'));
    expect(props.onResign).toHaveBeenCalledTimes(1);
  });

  it('cancels the resign confirmation with the button or Escape', () => {
    const props = setup();
    fireEvent.click(screen.getByText('games.chess_v1.actions.resign'));
    fireEvent.click(screen.getByText('games.chess_v1.controls.cancel'));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    fireEvent.click(screen.getByText('games.chess_v1.actions.resign'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(props.onResign).not.toHaveBeenCalled();
  });

  it('offers abort instead of resign before both sides moved', () => {
    const props = setup({ canAbort: true });
    fireEvent.click(screen.getByText('games.chess_v1.controls.abort'));
    fireEvent.click(screen.getByText('games.chess_v1.controls.yesAbort'));
    expect(props.onAbort).toHaveBeenCalledTimes(1);
    expect(props.onResign).not.toHaveBeenCalled();
  });

  it('falls back to resign when abort is not wired', () => {
    setup({ canAbort: true, onAbort: undefined });
    expect(screen.getByText('games.chess_v1.actions.resign')).toBeDefined();
  });

  it('lets the player accept or decline an incoming draw offer', () => {
    const props = setup({ hasDrawOffer: true });
    expect(
      screen.getByText('games.chess_v1.controls.drawOffered'),
    ).toBeDefined();
    fireEvent.click(screen.getByText('games.chess_v1.actions.declineDraw'));
    expect(props.onDeclineDraw).toHaveBeenCalled();
    fireEvent.click(screen.getByText('games.chess_v1.actions.acceptDraw'));
    expect(props.onAcceptDraw).toHaveBeenCalled();
  });

  it('shows the pending state of my own draw offer', () => {
    setup({ hasDrawOffer: true, isMyDrawOffer: true });
    const btn = screen.getByText('games.chess_v1.actions.drawOffered');
    expect((btn.closest('button') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText('games.chess_v1.actions.acceptDraw')).toBeNull();
  });

  it('handles an incoming takeback request', () => {
    const props = setup({ hasTakebackOffer: true });
    fireEvent.click(screen.getByText('games.chess_v1.actions.acceptTakeback'));
    fireEvent.click(screen.getByText('games.chess_v1.actions.declineTakeback'));
    expect(props.onAcceptTakeback).toHaveBeenCalled();
    expect(props.onDeclineTakeback).toHaveBeenCalled();
  });
});
