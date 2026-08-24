'use client';

import { useMemo } from 'react';
import type { ReplayDetail } from '../lib/types';
import { useReplayStore } from '../store/replayStore';

interface ReplayBoardProps {
  replay: ReplayDetail;
}

export function ReplayBoard({ replay }: ReplayBoardProps) {
  const currentStep = useReplayStore((s) => s.currentStep);

  const stateAtStep = useMemo(() => {
    if (currentStep === 0) {
      return replay.initialState;
    }

    return replay.initialState;
  }, [replay.initialState, currentStep]);

  return (
    <div className="flex w-full items-center justify-center">
      <GameBoardRenderer gameId={replay.gameId} state={stateAtStep} />
    </div>
  );
}

interface GameBoardRendererProps {
  gameId: string;
  state: Record<string, unknown>;
}

function GameBoardRenderer({ gameId, state }: GameBoardRendererProps) {
  switch (gameId) {
    case 'chess_v1':
      return <ChessReplayBoard state={state} />;
    case 'checkers_v1':
      return <CheckersReplayBoard state={state} />;
    case 'tic_tac_toe_v1':
      return <TicTacToeReplayBoard state={state} />;
    default:
      return <GenericReplayBoard gameId={gameId} state={state} />;
  }
}

function ChessReplayBoard({ state }: { state: Record<string, unknown> }) {
  const board = state.board as (unknown | null)[][] | undefined;

  if (!board || !Array.isArray(board)) {
    return <BoardPlaceholder label="Chess" />;
  }

  return (
    <div className="grid grid-cols-8 gap-0 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.1)]">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const isLight = (r + c) % 2 === 0;
          const piece = cell as { type: string; color: string } | null;
          return (
            <div
              key={`${r}-${c}`}
              className={`flex h-10 w-10 items-center justify-center text-[20px] sm:h-12 sm:w-12 ${
                isLight
                  ? 'bg-[rgba(255,255,255,0.12)]'
                  : 'bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              {piece ? getPieceEmoji(piece.type, piece.color) : ''}
            </div>
          );
        }),
      )}
    </div>
  );
}

function getPieceEmoji(type: string, color: string): string {
  const white: Record<string, string> = {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  };
  const black: Record<string, string> = {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  };
  return color === 'white' ? (white[type] ?? '') : (black[type] ?? '');
}

function CheckersReplayBoard({ state }: { state: Record<string, unknown> }) {
  const board = state.board as (unknown | null)[][] | undefined;

  if (!board || !Array.isArray(board)) {
    return <BoardPlaceholder label="Checkers" />;
  }

  return (
    <div className="grid grid-cols-8 gap-0 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.1)]">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const isLight = (r + c) % 2 === 0;
          const piece = cell as {
            color: string;
            isKing?: boolean;
          } | null;
          return (
            <div
              key={`${r}-${c}`}
              className={`flex h-10 w-10 items-center justify-center text-[18px] sm:h-12 sm:w-12 ${
                isLight
                  ? 'bg-[rgba(255,255,255,0.12)]'
                  : 'bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              {piece
                ? piece.color === 'red'
                  ? piece.isKing
                    ? '🔴👑'
                    : '🔴'
                  : piece.isKing
                    ? '⚫👑'
                    : '⚫'
                : ''}
            </div>
          );
        }),
      )}
    </div>
  );
}

function TicTacToeReplayBoard({ state }: { state: Record<string, unknown> }) {
  const board = state.board as (string | null)[][] | undefined;

  if (!board || !Array.isArray(board)) {
    return <BoardPlaceholder label="Tic-Tac-Toe" />;
  }

  return (
    <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className="flex h-20 w-20 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)] text-[32px] font-bold text-white sm:h-24 sm:w-24"
          >
            {cell === 'X' ? '✕' : cell === 'O' ? '○' : ''}
          </div>
        )),
      )}
    </div>
  );
}

function GenericReplayBoard({
  gameId,
  state,
}: {
  gameId: string;
  state: Record<string, unknown>;
}) {
  const playerOrder = state.playerOrder as string[] | undefined;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-8 py-12">
      <span className="text-[48px]">🎮</span>
      <p className="text-[16px] font-semibold text-[rgba(255,255,255,0.8)]">
        {gameId}
      </p>
      {playerOrder && (
        <p className="text-[13px] text-[rgba(255,255,255,0.4)]">
          {playerOrder.length} players
        </p>
      )}
    </div>
  );
}

function BoardPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-64 w-64 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
      <span className="text-[14px] text-[rgba(255,255,255,0.4)]">
        {label} Board
      </span>
    </div>
  );
}
