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
  highlightCellState?: number;
  isWeaponPreview?: boolean;
  weaponPreviewType?: 'sonar' | 'radar' | null;
  isWeaponClickable?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const AttackBoardCell = memo(function AttackBoardCell({
  cellState: _cellState,
  displayState,
  isSunk,
  theme,
  rIndex,
  cIndex,
  isAttackable,
  isPending = false,
  isMe,
  highlight,
  highlightCellState,
  isWeaponPreview = false,
  weaponPreviewType,
  isWeaponClickable = false,
  onMouseEnter,
  onMouseLeave,
}: AttackBoardCellProps) {
  const icon = getCellIcon(isSunk, displayState);
  const animClass = getCellAnimClass(isSunk, displayState);

  const isShip = highlightCellState === 1; // CellState.SHIP

  const highlightStyle: React.CSSProperties =
    highlight === 'sonar'
      ? isShip
        ? {
            boxShadow: '0 0 10px 3px rgba(6, 182, 212, 0.8)',
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
          }
        : {
            boxShadow: '0 0 4px 1px rgba(6, 182, 212, 0.3)',
            borderColor: 'rgba(6, 182, 212, 0.4)',
            backgroundColor: 'rgba(6, 182, 212, 0.06)',
          }
      : highlight === 'radar'
        ? isShip
          ? {
              boxShadow: '0 0 10px 3px rgba(168, 85, 247, 0.8)',
              borderColor: '#a855f7',
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
            }
          : {
              boxShadow: '0 0 4px 1px rgba(168, 85, 247, 0.3)',
              borderColor: 'rgba(168, 85, 247, 0.4)',
              backgroundColor: 'rgba(168, 85, 247, 0.06)',
            }
        : {};

  const previewStyle: React.CSSProperties =
    isWeaponPreview && weaponPreviewType === 'sonar'
      ? {
          boxShadow: '0 0 6px 1px rgba(6, 182, 212, 0.4)',
          borderColor: 'rgba(6, 182, 212, 0.5)',
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
        }
      : isWeaponPreview && weaponPreviewType === 'radar'
        ? {
            boxShadow: '0 0 6px 1px rgba(168, 85, 247, 0.4)',
            borderColor: 'rgba(168, 85, 247, 0.5)',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
          }
        : {};

  return (
    <BoardCell
      style={{
        backgroundColor: getCellBg(displayState, theme),
        borderColor: theme.cellBorder,
        borderRadius: parseInt(theme.borderRadius) || 4,
        ...highlightStyle,
        ...previewStyle,
        ...(isWeaponPreview ? { cursor: 'crosshair' } : {}),
      }}
      className={`sb-cell ${isAttackable || isWeaponClickable ? 'sb-attackable' : ''} ${isPending ? 'sb-cell-pending' : ''} ${highlight ? 'sb-highlight' : ''} ${isWeaponPreview ? 'sb-weapon-preview' : ''} ${animClass || ''}`}
      data-row={!isMe ? rIndex : undefined}
      data-col={!isMe ? cIndex : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
            fontSize: isShip ? 10 : 8,
            lineHeight: 1,
            pointerEvents: 'none',
            opacity: 0.9,
          }}
        >
          {highlight === 'sonar'
            ? isShip
              ? '🚢'
              : '🔊'
            : isShip
              ? '🚢'
              : '📡'}
        </div>
      )}
    </BoardCell>
  );
});
