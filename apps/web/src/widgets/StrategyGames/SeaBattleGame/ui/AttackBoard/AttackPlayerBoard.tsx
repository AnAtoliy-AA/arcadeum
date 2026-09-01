'use client';
import { memo, useCallback, useMemo, useState } from 'react';
import type { SeaBattlePlayerState, SeaBattleTeam } from '../../types';
import { CELL_STATE, colLabels, rowLabels } from '../../types';
import { ShipsLeft } from '../ShipsLeft';
import {
  BoardGrid,
  BoardWithLabels,
  ColLabels,
  Label,
  PlayerName,
  PlayerSection,
  PlayerSectionWrapper,
  RowLabels,
} from '../styles';
import { IdleBadge } from '@arcadeum/ui';
import { type TranslationKey } from '@/shared/lib/useTranslation';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import type { SeaBattleTheme } from '../../lib/theme';
import { AttackBoardCell } from './AttackBoardCell';
import { BadgePill, TeamPill } from './Pills';
import { FieldStatus } from './FieldStatus';
import { getPlayerColor } from '@/shared/lib/playerColors';
import { InGameAvatar } from '@/features/games/ui/InGameAvatar';

interface AttackPlayerBoardProps {
  player: SeaBattlePlayerState;
  isMe: boolean;
  theme: SeaBattleTheme;
  resolveDisplayName: (id: string, fallback: string) => string;
  idlePlayers: string[];
  isMyTurn: boolean;
  isCurrentTurn: boolean;
  disabled: boolean;
  isTeammate?: boolean;
  team?: SeaBattleTeam;
  shipCount?: number;
  sonarHighlightCells?: Set<string> | null;
  sonarCellStates?: Map<string, number> | null;
  radarHighlightCells?: Set<string> | null;
  radarCellStates?: Map<string, number> | null;
  scanWaveHighlightCells?: Set<string> | null;
  scanWaveCellStates?: Map<string, number> | null;
  weaponPreviewCells?: Set<string> | null;
  weaponPreviewType?: 'sonar' | 'radar' | null;
  onAttack?: (targetPlayerId: string, row: number, col: number) => void;
  onCellHover?: (playerId: string, row: number, col: number) => void;
  onCellHoverEnd?: () => void;
  weaponMode?: boolean;
  t: (key: TranslationKey) => string;
}

export const AttackPlayerBoard = memo(function AttackPlayerBoard({
  player,
  isMe,
  theme,
  resolveDisplayName,
  idlePlayers,
  isMyTurn,
  isCurrentTurn,
  disabled,
  isTeammate = false,
  team,
  shipCount,
  sonarHighlightCells,
  sonarCellStates,
  radarHighlightCells,
  radarCellStates,
  scanWaveHighlightCells,
  scanWaveCellStates,
  weaponPreviewCells,
  weaponPreviewType,
  onAttack,
  onCellHover,
  onCellHoverEnd,
  weaponMode = false,
  t,
}: AttackPlayerBoardProps) {
  const isAttackDisabled = disabled || isTeammate;
  const showTargeting = isMyTurn && !isAttackDisabled;
  const boardSize = player.board.length || 10;
  const rowLbls = useMemo(() => rowLabels(boardSize), [boardSize]);
  const colLbls = useMemo(() => colLabels(boardSize), [boardSize]);

  // Derive sunk cells only for this player — avoids invalidating all boards when one player's ship sinks
  const sunkCellSet = useMemo(() => {
    const set = new Set<string>();
    player.ships
      .filter((s) => s.sunk)
      .forEach((s) => {
        s.cells.forEach((c) => set.add(`${c.row}-${c.col}`));
      });
    return set;
  }, [player.ships]);

  // Optimistic "shot fired" state: instantly mark the clicked cell as pending
  // so the player sees feedback without waiting for the server round-trip,
  // and can't spam-click the same cell.
  const [pendingCell, setPendingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  // Derived: only treat the stored pending cell as "still pending" if it's
  // my turn and the server hasn't yet resolved the cell to HIT/MISS.
  // Stale state self-clears on the next click.
  const activePendingCell = (() => {
    if (!pendingCell || !isMyTurn) return null;
    const s = player.board[pendingCell.r]?.[pendingCell.c];
    if (s === CELL_STATE.HIT || s === CELL_STATE.MISS) return null;
    return pendingCell;
  })();

  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isMyTurn || isAttackDisabled || !onAttack) return;
      const cell = (e.target as HTMLElement).closest(
        weaponMode ? '.sb-cell[data-row]' : '.sb-cell.sb-attackable',
      );
      if (!cell) return;
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      if (row !== null && col !== null) {
        const r = parseInt(row);
        const c = parseInt(col);
        if (!weaponMode) {
          setPendingCell({ r, c });
        }
        onAttack(player.playerId, r, c);
      }
    },
    [isMyTurn, isAttackDisabled, onAttack, player.playerId, weaponMode],
  );

  const handleGridMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMe || !onCellHover) return;
      const cell = (e.target as HTMLElement).closest('.sb-cell[data-row]');
      if (!cell) return;
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      if (row !== null && col !== null) {
        onCellHover(player.playerId, parseInt(row, 10), parseInt(col, 10));
      }
    },
    [isMe, onCellHover, player.playerId],
  );

  const handleGridMouseLeave = useCallback(() => {
    if (isMe || !onCellHoverEnd) return;
    onCellHoverEnd();
  }, [isMe, onCellHoverEnd]);

  // Keyboard navigation (arrow keys + Enter to fire) for the opponent board.
  const boardKeyboard = useBoardKeyboardNavigation({
    rows: boardSize,
    cols: boardSize,
    disabled: !showTargeting,
    onActivate: ({ row, col }) => {
      if (!showTargeting || !onAttack) return;
      if (!weaponMode) {
        const cellState = player.board[row]?.[col];
        const isSunk = sunkCellSet.has(`${row}-${col}`);
        if (
          cellState === undefined ||
          cellState === CELL_STATE.HIT ||
          cellState === CELL_STATE.MISS ||
          isSunk
        ) {
          return;
        }
      }
      onAttack(player.playerId, row, col);
    },
  });

  const boardGrid = (
    <BoardGrid
      className={`sb-board-grid ${!isMe && showTargeting ? 'sb-my-turn' : ''}`}
      style={{
        backgroundColor: theme.boardBackground,
        borderColor: theme.cellBorder,
        ...(isTeammate ? { cursor: 'not-allowed' } : {}),
      }}
      role="grid"
      aria-label={
        isMe
          ? 'Your fleet'
          : `${resolveDisplayName(player.playerId, 'Opponent')}'s board`
      }
      gridSize={boardSize}
      onClick={handleGridClick}
      onMouseMove={!isMe && onCellHover ? handleGridMouseMove : undefined}
      onMouseLeave={!isMe && onCellHoverEnd ? handleGridMouseLeave : undefined}
      {...(!isMe ? boardKeyboard.gridProps : {})}
    >
      {player.board.map((row, rIndex) =>
        row.map((cellState, cIndex) => {
          const isSunk = sunkCellSet.has(`${rIndex}-${cIndex}`);
          const displayState =
            !isMe && isSunk
              ? CELL_STATE.HIT
              : !isMe && !isTeammate && cellState === CELL_STATE.SHIP
                ? CELL_STATE.EMPTY
                : cellState;
          const isPending =
            !isMe &&
            activePendingCell?.r === rIndex &&
            activePendingCell?.c === cIndex;
          const isAttackable =
            !isMe &&
            !isTeammate &&
            !disabled &&
            cellState !== CELL_STATE.HIT &&
            cellState !== CELL_STATE.MISS &&
            !isSunk &&
            !isPending;
          const isWeaponClickable =
            !isMe && !isTeammate && !disabled && !!weaponMode;
          const cellKey = `${player.playerId}-${rIndex}-${cIndex}`;
          const isSonarCell = !isMe && sonarHighlightCells?.has(cellKey);
          const isRadarCell = !isMe && radarHighlightCells?.has(cellKey);
          const isScanWaveCell = !isMe && scanWaveHighlightCells?.has(cellKey);
          const highlight: 'sonar' | 'radar' | 'scanWave' | null = isSonarCell
            ? 'sonar'
            : isRadarCell
              ? 'radar'
              : isScanWaveCell
                ? 'scanWave'
                : null;
          const highlightCellState =
            isSonarCell && sonarCellStates
              ? sonarCellStates.get(cellKey)
              : isRadarCell && radarCellStates
                ? radarCellStates.get(cellKey)
                : isScanWaveCell && scanWaveCellStates
                  ? scanWaveCellStates.get(cellKey)
                  : undefined;
          const isWeaponPreview = !isMe && weaponPreviewCells?.has(cellKey);

          return (
            <AttackBoardCell
              key={`${isMe ? 'own' : player.playerId}-${rIndex}-${cIndex}`}
              cellState={cellState}
              displayState={displayState}
              isSunk={isSunk}
              isAttackable={isAttackable}
              isPending={isPending}
              highlight={highlight}
              highlightCellState={highlightCellState}
              isWeaponPreview={!!isWeaponPreview}
              weaponPreviewType={!isMe ? weaponPreviewType : null}
              isWeaponClickable={isWeaponClickable}
              theme={theme}
              rIndex={rIndex}
              cIndex={cIndex}
              isMe={isMe}
              cellFocusProps={
                !isMe ? boardKeyboard.getCellProps(rIndex, cIndex) : undefined
              }
            />
          );
        }),
      )}
    </BoardGrid>
  );

  // Equipped player chip, absolutely positioned so its CENTER sits on the
  // board card's top-left corner (~3/4 of it hangs outside). It's anchored to
  // PlayerSection (the card), which is `position: relative; overflow: visible`,
  // so it lands on the real board corner — not the wider grid cell — and the
  // outside part still shows. No extra ring/border: team colour already reads
  // from the board border + team pill, and the avatar carries its own disc.
  // The md disc is ~72px, so a -36 offset centers it on the corner.
  const cornerAvatar = (
    <div className="flex flex-row items-center justify-center shrink-0">
      <InGameAvatar
        playerId={player.playerId}
        name={resolveDisplayName(player.playerId, isMe ? 'You' : 'Unknown')}
        size="icon"
        data-testid={`sb-corner-avatar-${player.playerId}`}
      />
    </div>
  );

  const targetBadge = isTeammate ? (
    <BadgePill
      icon="🤝"
      label={t('games.sea_battle_v1.teamMode.teammateBadge' as TranslationKey)}
      bg="rgba(34,197,94,0.15)"
      border="rgba(34,197,94,0.5)"
      color="#86efac"
      ariaLabel={t(
        'games.sea_battle_v1.teamMode.cannotAttackTeammate' as TranslationKey,
      )}
    />
  ) : isCurrentTurn ? (
    <BadgePill
      icon="🎯"
      label="ATTACKING"
      bg="rgba(185,28,28,0.1)"
      border="var(--dangerBorder)"
      color="var(--danger)"
    />
  ) : isMyTurn ? (
    <BadgePill
      icon="🎯"
      label={t(
        'games.sea_battle_v1.table.players.targetBadge' as TranslationKey,
      )}
      bg="rgba(99,102,241,0.1)"
      border="rgba(87,195,255,0.4)"
      color="var(--info)"
    />
  ) : null;

  if (isMe) {
    const isDefending = !isMyTurn && player.alive;
    const showBadge = player.alive;
    return (
      <PlayerSectionWrapper>
        <PlayerSection
          className={`sb-player-section-fit ${
            isDefending ? 'sb-section-danger-breathe' : ''
          }`}
          style={{
            backgroundColor: theme.boardBackground,
            borderColor: team
              ? team.color
              : isDefending
                ? theme.hitColor
                : theme.cellBorder,
            borderWidth: team ? 2 : undefined,
          }}
        >
          <div className="flex flex-row items-center justify-between w-full min-w-0 gap-1.5 px-1 py-0.5 shrink-0">
            <div className="flex flex-row items-center gap-1.5 min-w-0 flex-1">
              {cornerAvatar}
              <PlayerName
                data-testid="player-board-name"
                color={theme.textColor}
                style={{
                  color: team?.color ?? getPlayerColor(player.playerId),
                }}
                className="flex-row items-center gap-1 min-w-0"
              >
                <span className="font-bold text-[13px] whitespace-nowrap">
                  {resolveDisplayName(player.playerId, 'You')} (Your Fleet)
                </span>
                {team && <TeamPill team={team} />}
                {idlePlayers.includes(player.playerId) && <IdleBadge />}
              </PlayerName>
            </div>
            {showBadge && (
              <div className="shrink-0 ml-1">
                <BadgePill
                  icon={isCurrentTurn ? '🎯' : '🛡️'}
                  label={
                    isCurrentTurn
                      ? t(
                          'games.sea_battle_v1.table.players.yourTurn' as TranslationKey,
                        )
                      : t(
                          'games.sea_battle_v1.table.players.defendingBadge' as TranslationKey,
                        )
                  }
                  bg={
                    isCurrentTurn
                      ? 'rgba(239,68,68,0.25)'
                      : 'rgba(251,191,36,0.2)'
                  }
                  border={
                    isCurrentTurn
                      ? 'rgba(239,68,68,0.4)'
                      : 'rgba(245,158,11,0.4)'
                  }
                  color={isCurrentTurn ? 'var(--danger)' : 'var(--warning)'}
                  className={
                    isCurrentTurn ? 'sb-badge-danger-breathe' : undefined
                  }
                />
              </div>
            )}
          </div>
          <div className="w-full shrink-0">
            <ShipsLeft
              ships={player.ships}
              isMe={true}
              shipCount={shipCount}
              layout="top"
            />
          </div>
          <div className="flex flex-col items-center justify-center relative w-full flex-1 min-h-0 min-w-0 my-0.5">
            <BoardWithLabels>
              <div />
              <ColLabels gridSize={boardSize}>
                {colLbls.map((label) => (
                  <Label
                    key={label}
                    style={{ color: theme.textSecondaryColor }}
                  >
                    {label}
                  </Label>
                ))}
              </ColLabels>
              <RowLabels gridSize={boardSize}>
                {rowLbls.map((label) => (
                  <Label
                    key={label}
                    style={{ color: theme.textSecondaryColor }}
                  >
                    {label}
                  </Label>
                ))}
              </RowLabels>
              {boardGrid}
            </BoardWithLabels>
          </div>
          <div className="w-full shrink-0 flex flex-row justify-end items-center mt-0.5">
            <FieldStatus board={player.board} isMe={true} />
          </div>
        </PlayerSection>
      </PlayerSectionWrapper>
    );
  }

  return (
    <PlayerSectionWrapper>
      <PlayerSection
        className={`sb-player-section-fit ${
          isMyTurn && !team ? 'sb-breathe' : ''
        }`}
        style={{
          backgroundColor: theme.boardBackground,
          borderColor: team
            ? team.color
            : isMyTurn
              ? theme.accentColor
              : theme.cellBorder,
          borderWidth: team ? 2 : undefined,
        }}
        isTargetable={isMyTurn}
      >
        <div className="flex flex-row items-center justify-between w-full min-w-0 gap-1.5 px-1 py-0.5 shrink-0">
          <div className="flex flex-row items-center gap-1.5 min-w-0 flex-1">
            {cornerAvatar}
            <PlayerName
              data-testid="player-board-name"
              color={theme.textColor}
              style={{ color: team?.color ?? getPlayerColor(player.playerId) }}
              className="flex-row items-center gap-1 min-w-0"
            >
              <span className="font-bold text-[13px] whitespace-nowrap">
                {t(
                  'games.sea_battle_v1.table.players.opponentBadge' as TranslationKey,
                )}
                {' · '}
                {resolveDisplayName(player.playerId, 'Unknown')}
              </span>
              {team && <TeamPill team={team} />}
              {idlePlayers.includes(player.playerId) && <IdleBadge />}
            </PlayerName>
          </div>
          {targetBadge && <div className="shrink-0 ml-1">{targetBadge}</div>}
        </div>
        <div className="w-full shrink-0">
          <ShipsLeft
            ships={player.ships}
            isMe={false}
            shipCount={shipCount}
            layout="top"
          />
        </div>
        <div className="flex flex-col items-center justify-center relative w-full flex-1 min-h-0 min-w-0 my-0.5">
          <BoardWithLabels>
            <div />
            <ColLabels gridSize={boardSize}>
              {colLbls.map((label) => (
                <Label key={label} style={{ color: theme.textSecondaryColor }}>
                  {label}
                </Label>
              ))}
            </ColLabels>
            <RowLabels gridSize={boardSize}>
              {rowLbls.map((label) => (
                <Label key={label} style={{ color: theme.textSecondaryColor }}>
                  {label}
                </Label>
              ))}
            </RowLabels>
            {boardGrid}
          </BoardWithLabels>
        </div>
        <div className="w-full shrink-0 flex flex-row justify-end items-center mt-0.5">
          <FieldStatus board={player.board} isMe={false} />
        </div>
      </PlayerSection>
    </PlayerSectionWrapper>
  );
});
