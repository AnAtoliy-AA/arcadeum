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
  onOfferTakeback: () => void;
  onAcceptTakeback: () => void;
  onDeclineTakeback: () => void;
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
  onFlipBoard?: () => void;
  onExportPgn?: () => void;
  onToggleConfirmMoves?: () => void;
  confirmMoves?: boolean;
  moveCandidates?: Array<{ move: string; cp: number | null; mate: number | null; pv: string[] }> | null;
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
  onOfferTakeback,
  onAcceptTakeback,
  onDeclineTakeback,
  liveEval,
  liveEvalAnalyzing,
  onFlipBoard,
  onExportPgn,
  onToggleConfirmMoves,
  confirmMoves,
  moveCandidates,
}: ChessBoardPanelProps) {
  const [hoveredMoveIdx, setHoveredMoveIdx] = useState<number | null>(null);
  const [spectatorPerspective, setSpectatorPerspective] = useState<'white' | 'black'>('white');
  const handleMoveHover = useCallback((idx: number | null) => {
    setHoveredMoveIdx(idx);
  }, []);
  const togglePerspective = useCallback(() => {
    setSpectatorPerspective((p) => (p === 'white' ? 'black' : 'white'));
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

        <GameInfoPanel
          snapshot={snapshot}
          liveEval={liveEval}
          analyzing={liveEvalAnalyzing}
          myColor={myColor}
          isSpectator={isSpectator}
          spectatorPerspective={isSpectator ? spectatorPerspective : undefined}
          onTogglePerspective={isSpectator ? togglePerspective : undefined}
          t={t}
        />

        <LiveEvalDisplay
          eval_={liveEval ?? null}
          analyzing={!!liveEvalAnalyzing}
          myColor={myColor}
          isSpectator={isSpectator}
          spectatorPerspective={isSpectator ? spectatorPerspective : undefined}
          onTogglePerspective={isSpectator ? togglePerspective : undefined}
        />

        {moveCandidates && moveCandidates.length > 0 && (
          <div className="bg-[var(--glassBg)] border border-[var(--glassBorder)] rounded-lg p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)] mb-1">Move Candidates</div>
            {moveCandidates.map((alt, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-0.5">
                <span className="font-mono text-[var(--color)]">{alt.move}</span>
                <span className="text-[var(--textSecondary)]">
                  {alt.mate !== null ? `M${alt.mate}` : alt.cp !== null ? `${(alt.cp / 100).toFixed(1)}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1.5">
          {onFlipBoard && (
            <button
              onClick={onFlipBoard}
              className="flex-1 text-[10px] py-1.5 px-2 rounded bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
            >
              ↻ Flip
            </button>
          )}
          {onExportPgn && (
            <button
              onClick={onExportPgn}
              className="flex-1 text-[10px] py-1.5 px-2 rounded bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
            >
              ↓ PGN
            </button>
          )}
          {onToggleConfirmMoves && (
            <button
              onClick={onToggleConfirmMoves}
              className={`flex-1 text-[10px] py-1.5 px-2 rounded border transition-colors ${
                confirmMoves
                  ? 'bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--primary)]'
                  : 'bg-[var(--glassBg)] border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)]'
              }`}
            >
              {confirmMoves ? '✓ Confirm' : 'Confirm'}
            </button>
          )}
        </div>

        {currentFen && (
          <OpeningExplorer fen={currentFen} />
        )}

        <MoveList state={snapshot} t={t} onMoveHover={handleMoveHover} />

        <ActionsBar
          hasDrawOffer={hasDrawOffer}
          isMyDrawOffer={isMyDrawOffer}
          hasTakebackOffer={!!snapshot?.takebackOfferedBy}
          isMyTakebackOffer={snapshot?.takebackOfferedBy === currentUserId}
          isGameOver={isGameOver}
          isSpectator={isSpectator}
          currentUserId={currentUserId}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
          onAcceptDraw={onAcceptDraw}
          onOfferTakeback={onOfferTakeback}
          onAcceptTakeback={onAcceptTakeback}
          onDeclineTakeback={onDeclineTakeback}
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
