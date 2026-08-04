'use client';

import { useState, useCallback } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { Card, Typography } from '@arcadeum/ui';
import { ShipPlacementBoard } from './ShipPlacementBoard';
import { AttackBoard } from './AttackBoard';
import type {
  SeaBattlePlayerState,
  SeaBattleSnapshot,
  SeaBattleTeam,
  ShipCell,
} from '../types';

type WeaponMode = null | {
  weapon: 'sonar' | 'radar';
  targetPlayerId: string;
  radarAxis?: 'row' | 'col';
};

interface SeaBattleBoardsProps {
  isPlacementPhase: boolean;
  currentPlayer: SeaBattlePlayerState | null;
  placeShip: (shipId: string, cells: ShipCell[]) => void;
  moveShip: (shipId: string, cells: ShipCell[]) => void;
  confirmPlacement: (
    ships?: Array<{ shipId: string; cells: ShipCell[] }>,
  ) => void;
  resetPlacement: () => void;
  isPlacementComplete: boolean;
  handleAutoPlace: () => void;
  isBattlePhase: boolean;
  isGameOver: boolean;
  teamMode: boolean;
  winnerTeam: SeaBattleTeam | null | undefined;
  snapshot: SeaBattleSnapshot | null;
  currentUserId: string | null;
  currentTurnPlayerId: string | null;
  isMyTurn: boolean;
  attack: (targetPlayerId: string, row: number, col: number) => void;
  onSonar?: (targetPlayerId: string, row?: number, col?: number) => void;
  onRadar?: (targetPlayerId: string, row?: number, col?: number) => void;
  resolveDisplayNameBound: (
    id?: string | null,
    fallback?: string | null,
  ) => string;
  teammateIds?: string[];
  teams?: SeaBattleTeam[];
}

export function SeaBattleBoards({
  isPlacementPhase,
  currentPlayer,
  placeShip,
  moveShip,
  confirmPlacement,
  resetPlacement,
  isPlacementComplete,
  handleAutoPlace,
  isBattlePhase,
  isGameOver,
  teamMode,
  winnerTeam,
  snapshot,
  currentUserId,
  currentTurnPlayerId,
  isMyTurn,
  attack,
  onSonar,
  onRadar,
  resolveDisplayNameBound,
  teammateIds,
  teams,
}: SeaBattleBoardsProps) {
  const { t } = useTranslation();
  const [weaponMode, setWeaponMode] = useState<WeaponMode>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const opponents = snapshot?.players.filter(
    (p) =>
      p.playerId !== currentUserId &&
      p.alive &&
      (!teammateIds || !teammateIds.includes(p.playerId)),
  );

  const sonarUsed =
    snapshot?.specialWeaponUsage?.[currentUserId ?? '']?.sonarUsed ?? false;
  const radarUsed =
    snapshot?.specialWeaponUsage?.[currentUserId ?? '']?.radarUsed ?? false;
  const hasSonar = !!snapshot?.specialWeapons?.sonar;
  const hasRadar = !!snapshot?.specialWeapons?.radar;
  const isSonarDisabled = sonarUsed || !isMyTurn;
  const isRadarDisabled = radarUsed || !isMyTurn;

  const gridSize = snapshot?.gridSize ?? 10;

  const handleWeaponFire = useCallback(
    (targetPlayerId: string, row: number, col: number) => {
      if (!weaponMode) return;
      if (weaponMode.weapon === 'sonar' && onSonar) {
        onSonar(targetPlayerId, row, col);
      } else if (weaponMode.weapon === 'radar' && onRadar) {
        const axis = weaponMode.radarAxis ?? 'row';
        onRadar(
          targetPlayerId,
          axis === 'row' ? row : undefined,
          axis === 'col' ? col : undefined,
        );
      }
      setWeaponMode(null);
      setHoveredCell(null);
    },
    [weaponMode, onSonar, onRadar],
  );

  const cancelWeaponMode = useCallback(() => {
    setWeaponMode(null);
    setHoveredCell(null);
  }, []);

  // Compute preview cells for sonar (3×3 area around hovered cell, matching SONAR_RADIUS=1)
  const sonarPreviewCells = (() => {
    if (weaponMode?.weapon !== 'sonar' || !hoveredCell) return null;
    const cells = new Set<string>();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = hoveredCell.row + dr;
        const c = hoveredCell.col + dc;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          cells.add(`${weaponMode.targetPlayerId}-${r}-${c}`);
        }
      }
    }
    return cells;
  })();

  // Compute preview cells for radar (row or column of hovered cell)
  const radarPreviewCells = (() => {
    if (weaponMode?.weapon !== 'radar' || !hoveredCell) return null;
    const cells = new Set<string>();
    const axis = weaponMode.radarAxis ?? 'row';
    if (axis === 'row') {
      for (let c = 0; c < gridSize; c++) {
        cells.add(`${weaponMode.targetPlayerId}-${hoveredCell.row}-${c}`);
      }
    } else {
      for (let r = 0; r < gridSize; r++) {
        cells.add(`${weaponMode.targetPlayerId}-${r}-${hoveredCell.col}`);
      }
    }
    return cells;
  })();

  const isWeaponMode = weaponMode !== null;

  const buttonBase: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <>
      {isPlacementPhase && (
        <ShipPlacementBoard
          key="placement-board"
          currentPlayer={currentPlayer}
          onPlaceShip={placeShip}
          onMoveShip={moveShip}
          onConfirmPlacement={confirmPlacement}
          onResetPlacement={resetPlacement}
          isPlacementComplete={isPlacementComplete}
          onAutoPlace={handleAutoPlace}
          gridSize={snapshot?.gridSize}
          shipCount={snapshot?.shipCount}
        />
      )}

      {isBattlePhase && currentPlayer && !currentPlayer.alive && (
        <Card
          variant="error"
          padding="md"
          marginHorizontal="$3"
          marginBottom="$3"
        >
          <Typography>
            {t(
              'games.sea_battle_v1.teamMode.banner.eliminatedSpectator' as TranslationKey,
            )}
          </Typography>
        </Card>
      )}

      {isGameOver && teamMode && winnerTeam && (
        <Card
          variant="elevated"
          padding="md"
          marginHorizontal="$3"
          marginBottom="$3"
        >
          <Typography>
            {t(
              'games.sea_battle_v1.teamMode.banner.teamWon' as TranslationKey,
              {
                team: winnerTeam.name,
              },
            )}
          </Typography>
        </Card>
      )}

      {(isBattlePhase || isGameOver) && snapshot && (
        <>
          {!isGameOver && (hasSonar || hasRadar) && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '8px 16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {hasSonar && (
                <button
                  type="button"
                  onClick={() => {
                    if (isSonarDisabled) return;
                    if (opponents?.length === 1) {
                      setWeaponMode({
                        weapon: 'sonar',
                        targetPlayerId: opponents[0].playerId,
                      });
                    } else if (opponents && opponents.length > 1) {
                      setWeaponMode({
                        weapon: 'sonar',
                        targetPlayerId: opponents[0].playerId,
                      });
                    }
                  }}
                  disabled={isSonarDisabled}
                  style={{
                    ...buttonBase,
                    opacity: isSonarDisabled ? 0.35 : 1,
                    cursor: isSonarDisabled ? 'not-allowed' : 'pointer',
                    color:
                      weaponMode?.weapon === 'sonar' ? '#06b6d4' : '#e0e0e0',
                    borderTop: `1px solid ${weaponMode?.weapon === 'sonar' ? '#06b6d4' : 'rgba(6,182,212,0.3)'}`,
                    borderBottom: `1px solid ${weaponMode?.weapon === 'sonar' ? '#06b6d4' : 'rgba(6,182,212,0.3)'}`,
                    borderLeft: `1px solid ${weaponMode?.weapon === 'sonar' ? '#06b6d4' : 'rgba(6,182,212,0.3)'}`,
                    borderRight: `1px solid ${weaponMode?.weapon === 'sonar' ? '#06b6d4' : 'rgba(6,182,212,0.3)'}`,
                    background:
                      weaponMode?.weapon === 'sonar'
                        ? 'rgba(6,182,212,0.15)'
                        : 'rgba(6,182,212,0.05)',
                  }}
                >
                  🔊 {t('games.create.seaBattleSonar') || 'Sonar'}
                  {sonarUsed && ' ✓'}
                </button>
              )}
              {hasRadar && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isRadarDisabled) return;
                      if (opponents?.length === 1) {
                        setWeaponMode({
                          weapon: 'radar',
                          targetPlayerId: opponents[0].playerId,
                          radarAxis: 'row',
                        });
                      } else if (opponents && opponents.length > 1) {
                        setWeaponMode({
                          weapon: 'radar',
                          targetPlayerId: opponents[0].playerId,
                          radarAxis: 'row',
                        });
                      }
                    }}
                    disabled={isRadarDisabled}
                    style={{
                      ...buttonBase,
                      opacity: isRadarDisabled ? 0.35 : 1,
                      cursor:
                        isRadarDisabled ? 'not-allowed' : 'pointer',
                      color:
                        weaponMode?.weapon === 'radar' ? '#a855f7' : '#e0e0e0',
                      borderTop: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      borderBottom: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      borderLeft: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      borderRight: 'none',
                      background:
                        weaponMode?.weapon === 'radar'
                          ? 'rgba(168,85,247,0.15)'
                          : 'rgba(168,85,247,0.05)',
                      borderRadius: '8px 0 0 8px',
                    }}
                  >
                    📡 {t('games.create.seaBattleRadar') || 'Radar'}
                    {radarUsed && ' ✓'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isRadarDisabled) return;
                      const targetId = opponents?.[0]?.playerId;
                      if (!targetId) return;
                      setWeaponMode({
                        weapon: 'radar',
                        targetPlayerId: targetId,
                        radarAxis:
                          weaponMode?.radarAxis === 'col' ? 'row' : 'col',
                      });
                    }}
                    disabled={isRadarDisabled}
                    style={{
                      ...buttonBase,
                      padding: '8px 10px',
                      opacity: isRadarDisabled ? 0.35 : 1,
                      cursor:
                        isRadarDisabled ? 'not-allowed' : 'pointer',
                      color:
                        weaponMode?.weapon === 'radar' ? '#c084fc' : '#a0a0a0',
                      borderTop: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      borderBottom: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      borderLeft: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      borderRight: `1px solid ${weaponMode?.weapon === 'radar' ? '#a855f7' : 'rgba(168,85,247,0.3)'}`,
                      background:
                        weaponMode?.weapon === 'radar'
                          ? 'rgba(168,85,247,0.15)'
                          : 'rgba(168,85,247,0.05)',
                      borderRadius: '0 8px 8px 0',
                      fontSize: 11,
                    }}
                    title="Toggle row / column"
                  >
                    {weaponMode?.radarAxis === 'col' ? '↕' : '↔'}
                  </button>
                </div>
              )}
              {isWeaponMode && (
                <button
                  type="button"
                  onClick={cancelWeaponMode}
                  style={{
                    ...buttonBase,
                    color: '#f87171',
                    borderTop: '1px solid rgba(239,68,68,0.4)',
                    borderBottom: '1px solid rgba(239,68,68,0.4)',
                    borderLeft: '1px solid rgba(239,68,68,0.4)',
                    borderRight: '1px solid rgba(239,68,68,0.4)',
                    background: 'rgba(239,68,68,0.1)',
                  }}
                >
                  ✕ Cancel
                </button>
              )}
              {isWeaponMode && (
                <span
                  style={{
                    fontSize: 12,
                    color:
                      weaponMode.weapon === 'sonar' ? '#06b6d4' : '#a855f7',
                    fontWeight: 600,
                  }}
                >
                  {weaponMode.weapon === 'sonar'
                    ? 'Tap a cell on the target board'
                    : `Tap a cell to scan its ${weaponMode.radarAxis === 'col' ? 'column' : 'row'}`}
                </span>
              )}
            </div>
          )}
          <AttackBoard
            key="attack-board"
            players={snapshot.players}
            currentUserId={currentUserId}
            currentTurnPlayerId={currentTurnPlayerId}
            isMyTurn={isMyTurn}
            onAttack={isWeaponMode ? handleWeaponFire : attack}
            resolveDisplayName={resolveDisplayNameBound}
            disabled={isGameOver}
            showEliminatedPlayers={isGameOver}
            teammateIds={teammateIds}
            teams={teams}
            gridSize={snapshot.gridSize}
            shipCount={snapshot.shipCount}
            snapshot={snapshot}
            weaponPreviewCells={
              weaponMode?.weapon === 'sonar'
                ? sonarPreviewCells
                : radarPreviewCells
            }
            weaponPreviewType={weaponMode?.weapon ?? null}
            onCellHover={
              isWeaponMode
                ? (playerId: string, row: number, col: number) => {
                    setWeaponMode((prev) =>
                      prev ? { ...prev, targetPlayerId: playerId } : prev,
                    );
                    setHoveredCell({ row, col });
                  }
                : undefined
            }
            onCellHoverEnd={
              isWeaponMode ? () => setHoveredCell(null) : undefined
            }
            weaponMode={isWeaponMode}
          />
        </>
      )}
    </>
  );
}
