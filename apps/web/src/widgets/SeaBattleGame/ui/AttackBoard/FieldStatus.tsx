'use client';
import { memo, useMemo } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import type { CellState } from '../../types';
import { CELL_STATE } from '../../types';
import { useSeaBattleTheme } from '../../lib/SeaBattleThemeContext';

interface FieldStatusProps {
  board: CellState[][];
  isMe: boolean;
}

interface BoardStats {
  hitCells: number;
  missCells: number;
  unexploredCells: number;
  totalCells: number;
}

function computeBoardStats(board: CellState[][]): BoardStats {
  let hitCells = 0;
  let missCells = 0;

  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r]?.[c];
      if (cell === CELL_STATE.HIT) hitCells++;
      else if (cell === CELL_STATE.MISS) missCells++;
    }
  }

  const totalCells = rows * cols;
  const unexploredCells = totalCells - hitCells - missCells;

  return { hitCells, missCells, unexploredCells, totalCells };
}

export const FieldStatus = memo(function FieldStatus({
  board,
  isMe: _isMe,
}: FieldStatusProps) {
  const theme = useSeaBattleTheme();
  const stats = useMemo(() => computeBoardStats(board), [board]);

  return (
    <XStack
      justifyContent="flex-end"
      alignItems="center"
      paddingVertical="$1"
      paddingHorizontal="$2"
      backgroundColor="rgba(0,0,0,0.3)"
      borderRadius={4}
    >
      <XStack gap={6} alignItems="center">
        <XStack gap={2} alignItems="center">
          <YStack width={4} height={4} backgroundColor={theme.hitColor} borderRadius={1} />
          <Text
            fontSize={9}
            color={theme.hitColor}
            fontWeight="700"
            style={{ fontFamily: 'monospace' } as React.CSSProperties}
          >
            {stats.hitCells}
          </Text>
        </XStack>
        <Text fontSize={8} color="rgba(255,255,255,0.3)">·</Text>
        <XStack gap={2} alignItems="center">
          <YStack width={4} height={4} backgroundColor={theme.missColor} borderRadius={1} />
          <Text
            fontSize={9}
            color={theme.missColor}
            fontWeight="700"
            style={{ fontFamily: 'monospace' } as React.CSSProperties}
          >
            {stats.missCells}
          </Text>
        </XStack>
      </XStack>
      <Text
        fontSize={9}
        color="rgba(255,255,255,0.5)"
        marginLeft={4}
        style={{ fontFamily: 'monospace' } as React.CSSProperties}
      >
        {stats.unexploredCells}/{stats.totalCells} ({Math.round((stats.unexploredCells / stats.totalCells) * 100)}%)
      </Text>
    </XStack>
  );
});
