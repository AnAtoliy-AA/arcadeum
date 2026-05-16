'use client';
import { memo } from 'react';
import { Text } from 'tamagui';
import { CELL_STATE } from '../../types';
import { BoardCell } from '../styles';
import type { SeaBattleTheme } from '../../lib/theme';
import { getCellBg, getCellIcon, getCellAnimClass } from './cell-helpers';

interface AttackBoardCellProps {
  cellState: number;
  displayState: number;
  isSunk: boolean;
  theme: SeaBattleTheme;
  rIndex: number;
  cIndex: number;
  isAttackable: boolean;
  isPending?: boolean;
  isMe: boolean;
}

export const AttackBoardCell = memo(function AttackBoardCell({
  displayState,
  isSunk,
  theme,
  rIndex,
  cIndex,
  isAttackable,
  isPending = false,
  isMe,
}: AttackBoardCellProps) {
  const icon = getCellIcon(isSunk, displayState);
  const animClass = getCellAnimClass(isSunk, displayState);

  return (
    <BoardCell
      style={{
        backgroundColor: getCellBg(displayState, theme),
        borderColor: theme.cellBorder,
        borderRadius: parseInt(theme.borderRadius) || 4,
      }}
      className={`sb-cell ${isAttackable ? 'sb-attackable' : ''} ${isPending ? 'sb-cell-pending' : ''} ${animClass || ''}`}
      data-row={!isMe ? rIndex : undefined}
      data-col={!isMe ? cIndex : undefined}
    >
      {icon && (
        <Text
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={13}
          pointerEvents="none"
          userSelect="none"
          className={icon === '💀' ? 'sb-icon-sunk' : 'sb-icon-hit'}
        >
          {icon}
        </Text>
      )}
      {isPending && (
        <>
          <Text
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={11}
            pointerEvents="none"
            userSelect="none"
            className="sb-aim"
          >
            🎯
          </Text>
          <Text
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={14}
            pointerEvents="none"
            userSelect="none"
            className="sb-missile"
          >
            🚀
          </Text>
        </>
      )}
      {!isPending && displayState === CELL_STATE.MISS && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 100,
              backgroundColor: 'currentColor',
              opacity: 0.7,
            }}
          />
        </div>
      )}
    </BoardCell>
  );
});
