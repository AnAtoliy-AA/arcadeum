'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useWidgetFullscreen } from '@/features/games/ui/GameWidgetContainer';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { ChessBoard } from './ChessBoard';
import { EvalBar } from './EvalBar';
import { ChessPlayerHud } from './ChessPlayerHud';
import { ChessGameConsole } from './ChessGameConsole';
import { LowTimeAlert } from './LowTimeAlert';
import { useChessPieceStylePreference } from '../lib/piece-style';
import {
  useBoardThemePreference,
  getBoardThemeCssVars,
} from '../lib/board-theme';
import type { UseChessCoachResult } from '../hooks/useChessCoach';
import { useMoveHistoryView } from '../hooks/useMoveHistoryView';
import { useHistoryHotkeys } from '../hooks/useHistoryHotkeys';
import { HistoryViewBanner } from './HistoryViewBanner';
import './styles/chess-arena.scss';
import type { ChessClientState, BoardPosition, File, Rank } from '../types';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

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
  onDeclineDraw?: () => void;
  onAbort?: () => void;
  onOfferTakeback: () => void;
  onAcceptTakeback: () => void;
  onDeclineTakeback: () => void;
  /** Fair-play gate: when false, every engine aid is hidden. */
  engineAids?: boolean;
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
  moveCandidates?: Array<{
    move: string;
    cp: number | null;
    mate: number | null;
    pv: string[];
  }> | null;
  pendingMove?: { from: BoardPosition; to: BoardPosition } | null;
  premoveQueue?: import('../hooks/usePremoveQueue').PremoveStep[];
  virtualBoard?: import('../types').Board | null;
  onCancelPremoves?: () => void;
  bestMoveArrow?: import('../hooks/useBoardDrawings').Arrow | null;
  threatArrows?: import('../hooks/useBoardDrawings').Arrow[];
  showBestMove?: boolean;
  showThreats?: boolean;
  onToggleBestMove?: () => void;
  onToggleThreats?: () => void;
  spectatorCount?: number;
  chatHighlightCells?: { row: number; col: number }[];
}

const NO_MOVES: BoardPosition[] = [];

function ChessBoardPanelImpl({
  snapshot,
  myColor,
  isFlipped,
  displayMyTurn: _displayMyTurn,
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
  onDeclineDraw,
  onAbort,
  onOfferTakeback,
  onAcceptTakeback,
  onDeclineTakeback,
  engineAids = true,
  liveEval,
  liveEvalAnalyzing,
  onFlipBoard,
  onExportPgn,
  onToggleConfirmMoves,
  confirmMoves,
  moveCandidates,
  pendingMove,
  premoveQueue = [],
  virtualBoard,
  onCancelPremoves,
  bestMoveArrow,
  threatArrows = [],
  showBestMove = false,
  showThreats = false,
  onToggleBestMove,
  onToggleThreats,
  spectatorCount = 0,
  chatHighlightCells = [],
}: ChessBoardPanelProps) {
  const [hoveredMoveIdx, setHoveredMoveIdx] = useState<number | null>(null);
  const { pieceStyle, setPieceStyle } = useChessPieceStylePreference();
  const { activeBoardTheme } = useBoardThemePreference();
  const isFullscreen = useWidgetFullscreen();
  const createdAt = snapshot?.gameCreatedAt ?? 0;
  const history = useMoveHistoryView(snapshot);
  useHistoryHotkeys(history.step, (snapshot?.moveHistory.length ?? 0) > 0);

  const { snapshot: sessionSnapshot } = useSessionTokens();
  const isAdmin = sessionSnapshot.role === 'admin';

  const handleMoveHover = useCallback((idx: number | null) => {
    setHoveredMoveIdx(idx);
  }, []);

  const highlightMove = useMemo(() => {
    if (hoveredMoveIdx !== null && snapshot?.moveHistory[hoveredMoveIdx]) {
      return {
        from: snapshot.moveHistory[hoveredMoveIdx].from,
        to: snapshot.moveHistory[hoveredMoveIdx].to,
      };
    }
    if (history.isViewingHistory) return history.viewedLastMove;
    return lastMove;
  }, [
    hoveredMoveIdx,
    snapshot?.moveHistory,
    lastMove,
    history.isViewingHistory,
    history.viewedLastMove,
  ]);

  const hintMove = useMemo(() => {
    if (coach.hint) return { from: coach.hint.from, to: coach.hint.to };
    if (chatHighlightCells.length >= 2) {
      const FILES_ARR = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
      const fromCell = chatHighlightCells[0];
      const toCell = chatHighlightCells[1];
      const fromFile = FILES_ARR[fromCell.col] ?? 'a';
      const toFile = FILES_ARR[toCell.col] ?? 'a';
      return {
        from: { file: fromFile, rank: (8 - fromCell.row) as Rank },
        to: { file: toFile, rank: (8 - toCell.row) as Rank },
      };
    }
    return null;
  }, [coach.hint, chatHighlightCells]);

  const boardThemeVars = useMemo(
    () => getBoardThemeCssVars(activeBoardTheme),
    [activeBoardTheme],
  );

  const {
    topPlayer,
    bottomPlayer,
    topColor,
    bottomColor,
    topName,
    bottomName,
  } = useMemo(() => {
    const players = snapshot?.players ?? [];
    const white = players.find((p) => p.color === 'white');
    const black = players.find((p) => p.color === 'black');
    const top = isFlipped ? white : black;
    const bottom = isFlipped ? black : white;
    const tColor = isFlipped ? ('white' as const) : ('black' as const);
    const bColor = isFlipped ? ('black' as const) : ('white' as const);
    return {
      topPlayer: top,
      bottomPlayer: bottom,
      topColor: tColor,
      bottomColor: bColor,
      topName: top?.playerId
        ? resolveName(top.playerId)
        : tColor === 'white'
          ? 'White'
          : 'Black',
      bottomName: bottom?.playerId
        ? resolveName(bottom.playerId)
        : bColor === 'white'
          ? 'White'
          : 'Black',
    };
  }, [snapshot?.players, isFlipped, resolveName]);

  if (!snapshot) return null;

  const topPlayerHud = (
    <ChessPlayerHud
      playerId={topPlayer?.playerId ?? ''}
      name={topName}
      color={topColor}
      isActive={snapshot.currentTurnColor === topColor}
      isGameOver={isGameOver}
      clocks={snapshot.clocks}
      currentTurnColor={snapshot.currentTurnColor}
      gameCreatedAt={createdAt}
      incrementSeconds={snapshot.timeControl?.incrementSeconds}
      board={snapshot.board}
      pieceStyle={pieceStyle}
      rating={topPlayer?.rating}
    />
  );

  const bottomPlayerHud = (
    <ChessPlayerHud
      playerId={bottomPlayer?.playerId ?? ''}
      name={bottomName}
      color={bottomColor}
      isActive={snapshot.currentTurnColor === bottomColor}
      isGameOver={isGameOver}
      clocks={snapshot.clocks}
      currentTurnColor={snapshot.currentTurnColor}
      gameCreatedAt={createdAt}
      incrementSeconds={snapshot.timeControl?.incrementSeconds}
      board={snapshot.board}
      pieceStyle={pieceStyle}
      rating={bottomPlayer?.rating}
    />
  );

  return (
    <div className={cx('chess-arena-root', isFullscreen && 'is-fullscreen')}>
      <div
        className={cx('chess-board-column', isFullscreen && 'is-fullscreen')}
        style={boardThemeVars as CSSProperties}
      >
        <div className="chess-hud-row">{topPlayerHud}</div>

        {engineAids && (
          <div className="chess-eval-horizontal">
            <EvalBar
              evalScore={liveEval?.cp ?? null}
              mateScore={liveEval?.mate ?? null}
              isFlipped={isFlipped}
              orientation="horizontal"
            />
          </div>
        )}

        <div className="chess-board-stage-wrapper">
          <div className="chess-board-stage">
            {engineAids && (
              <div className="chess-eval-container">
                <EvalBar
                  evalScore={liveEval?.cp ?? null}
                  mateScore={liveEval?.mate ?? null}
                  isFlipped={isFlipped}
                  orientation="vertical"
                />
              </div>
            )}

            <div className="chess-board-grid-wrapper relative">
              {spectatorCount > 0 && (
                <div className="absolute top-2 right-2 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-white/70 text-[10px] font-semibold select-none pointer-events-none">
                  <span>👁</span>
                  <span>{spectatorCount}</span>
                </div>
              )}
              {premoveQueue.length > 0 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-md shadow-lg text-amber-300 text-xs font-semibold select-none pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Premove ({premoveQueue.length} queued)</span>
                  {onCancelPremoves && (
                    <button
                      type="button"
                      onClick={onCancelPremoves}
                      className="ml-1 text-[11px] text-amber-200 hover:text-white underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              {history.isViewingHistory && (
                <HistoryViewBanner
                  viewIndex={history.viewIndex}
                  sanAt={
                    snapshot.moveHistory[history.viewIndex ?? -1]?.notation
                  }
                  onGoLive={history.goLive}
                  t={t}
                />
              )}
              <ChessBoard
                board={
                  history.viewedBoard ??
                  (premoveQueue.length > 0 && virtualBoard
                    ? virtualBoard
                    : snapshot.board)
                }
                myColor={myColor}
                isFlipped={isFlipped}
                disabled={isGameOver || isSpectator || history.isViewingHistory}
                selectedSquare={
                  history.isViewingHistory ? null : selectedSquare
                }
                legalMoves={history.isViewingHistory ? NO_MOVES : legalMoves}
                lastMove={highlightMove}
                hintMove={hintMove}
                pendingMove={pendingMove}
                isCheck={!history.isViewingHistory && snapshot.isCheck}
                kingPosition={kingPosition}
                pieceStyle={pieceStyle}
                premoveQueue={premoveQueue}
                onCancelPremoves={onCancelPremoves}
                bestMoveArrow={bestMoveArrow}
                threatArrows={threatArrows}
                showBestMove={engineAids && showBestMove}
                showThreats={engineAids && showThreats}
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
          </div>
        </div>

        <div className="chess-hud-row">{bottomPlayerHud}</div>
        {!isSpectator && (
          <LowTimeAlert
            myColor={myColor}
            clocks={snapshot.clocks}
            currentTurnColor={snapshot.currentTurnColor}
            isGameOver={isGameOver}
            gameCreatedAt={createdAt}
            t={t}
          />
        )}
      </div>

      <div className="chess-console-column">
        <div className="chess-landscape-hud chess-landscape-hud-top">
          {topPlayerHud}
        </div>

        <ChessGameConsole
          snapshot={snapshot}
          myColor={myColor}
          isGameOver={isGameOver}
          isSpectator={isSpectator}
          currentUserId={currentUserId}
          coach={coach}
          pieceStyle={pieceStyle}
          onSelectPieceStyle={setPieceStyle}
          engineAids={engineAids}
          liveEval={engineAids ? liveEval : null}
          liveEvalAnalyzing={liveEvalAnalyzing}
          moveCandidates={engineAids ? moveCandidates : null}
          confirmMoves={confirmMoves}
          t={t}
          onMoveHover={handleMoveHover}
          historyIndex={history.viewIndex}
          onSelectMove={history.select}
          onHistoryStep={history.step}
          onOfferDraw={onOfferDraw}
          onResign={onResign}
          onAcceptDraw={onAcceptDraw}
          onDeclineDraw={onDeclineDraw}
          onAbort={onAbort}
          onOfferTakeback={onOfferTakeback}
          onAcceptTakeback={onAcceptTakeback}
          onDeclineTakeback={onDeclineTakeback}
          onFlipBoard={onFlipBoard}
          onExportPgn={onExportPgn}
          onToggleConfirmMoves={onToggleConfirmMoves}
          isAdmin={isAdmin}
          showBestMove={showBestMove}
          showThreats={showThreats}
          onToggleBestMove={onToggleBestMove}
          onToggleThreats={onToggleThreats}
        />

        <div className="chess-landscape-hud chess-landscape-hud-bottom">
          {bottomPlayerHud}
        </div>
      </div>
    </div>
  );
}

export const ChessBoardPanel = memo(ChessBoardPanelImpl);
