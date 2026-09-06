import React, { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '@/shared/lib/theme';
import type { ChessRoomProps, ChessRoomHandle, ChessBoardState, ChessFile, ChessRank, ChessPiece } from './ChessRoom.types';

const FILES: ChessFile[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS: ChessRank[] = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

function ChessBoardView({
  board,
  selectedSquare,
  onSquarePress,
  disabled,
}: {
  board: (ChessPiece | null)[][];
  selectedSquare: { file: ChessFile; rank: ChessRank } | null;
  onSquarePress: (file: ChessFile, rank: ChessRank) => void;
  disabled: boolean;
}) {
  const { theme } = useThemedStyles();

  return (
    <View style={styles.boardContainer}>
      {RANKS.map((rank) => (
        <View key={rank} style={styles.boardRow}>
          {FILES.map((file) => {
            const row = 8 - rank;
            const col = FILES.indexOf(file);
            const piece = board[row]?.[col] ?? null;
            const isLight = (row + col) % 2 === 0;
            const isSelected = selectedSquare?.file === file && selectedSquare?.rank === rank;

            return (
              <TouchableOpacity
                key={`${file}-${rank}`}
                style={[
                  styles.boardSquare,
                  {
                    backgroundColor: isSelected
                      ? theme.selectedSquare
                      : isLight
                        ? theme.lightSquare
                        : theme.darkSquare,
                  },
                ]}
                onPress={() => onSquarePress(file, rank)}
                disabled={disabled}
              >
                {piece && (
                  <Text style={styles.piece}>
                    {PIECE_SYMBOLS[`${piece.color}-${piece.type}`] ?? ''}
                  </Text>
                )}
                <Text style={[styles.coordinate, { color: isLight ? '#779952' : '#edeed1' }]}>
                  {file}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export const ChessRoom = forwardRef<ChessRoomHandle, ChessRoomProps>(
  function ChessRoom(
    {
      room,
      session,
      loading,
      error,
      isHost,
      onLeaveRoom,
    },
    ref,
  ) {
    const { theme } = useThemedStyles();
    const [selectedSquare, setSelectedSquare] = useState<{ file: ChessFile; rank: ChessRank } | null>(null);

    const boardState: ChessBoardState = session?.state as unknown as ChessBoardState ?? {
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      currentTurnColor: 'white',
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
    };

    const handleSquarePress = useCallback((file: ChessFile, rank: ChessRank) => {
      if (selectedSquare) {
        setSelectedSquare(null);
      } else {
        setSelectedSquare({ file, rank });
      }
    }, [selectedSquare]);

    useImperativeHandle(ref, () => ({
      onSessionSnapshot: () => {},
      onSessionStarted: () => {},
      onChessActionPerformed: () => {},
      onException: () => {},
    }));

    if (loading) {
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.loadingText, { color: theme.color }]}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.color }]}>
            {room?.name ?? 'Chess'}
          </Text>
          <Text style={[styles.turnIndicator, { color: theme.primary }]}>
            {boardState.currentTurnColor === 'white' ? 'White' : 'Black'} to move
            {boardState.isCheck ? ' (Check!)' : ''}
          </Text>
        </View>

        <ChessBoardView
          board={boardState.board}
          selectedSquare={selectedSquare}
          onSquarePress={handleSquarePress}
          disabled={false}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.error }]}
            onPress={onLeaveRoom}
          >
            <Text style={styles.buttonText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  turnIndicator: {
    fontSize: 14,
    marginTop: 4,
  },
  boardContainer: {
    alignSelf: 'center',
    aspectRatio: 1,
    width: '90%',
    maxWidth: 400,
  },
  boardRow: {
    flex: 1,
    flexDirection: 'row',
  },
  boardSquare: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    fontSize: 28,
  },
  coordinate: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
