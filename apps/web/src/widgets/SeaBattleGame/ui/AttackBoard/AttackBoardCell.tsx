'use client';
import { memo } from 'react';
import type React from 'react';
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
  highlight?: 'sonar' | 'radar' | 'scanWave' | null;
  highlightCellState?: number;
  isWeaponPreview?: boolean;
  weaponPreviewType?: 'sonar' | 'radar' | null;
  isWeaponClickable?: boolean;
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
}: AttackBoardCellProps) {
  const icon = getCellIcon(isSunk, displayState);
  const animClass = getCellAnimClass(isSunk, displayState);

  const cellLabel = (() => {
    const coord = `${String.fromCharCode(97 + cIndex)}${rIndex + 1}`;
    const stateLabel =
      displayState === CELL_STATE.HIT
        ? 'hit'
        : displayState === CELL_STATE.MISS
          ? 'miss'
          : isSunk
            ? 'sunk'
            : 'empty';
    return `${coord} ${stateLabel}`;
  })();

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
        : highlight === 'scanWave'
          ? isShip
            ? {
                boxShadow: '0 0 12px 4px rgba(251, 191, 36, 0.9)',
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(251, 191, 36, 0.25)',
                animation:
                  'sb-scanwave-pulse 0.5s ease-in-out infinite alternate',
              }
            : {
                boxShadow: '0 0 4px 1px rgba(251, 191, 36, 0.3)',
                borderColor: 'rgba(251, 191, 36, 0.4)',
                backgroundColor: 'rgba(251, 191, 36, 0.06)',
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
      className={`sb-cell ${isAttackable || isWeaponClickable ? 'sb-attackable' : ''} ${isPending ? 'sb-cell-pending' : ''} ${highlight ? 'sb-highlight' : ''} ${isWeaponPreview ? 'sb-weapon-preview' : ''} ${animClass || ''}`}
      style={{
        backgroundColor: getCellBg(displayState, theme),
        borderColor: theme.cellBorder,
        borderRadius: parseInt(theme.borderRadius) || 4,
        ...highlightStyle,
        ...previewStyle,
        ...(isWeaponPreview ? { cursor: 'crosshair' } : {}),
      }}
      role="gridcell"
      aria-label={cellLabel}
      data-row={!isMe ? rIndex : undefined}
      data-col={!isMe ? cIndex : undefined}
    >
      {icon && (
        <span
          className={`absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-[13px] pointer-events-none select-none ${icon === '💀' ? 'sb-icon-sunk' : 'sb-icon-hit'}`}
        >
          {icon}
        </span>
      )}
      {isPending && (
        <>
          <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-[11px] pointer-events-none select-none sb-aim">
            🎯
          </span>
          <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-[14px] pointer-events-none select-none sb-missile">
            🚀
          </span>
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
            : highlight === 'scanWave'
              ? isShip
                ? '🚢'
                : '🌊'
              : isShip
                ? '🚢'
                : '📡'}
        </div>
      )}
    </BoardCell>
  );
});
