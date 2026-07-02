'use client';
import { memo } from 'react';
import type React from 'react';
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
  highlight?: 'sonar' | 'radar' | null;
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
  highlight,
}: AttackBoardCellProps) {
  const icon = getCellIcon(isSunk, displayState);
  const animClass = getCellAnimClass(isSunk, displayState);

  const highlightStyle: React.CSSProperties =
    highlight === 'sonar'
      ? {
          boxShadow: '0 0 8px 2px rgba(6, 182, 212, 0.7)',
          borderColor: '#06b6d4',
        }
      : highlight === 'radar'
        ? {
            boxShadow: '0 0 8px 2px rgba(168, 85, 247, 0.7)',
            borderColor: '#a855f7',
          }
        : {};

  return (
    <BoardCell
      style={{
        backgroundColor: getCellBg(displayState, theme),
        borderColor: theme.cellBorder,
        borderRadius: parseInt(theme.borderRadius) || 4,
        ...highlightStyle,
      }}
      className={`sb-cell ${isAttackable ? 'sb-attackable' : ''} ${isPending ? 'sb-cell-pending' : ''} ${highlight ? 'sb-highlight' : ''} ${animClass || ''}`}
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
      {highlight && !isPending && (
        <div
          style={{
            position: 'absolute',
            top: 1,
            right: 1,
            fontSize: 8,
            lineHeight: 1,
            pointerEvents: 'none',
            opacity: 0.9,
          }}
        >
          {highlight === 'sonar' ? '🔊' : '📡'}
        </div>
      )}
    </BoardCell>
  );
});
