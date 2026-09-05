'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { ChessBoard } from './ChessBoard';
import { MoveList } from './MoveList';
import {
  TurnBar,
  PlayerCards,
  GameInfoPanel,
  ActionsBar,
} from './ChessPanelComponents';
import { CoachControls } from '@/features/coach/ui/CoachControls';
import { LiveEvalDisplay } from './LiveEvalDisplay';
import { OpeningExplorer } from '@/features/analysis/ui/OpeningExplorer';
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
  liveEval?: {
    cp: number | null;
    mate: number | null;
    pv: string[];
    depth: number;
    selDepth: number;
    nodes: number;
    nps: number;
    timeMs: number;
  } | null;
  liveEvalAnalyzing?: boolean;
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
  liveEval,
  liveEvalAnalyzing,
}: ChessBoardPanelProps) {
  const [hoveredMoveIdx, setHoveredMoveIdx] = useState<number | null>(null);
  const handleMoveHover = useCallback((idx: number | null) => {
    setHoveredMoveIdx(idx);
  }, []);

  const currentFen = useMemo(() => {
    if (!snapshot?.positionHistory?.length) return null;
    return snapshot.positionHistory[snapshot.positionHistory.length - 1];
  }, [snapshot]);

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
    <div className="flex flex-col md:flex-row md:items-start gap-3 w-full max-w-[900px] mx-auto p-3">
      <div className="flex flex-col gap-2 md:flex-none md:w-[min(70vmin,560px)] md:sticky md:top-3">
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

      <div className="flex flex-col gap-3 flex-1 min-w-0 md:max-w-[280px]">
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

        <LiveEvalDisplay
          eval_={liveEval ?? null}
          analyzing={!!liveEvalAnalyzing}
        />

        {currentFen && (
          <OpeningExplorer fen={currentFen} />
        )}

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
