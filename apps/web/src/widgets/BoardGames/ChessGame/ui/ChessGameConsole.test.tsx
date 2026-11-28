import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ChessGameConsole } from './ChessGameConsole';
import type { ChessClientState } from '../types';

describe('ChessGameConsole', () => {
  const defaultSnapshot: ChessClientState = {
    phase: 'playing',
    gameCreatedAt: Date.now(),
    variant: 'standard',
    timeControl: null,
    board: Array.from({ length: 8 }, () => Array(8).fill(null)),
    players: [
      { playerId: 'user-1', color: 'white', isBot: false },
      { playerId: 'bot-1', color: 'black', isBot: true },
    ],
    currentTurnColor: 'white',
    moveHistory: [],
    positionHistory: [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    ],
    halfMoveClock: 0,
    fullMoveNumber: 1,
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassantTarget: null,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDrawByRepetition: false,
    isDrawByFiftyMoveRule: false,
    isInsufficientMaterial: false,
    isDrawByAgreement: false,
    winnerColor: null,
    drawOfferedBy: null,
    takebackOfferedBy: null,
    takebackMoveIndex: null,
    clocks: null,
    currentTurnIndex: 0,
    logs: [],
    legalMovesForCurrentPlayer: [],
  };

  const defaultProps = {
    snapshot: defaultSnapshot,
    myColor: 'white' as const,
    isGameOver: false,
    isSpectator: false,
    currentUserId: 'user-1',
    coach: {
      enabled: false,
      hint: null,
      visible: true,
      hintAvailable: false,
      toggleEnabled: vi.fn(),
      requestHint: vi.fn(),
    },
    t: ((key: string) => key) as never,
    onOfferDraw: vi.fn(),
    onResign: vi.fn(),
    onAcceptDraw: vi.fn(),
    onOfferTakeback: vi.fn(),
    onAcceptTakeback: vi.fn(),
    onDeclineTakeback: vi.fn(),
  };

  it('hides admin streamer assists in settings when user is not admin', () => {
    render(<ChessGameConsole {...defaultProps} isAdmin={false} />);
    const settingsTabBtn = screen.getByText('Tools & Settings');
    fireEvent.click(settingsTabBtn);

    expect(screen.queryByText('Admin Streamer Assists')).toBeNull();
    expect(screen.queryByText(/Best Move Arrow/)).toBeNull();
    expect(screen.queryByText(/Threats & Attacks/)).toBeNull();
  });

  it('shows admin streamer assists in settings when user is admin', () => {
    const onToggleBestMove = vi.fn();
    const onToggleThreats = vi.fn();

    render(
      <ChessGameConsole
        {...defaultProps}
        isAdmin={true}
        showBestMove={false}
        showThreats={false}
        onToggleBestMove={onToggleBestMove}
        onToggleThreats={onToggleThreats}
      />,
    );

    const settingsTabBtn = screen.getByText('Tools & Settings');
    fireEvent.click(settingsTabBtn);

    expect(screen.getByText('Admin Streamer Assists')).toBeDefined();

    const bestMoveBtn = screen.getByText('🎯 Best Move Arrow: OFF');
    const threatsBtn = screen.getByText('⚔️ Threats & Attacks: OFF');

    fireEvent.click(bestMoveBtn);
    expect(onToggleBestMove).toHaveBeenCalledTimes(1);

    fireEvent.click(threatsBtn);
    expect(onToggleThreats).toHaveBeenCalledTimes(1);
  });
  const liveEval = {
    cp: 120,
    mate: null,
    pv: ['e2e4', 'e7e5'],
    depth: 12,
    selDepth: 14,
    nodes: 1000,
    nps: 1000,
    timeMs: 10,
  };
  const candidates = [
    { move: 'e2e4', cp: 120, mate: null, pv: ['e2e4'] },
    { move: 'd2d4', cp: 100, mate: null, pv: ['d2d4'] },
  ];

  it('hides engine telemetry and candidate lines when engine aids are locked', () => {
    render(
      <ChessGameConsole
        {...defaultProps}
        engineAids={false}
        liveEval={liveEval}
        moveCandidates={candidates}
      />,
    );
    expect(screen.getByTestId('chess-engine-aids-locked').textContent).toBe(
      'games.chess_v1.play.engineLocked',
    );
    expect(screen.queryByText('Best:')).toBeNull();
    expect(screen.queryByText('Top Candidate Lines')).toBeNull();
    expect(screen.queryByText('+1.2')).toBeNull();
  });

  it('shows engine telemetry when engine aids are allowed', () => {
    render(
      <ChessGameConsole
        {...defaultProps}
        engineAids
        liveEval={liveEval}
        moveCandidates={candidates}
      />,
    );
    expect(screen.queryByTestId('chess-engine-aids-locked')).toBeNull();
    expect(screen.getByText('Best:')).toBeDefined();
    expect(screen.getByText('Top Candidate Lines')).toBeDefined();
  });
});
