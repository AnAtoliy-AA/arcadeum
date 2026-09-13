'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { Card, Typography } from '@arcadeum/ui';
import { ShipPlacementBoard } from './ShipPlacementBoard';
import { AttackBoard } from './AttackBoard';
import { TurnTimer } from './TurnTimer';
import { ShipAbilitiesPanel } from './ShipAbilitiesPanel';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
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
  onShipAbility?: (
    abilityId: string,
    targetPlayerId?: string,
    row?: number,
    col?: number,
  ) => void;
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
  onShipAbility,
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

  const handleCellHover = useCallback(
    (playerId: string, row: number, col: number) => {
      setWeaponMode((prev) =>
        prev ? { ...prev, targetPlayerId: playerId } : prev,
      );
      setHoveredCell({ row, col });
    },
    [],
  );

  const handleCellHoverEnd = useCallback(() => setHoveredCell(null), []);

  const cancelWeaponMode = useCallback(() => {
    setWeaponMode(null);
    setHoveredCell(null);
  }, []);

  // Compute preview cells for sonar (area scales with grid size, matching backend getSonarSide)
  const sonarPreviewCells = useMemo(() => {
    if (weaponMode?.weapon !== 'sonar' || !hoveredCell) return null;
    const side = gridSize <= 10 ? 3 : gridSize <= 15 ? 5 : 7;
    const cells = new Set<string>();
    const rStart = hoveredCell.row - Math.floor((side - 1) / 2);
    const rEnd = rStart + side - 1;
    const cStart = hoveredCell.col - Math.floor((side - 1) / 2);
    const cEnd = cStart + side - 1;
    for (let r = rStart; r <= rEnd; r++) {
      for (let c = cStart; c <= cEnd; c++) {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          cells.add(`${weaponMode.targetPlayerId}-${r}-${c}`);
        }
      }
    }
    return cells;
  }, [weaponMode, hoveredCell, gridSize]);

  // Compute preview cells for radar (band of rows/columns, matching backend getRadarLines)
  const radarPreviewCells = useMemo(() => {
    if (weaponMode?.weapon !== 'radar' || !hoveredCell) return null;
    const lines = gridSize <= 10 ? 1 : gridSize <= 15 ? 3 : 5;
    const halfWidth = Math.floor(lines / 2);
    const cells = new Set<string>();
    const axis = weaponMode.radarAxis ?? 'row';
    if (axis === 'row') {
      for (let dr = -halfWidth; dr <= halfWidth; dr++) {
        const r = hoveredCell.row + dr;
        if (r < 0 || r >= gridSize) continue;
        for (let c = 0; c < gridSize; c++) {
          cells.add(`${weaponMode.targetPlayerId}-${r}-${c}`);
        }
      }
    } else {
      for (let dc = -halfWidth; dc <= halfWidth; dc++) {
        const c = hoveredCell.col + dc;
        if (c < 0 || c >= gridSize) continue;
        for (let r = 0; r < gridSize; r++) {
          cells.add(`${weaponMode.targetPlayerId}-${r}-${c}`);
        }
      }
    }
    return cells;
  }, [weaponMode, hoveredCell, gridSize]);

  const isWeaponMode = weaponMode !== null;

  const sonarActive = weaponMode?.weapon === 'sonar';
  const radarActive = weaponMode?.weapon === 'radar';

  const handleKeyboardFire = useCallback(
    (row: number, col: number) => {
      if (!isMyTurn || isGameOver) return;
      // Fire on first opponent
      const targetId = opponents?.[0]?.playerId;
      if (targetId) {
        attack(targetId, row, col);
      }
    },
    [isMyTurn, isGameOver, opponents, attack],
  );

  const { cursor } = useKeyboardNavigation({
    gridSize: snapshot?.gridSize ?? 10,
    enabled: isMyTurn && !isGameOver && !isWeaponMode,
    onFire: handleKeyboardFire,
  });

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
        <Card className={'-mx-3 -mb-3'} variant="error">
          <Typography>
            {t(
              'games.sea_battle_v1.teamMode.banner.eliminatedSpectator' as TranslationKey,
            )}
          </Typography>
        </Card>
      )}

      {isGameOver && teamMode && winnerTeam && (
        <Card className={'-mx-3 -mb-3'} variant="elevated">
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
          {isMyTurn && snapshot.mode === 'salvo' && currentPlayer && (
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="text-[13px] font-semibold text-amber-400">
                ⚔️ Salvo:{' '}
                {currentPlayer.salvoShotsRemaining ??
                  currentPlayer.shipsRemaining}{' '}
                shots remaining
              </span>
            </div>
          )}
          {isMyTurn && snapshot.mode === 'speed' && currentPlayer && (
            <TurnTimer deadline={currentPlayer.turnDeadline} />
          )}
          {!isGameOver && (hasSonar || hasRadar) && (
            <div className="flex gap-2 px-2 -mb-1 justify-center flex-wrap items-center">
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                    isSonarDisabled
                      ? 'opacity-35 cursor-not-allowed'
                      : 'cursor-pointer'
                  } ${
                    sonarActive
                      ? 'text-cyan-400 border border-cyan-400 bg-cyan-400/15'
                      : 'text-neutral-200 border border-cyan-400/30 bg-cyan-400/5'
                  }`}
                >
                  🔊 {t('games.create.seaBattleSonar') || 'Sonar'}
                  {sonarUsed && ' ✓'}
                </button>
              )}
              {hasRadar && (
                <div className="flex gap-1">
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
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-l-lg text-[13px] font-semibold transition-all duration-150 ${
                      isRadarDisabled
                        ? 'opacity-35 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      radarActive
                        ? 'text-purple-400 border border-purple-400 bg-purple-400/15 border-r-0'
                        : 'text-neutral-200 border border-purple-400/30 bg-purple-400/5 border-r-0'
                    }`}
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
                    title="Toggle row / column"
                    className={`flex items-center px-2.5 py-2 rounded-r-lg text-[11px] font-semibold transition-all duration-150 ${
                      isRadarDisabled
                        ? 'opacity-35 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      radarActive
                        ? 'text-purple-300 border border-purple-400 bg-purple-400/15'
                        : 'text-neutral-400 border border-purple-400/30 bg-purple-400/5'
                    }`}
                  >
                    {weaponMode?.radarAxis === 'col' ? '↕' : '↔'}
                  </button>
                </div>
              )}
              {isWeaponMode && (
                <button
                  type="button"
                  onClick={cancelWeaponMode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer text-red-400 border border-red-400/40 bg-red-400/10"
                >
                  ✕ Cancel
                </button>
              )}
              {isWeaponMode && (
                <span
                  className={`text-xs font-semibold ${
                    weaponMode.weapon === 'sonar'
                      ? 'text-cyan-400'
                      : 'text-purple-400'
                  }`}
                >
                  {weaponMode.weapon === 'sonar'
                    ? 'Tap a cell on the target board'
                    : `Tap a cell to scan its ${weaponMode.radarAxis === 'col' ? 'column' : 'row'}`}
                </span>
              )}
            </div>
          )}
          {isMyTurn && snapshot.shipAbilities && currentPlayer && (
            <ShipAbilitiesPanel
              player={currentPlayer}
              cooldowns={snapshot.abilityCooldowns?.[currentUserId ?? '']}
              onUseAbility={onShipAbility}
            />
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
            onCellHover={isWeaponMode ? handleCellHover : undefined}
            onCellHoverEnd={isWeaponMode ? handleCellHoverEnd : undefined}
            weaponMode={isWeaponMode}
            keyboardCursor={cursor}
          />
        </>
      )}
    </>
  );
}
