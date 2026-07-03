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
  isWeaponPreview?: boolean;
  weaponPreviewType?: 'sonar' | 'radar' | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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
  isWeaponPreview = false,
  weaponPreviewType,
  onMouseEnter,
  onMouseLeave,
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
      className={`sb-cell ${isAttackable ? 'sb-attackable' : ''} ${isPending ? 'sb-cell-pending' : ''} ${highlight ? 'sb-highlight' : ''} ${isWeaponPreview ? 'sb-weapon-preview' : ''} ${animClass || ''}`}
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
