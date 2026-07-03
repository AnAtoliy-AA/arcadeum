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

type WeaponMode = null | { weapon: 'sonar' | 'radar'; targetPlayerId: string };

interface SeaBattleBoardsProps {
  isPlacementPhase: boolean;
  currentPlayer: SeaBattlePlayerState | null;
  placeShip: (shipId: string, cells: ShipCell[]) => void;
  moveShip: (shipId: string, cells: ShipCell[]) => void;
  confirmPlacement: () => void;
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

  const gridSize = snapshot?.gridSize ?? 10;

  const handleWeaponFire = useCallback(
    (targetPlayerId: string, row: number, col: number) => {
      if (!weaponMode) return;
      if (weaponMode.weapon === 'sonar' && onSonar) {
        onSonar(targetPlayerId, row, col);
      } else if (weaponMode.weapon === 'radar' && onRadar) {
        // Radar scans the row of the clicked cell
        onRadar(targetPlayerId, row, undefined);
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

  // Compute preview cells for sonar (3×3 area around hovered cell)
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

  // Compute preview cells for radar (entire row of hovered cell)
  const radarPreviewCells = (() => {
    if (weaponMode?.weapon !== 'radar' || !hoveredCell) return null;
    const cells = new Set<string>();
    for (let c = 0; c < gridSize; c++) {
      cells.add(
        `${weaponMode.targetPlayerId}-${hoveredCell.row}-${c}`,
      );
    }
    return cells;
  })();

  const isWeaponMode = weaponMode !== null;

  const buttonBase: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid',
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

      {isBattlePhase && snapshot && (
        <>
          {isMyTurn && (hasSonar || hasRadar) && (
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
              {hasSonar && !sonarUsed && (
                <select
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border:
                      weaponMode?.weapon === 'sonar'
                        ? '2px solid #06b6d4'
                        : '1px solid #555',
                    background: '#1a1a2e',
                    color: '#e0e0e0',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  value={weaponMode?.weapon === 'sonar' ? weaponMode.targetPlayerId : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setWeaponMode({ weapon: 'sonar', targetPlayerId: val });
                    }
                  }}
                >
                  <option value="">
                    🔊 {t('games.create.seaBattleSonar') || 'Sonar'}
                  </option>
                  {opponents?.map((p) => (
                    <option key={p.playerId} value={p.playerId}>
                      {resolveDisplayNameBound(p.playerId, p.playerId)}
                    </option>
                  ))}
                </select>
              )}
              {hasRadar && !radarUsed && (
                <select
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border:
                      weaponMode?.weapon === 'radar'
                        ? '2px solid #a855f7'
                        : '1px solid #555',
                    background: '#1a1a2e',
                    color: '#e0e0e0',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  value={weaponMode?.weapon === 'radar' ? weaponMode.targetPlayerId : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setWeaponMode({ weapon: 'radar', targetPlayerId: val });
                    }
                  }}
                >
                  <option value="">
                    📡 {t('games.create.seaBattleRadar') || 'Radar'}
                  </option>
                  {opponents?.map((p) => (
                    <option key={p.playerId} value={p.playerId}>
                      {resolveDisplayNameBound(p.playerId, p.playerId)}
                    </option>
                  ))}
                </select>
              )}
              {isWeaponMode && (
                <button
                  type="button"
                  onClick={cancelWeaponMode}
                  style={{
                    ...buttonBase,
                    color: '#f87171',
                    borderColor: 'rgba(239,68,68,0.4)',
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
                    color: weaponMode.weapon === 'sonar' ? '#06b6d4' : '#a855f7',
                    fontWeight: 600,
                  }}
                >
                  {weaponMode.weapon === 'sonar'
                    ? 'Tap a cell on the target board'
                    : 'Tap a cell to scan its row'}
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
            teammateIds={teammateIds}
            teams={teams}
            gridSize={snapshot.gridSize}
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
                    if (playerId === weaponMode.targetPlayerId) {
                      setHoveredCell({ row, col });
                    }
                  }
                : undefined
            }
            onCellHoverEnd={isWeaponMode ? () => setHoveredCell(null) : undefined}
          />
        </>
      )}
    </>
  );
}
