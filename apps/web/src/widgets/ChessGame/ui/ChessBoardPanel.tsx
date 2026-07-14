'use client';

import { YStack, XStack, Text } from 'tamagui';
import { ChessBoard } from './ChessBoard';
import { ChessClock } from './ChessClock';
import { MoveList } from './MoveList';
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
  currentUserId: string | null;
  t: TranslateFn;
  onSquareClick: (file: File, rank: Rank) => void;
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

export function ChessBoardPanel({
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
  currentUserId,
  t,
  onSquareClick,
  onPieceDrop,
  onOfferDraw,
  onResign,
  onAcceptDraw,
}: ChessBoardPanelProps) {
  if (!snapshot) return null;

  return (
    <YStack gap="$3" alignItems="stretch" padding="$3" width="100%">
      {isSpectator && (
        <XStack
          justifyContent="center"
          padding="$2"
          borderRadius={8}
          backgroundColor="rgba(255,255,255,0.05)"
        >
          <Text fontSize="$2" opacity={0.6} fontWeight="600">
            {t('games.chess_v1.status.spectating')}
          </Text>
        </XStack>
      )}
      <ChessClock
        clocks={snapshot.clocks}
        currentTurnColor={snapshot.currentTurnColor}
        isGameOver={isGameOver}
      />
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$3" fontWeight="600" opacity={0.8}>
          {snapshot.currentTurnColor === 'white'
            ? `♔ ${t('games.chess_v1.status.white')}`
            : `♚ ${t('games.chess_v1.status.black')}`}{' '}
          {t('games.chess_v1.status.toMove')}
          {snapshot.isCheck && !snapshot.isCheckmate
            ? ` (${t('games.chess_v1.status.check').toLowerCase()})`
            : ''}
        </Text>
        <Text fontSize="$2" opacity={0.6}>
          {snapshot.fullMoveNumber}.
        </Text>
      </XStack>
      <ChessBoard
        board={snapshot.board}
        myColor={myColor}
        isFlipped={isFlipped}
        disabled={!displayMyTurn || isGameOver || isSpectator}
        selectedSquare={selectedSquare}
        legalMoves={legalMoves}
        lastMove={lastMove}
        isCheck={snapshot.isCheck}
        kingPosition={kingPosition}
        ariaLabel={`Chess board, ${snapshot.currentTurnColor} to move`}
        onSquareClick={onSquareClick}
        onPieceDrop={onPieceDrop}
      />
      <XStack justifyContent="space-between" alignItems="center" mt="$1">
        {currentUserId &&
          !isGameOver &&
          !isSpectator &&
          (snapshot?.drawOfferedBy &&
          snapshot.drawOfferedBy !== currentUserId ? (
            <XStack gap="$2" alignItems="center">
              <Text
                fontSize="$2"
                color="$green10"
                cursor="pointer"
                hoverStyle={{ opacity: 0.8 }}
                onPress={onAcceptDraw}
              >
                {t('games.chess_v1.actions.acceptDraw')}
              </Text>
              <Text
                fontSize="$2"
                opacity={0.6}
                cursor="pointer"
                hoverStyle={{ opacity: 1 }}
                onPress={onResign}
              >
                {t('games.chess_v1.actions.declineDraw')}
              </Text>
            </XStack>
          ) : (
            <XStack gap="$3" alignItems="center">
              <Text
                fontSize="$2"
                opacity={0.6}
                cursor="pointer"
                hoverStyle={{ opacity: 1 }}
                onPress={onOfferDraw}
                disabled={!!snapshot?.drawOfferedBy}
              >
                {snapshot?.drawOfferedBy
                  ? t('games.chess_v1.actions.drawOffered')
                  : t('games.chess_v1.actions.draw')}
              </Text>
              <Text
                fontSize="$2"
                opacity={0.6}
                cursor="pointer"
                hoverStyle={{ opacity: 1 }}
                onPress={onResign}
              >
                {t('games.chess_v1.actions.resign')}
              </Text>
            </XStack>
          ))}
        {snapshot.moveHistory.length > 0 && (
          <Text fontSize="$2" opacity={0.5}>
            {t('games.chess_v1.status.moves', {
              count: snapshot.moveHistory.length,
            })}
          </Text>
        )}
      </XStack>
      {snapshot.moveHistory.length > 0 && <MoveList state={snapshot} t={t} />}
    </YStack>
  );
}
