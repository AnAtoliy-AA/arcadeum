'use client';

import { memo, useState, useCallback } from 'react';
import { ChessBoard } from './ChessBoard';
import { MoveList } from './MoveList';
import {
  TurnBar,
  PlayerCards,
  GameInfoPanel,
  ActionsBar,
} from './ChessPanelComponents';
import { CoachControls } from '@/features/coach/ui/CoachControls';
import type { UseChessCoachResult } from '../hooks/useChessCoach';
import type { ChessClientState, BoardPosition, File, Rank } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

interface ChessBoardPanelProps {
  snapshot: ChessClientState | null;
  myColor: 'white' | 'black' | null;
  isFlipped: boolean;
  displayMyTurn: boolean;
  isGameOver: boolean;
  isSpectator: boolean;
  selectedSquare: BoardPosition | null;
  legalMoves: BoardPosition[];
  lastMove: { from: BoardPosition; to: BoardPosition } | null;
  kingPosition: BoardPosition | null;
  coach: UseChessCoachResult;
  currentUserId: string | null;
  resolveName: (id: string) => string;
  t: TranslateFn;
  onSquareClick: (file: File, rank: Rank) => void;
  onDeselectSquare: () => void;
  onPieceDrop: (
    fromFile: File,
    fromRank: Rank,
    toFile: File,
    toRank: Rank,
  ) => void;
  onOfferDraw: () => void;
  onResign: () => void;
  onAcceptDraw: () => void;
}

function ChessBoardPanelImpl({
  snapshot,
  myColor,
  isFlipped,
  displayMyTurn,
  isGameOver,
  isSpectator,
  selectedSquare,
  legalMoves,
  lastMove,
  kingPosition,
  coach,
  currentUserId,
  resolveName,
  t,
  onSquareClick,
  onDeselectSquare,
  onPieceDrop,
  onOfferDraw,
  onResign,
  onAcceptDraw,
}: ChessBoardPanelProps) {
  const [hoveredMoveIdx, setHoveredMoveIdx] = useState<number | null>(null);
  const handleMoveHover = useCallback((idx: number | null) => {
    setHoveredMoveIdx(idx);
  }, []);

  if (!snapshot) return null;

  const players = snapshot.players ?? [];
  const whitePlayer = players.find((p) => p.color === 'white');
  const blackPlayer = players.find((p) => p.color === 'black');

  const whiteName = whitePlayer?.playerId
    ? resolveName(whitePlayer.playerId)
    : 'White';
  const blackName = blackPlayer?.playerId
    ? resolveName(blackPlayer.playerId)
    : 'Black';

  const hasDrawOffer = !!snapshot?.drawOfferedBy;
  const isMyDrawOffer = snapshot?.drawOfferedBy === currentUserId;

  const highlightMove =
    hoveredMoveIdx !== null && snapshot.moveHistory[hoveredMoveIdx]
      ? {
          from: snapshot.moveHistory[hoveredMoveIdx].from,
          to: snapshot.moveHistory[hoveredMoveIdx].to,
        }
      : lastMove;

  const coachVisible = coach.visible;

  return (
    <div className="chess-layout">
      <style>{`
        .chess-layout {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 12px;
        }
        .chess-board-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chess-info-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .player-cards-container {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .player-card-stat-box {
          flex: 1;
          padding: 10px 14px;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }
        .player-card-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
        }
        .player-card-stat-label {
          font-size: 9px;
          font-weight: 600;
          color: rgba(148, 163, 184, 0.6);
          text-transform: uppercase;
          margin-top: 2px;
        }
        @media (max-width: 480px) {
          .player-cards-container {
            gap: 8px;
          }
          .player-card-stat-box {
            padding: 4px 6px;
          }
          .player-card-stat-value {
            font-size: 13px;
          }
          .player-card-stat-label {
            font-size: 7px;
          }
        }
        @media (min-width: 768px) {
          .chess-layout {
            flex-direction: row;
            align-items: flex-start;
          }
          .chess-board-col {
            flex: 0 0 auto;
            width: min(70vmin, 560px);
            position: sticky;
            top: 12px;
          }
          .chess-info-col {
            flex: 1;
            min-width: 0;
            max-width: 280px;
          }
        }
      `}</style>

      <div className="chess-board-col">
        <TurnBar
          currentTurnColor={snapshot.currentTurnColor}
          isCheck={snapshot.isCheck}
          isCheckmate={snapshot.isCheckmate}
          fullMoveNumber={snapshot.fullMoveNumber}
          t={t}
        />

        <ChessBoard
          board={snapshot.board}
          myColor={myColor}
          isFlipped={isFlipped}
          disabled={!displayMyTurn || isGameOver || isSpectator}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={highlightMove}
          hintMove={
            coach.hint ? { from: coach.hint.from, to: coach.hint.to } : null
          }
          isCheck={snapshot.isCheck}
          kingPosition={kingPosition}
          ariaLabel={t('games.chess_v1.status.boardLabel', {
            color:
              snapshot.currentTurnColor === 'white'
                ? t('games.chess_v1.status.white')
                : t('games.chess_v1.status.black'),
          })}
          onSquareClick={onSquareClick}
          onDeselectSquare={onDeselectSquare}
          onPieceDrop={onPieceDrop}
        />
      </div>

      <div className="chess-info-col">
        <PlayerCards
          whiteId={whitePlayer?.playerId ?? ''}
          blackId={blackPlayer?.playerId ?? ''}
          whiteName={whiteName}
          blackName={blackName}
          currentTurnColor={snapshot.currentTurnColor}
          isGameOver={isGameOver}
          clocks={snapshot.clocks}
          timeControl={snapshot.timeControl}
        />

        <GameInfoPanel snapshot={snapshot} t={t} />

        <MoveList state={snapshot} t={t} onMoveHover={handleMoveHover} />

        <ActionsBar
          hasDrawOffer={hasDrawOffer}
          isMyDrawOffer={isMyDrawOffer}
          isGameOver={isGameOver}
          isSpectator={isSpectator}
          currentUserId={currentUserId}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
          onAcceptDraw={onAcceptDraw}
          t={t}
        />

        {coachVisible && (
          <CoachControls
            enabled={coach.enabled}
            hintAvailable={coach.hintAvailable}
            hint={coach.hint}
            t={t}
            onToggle={coach.toggleEnabled}
            onHint={coach.requestHint}
          />
        )}
      </div>
    </div>
  );
}

export const ChessBoardPanel = memo(ChessBoardPanelImpl);
