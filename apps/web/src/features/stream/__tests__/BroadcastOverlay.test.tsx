import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BroadcastOverlay } from '../ui/BroadcastOverlay';
import type { OverlayModel, OverlayPlayer } from '../lib/overlayModel';
import { testT } from './testT';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: testT }),
}));

function player(over: Partial<OverlayPlayer> = {}): OverlayPlayer {
  return {
    id: 'bot-a',
    name: 'Bot 1',
    isBot: true,
    personality: { kind: 'difficulty', level: 'expert' },
    active: false,
    isWinner: false,
    score: null,
    stats: [],
    capturedGlyphs: '',
    side: null,
    ...over,
  };
}

function model(over: Partial<OverlayModel> = {}): OverlayModel {
  return {
    gameId: 'checkers_v1',
    phase: 'active',
    outcome: { kind: 'none', winnerNames: [] },
    players: [
      player({ active: true, stats: [{ key: 'piecesLeft', value: 9 }] }),
      player({ id: 'bot-b', name: 'Bot 2' }),
    ],
    moveCount: null,
    progressToken: 't',
    ...over,
  };
}

const renderOverlay = (m: OverlayModel | null, extra = {}) =>
  render(
    <BroadcastOverlay
      title="Checkers"
      model={m}
      joinUrl="https://arcadeum.games"
      lastChangeAt={Date.now()}
      {...extra}
    >
      <div data-testid="board-slot" />
    </BroadcastOverlay>,
  );

describe('BroadcastOverlay', () => {
  it('shows title, bot badge, live tag and the ARC label', () => {
    renderOverlay(model());
    expect(screen.getByTestId('overlay-title')).toHaveTextContent('Checkers');
    expect(screen.getByTestId('overlay-bot-badge')).toHaveTextContent(
      'Bot vs Bot',
    );
    expect(screen.getByTestId('overlay-live')).toHaveTextContent('LIVE');
    expect(screen.getByTestId('overlay-arc')).toHaveTextContent('ARC');
    expect(screen.getByTestId('board-slot')).toBeInTheDocument();
  });

  it('renders every player with a personality label and marks the active one', () => {
    renderOverlay(model());
    const cards = screen.getAllByTestId('overlay-player');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute('data-active', 'true');
    expect(cards[1]).toHaveAttribute('data-active', 'false');
    expect(
      within(cards[0]).getByTestId('overlay-player-label'),
    ).toHaveTextContent('Expert bot');
    expect(cards[0]).toHaveTextContent('Pieces 9');
  });

  it('shows the chess personality and captured pieces', () => {
    renderOverlay(
      model({
        gameId: 'chess_v1',
        players: [
          player({
            name: 'Bot 1',
            personality: {
              kind: 'chess',
              name: 'Blitz Betty',
              rating: 1800,
              style: 'aggressive',
            },
            capturedGlyphs: '♛♟',
            score: 7,
            side: 'white',
          }),
        ],
      }),
    );
    expect(screen.getByTestId('overlay-player-name')).toHaveTextContent(
      'Blitz Betty',
    );
    expect(screen.getByTestId('overlay-player-label')).toHaveTextContent(
      'Aggressive | Rating 1800',
    );
    expect(screen.getByTestId('overlay-player-captured')).toHaveTextContent(
      '♛♟',
    );
    expect(screen.getByTestId('overlay-player-score')).toHaveTextContent(
      'Material +7',
    );
  });

  it('shows whose move it is plus a thinking indicator with a move timer', () => {
    renderOverlay(model());
    expect(screen.getByTestId('overlay-turn')).toHaveTextContent(
      'Bot 1 to move',
    );
    expect(screen.getByTestId('overlay-thinking')).toHaveTextContent(
      'Thinking',
    );
    expect(screen.getByTestId('overlay-move-timer')).toHaveTextContent(
      /^0:0\d$/,
    );
  });

  it('announces a winner, a shared win and a draw', () => {
    const { rerender } = renderOverlay(
      model({
        phase: 'finished',
        outcome: { kind: 'win', winnerNames: ['Bot 2'] },
      }),
    );
    expect(screen.getByTestId('overlay-result')).toHaveTextContent(
      'Bot 2 wins',
    );
    expect(screen.queryByTestId('overlay-thinking')).toBeNull();

    const again = (m: OverlayModel) =>
      rerender(
        <BroadcastOverlay
          title="Checkers"
          model={m}
          joinUrl="https://arcadeum.games"
          lastChangeAt={0}
        >
          <div />
        </BroadcastOverlay>,
      );
    again(
      model({
        phase: 'finished',
        outcome: { kind: 'win', winnerNames: ['Bot 1', 'Bot 3'] },
      }),
    );
    expect(screen.getByTestId('overlay-result')).toHaveTextContent(
      'Bot 1, Bot 3 win',
    );
    again(
      model({ phase: 'finished', outcome: { kind: 'draw', winnerNames: [] } }),
    );
    expect(screen.getByTestId('overlay-result')).toHaveTextContent('Draw');
  });

  it('shows a starting-soon state with no model yet', () => {
    renderOverlay(null);
    expect(screen.getByTestId('overlay-status')).toHaveTextContent(
      'Starting soon',
    );
    expect(screen.queryAllByTestId('overlay-player')).toHaveLength(0);
  });

  it('has the call to action and a QR pointing at the join URL', () => {
    renderOverlay(model());
    expect(screen.getByTestId('overlay-cta')).toHaveTextContent(
      'Play at arcadeum.games',
    );
    expect(screen.getByTestId('stream-qr')).toHaveAttribute(
      'data-qr-url',
      'https://arcadeum.games',
    );
  });

  it('uses the configured join host', () => {
    render(
      <BroadcastOverlay
        title="Go"
        model={model()}
        joinUrl="https://play.example.com/rooms"
        lastChangeAt={0}
      >
        <div />
      </BroadcastOverlay>,
    );
    expect(screen.getByTestId('overlay-cta')).toHaveTextContent(
      'Play at play.example.com',
    );
    expect(screen.getByTestId('stream-qr')).toHaveAttribute(
      'data-qr-url',
      'https://play.example.com/rooms',
    );
  });

  it('only shows the reconnecting badge in debug mode', () => {
    const { unmount } = renderOverlay(model());
    expect(screen.queryByTestId('stream-debug')).toBeNull();
    expect(screen.queryByTestId('stream-reconnecting')).toBeNull();
    unmount();

    renderOverlay(model(), {
      debug: { connected: false, roomId: 'r1', updates: 3 },
    });
    expect(screen.getByTestId('stream-debug')).toHaveTextContent('room=r1');
    expect(screen.getByTestId('stream-reconnecting')).toHaveTextContent(
      'Reconnecting',
    );
  });

  it('hides the badge in debug mode while connected', () => {
    renderOverlay(model(), {
      debug: { connected: true, roomId: 'r1', updates: 1 },
    });
    expect(screen.queryByTestId('stream-reconnecting')).toBeNull();
  });

  it('carries no price, yield or financial claims', () => {
    const { container } = renderOverlay(
      model({
        phase: 'finished',
        outcome: { kind: 'win', winnerNames: ['Bot 1'] },
      }),
    );
    expect(container.textContent ?? '').not.toMatch(
      /\$|price|yield|apy|apr|profit|earn|invest|moon|pump|buy|sell|airdrop|%/i,
    );
  });
});
