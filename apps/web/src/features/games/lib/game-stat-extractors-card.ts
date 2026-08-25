import type { GameStatItem } from '../ui/GameResultStatsGrid';
import { countLogs, type StateExtractor } from './game-stat-extractors.types';

const extractSpades: StateExtractor = (state) => {
  const scores = state.scores as Record<string, number> | undefined;
  const bags = state.bags as Record<string, number> | undefined;
  const bids = state.bids as Record<string, number | null> | undefined;
  const handNumber = state.handNumber as number | undefined;
  const logs = state.logs;

  const customStats: GameStatItem[] = [];
  if (handNumber !== undefined)
    customStats.push({ id: 'hands', label: 'Hands Played', value: handNumber });
  if (scores) {
    for (const [playerId, score] of Object.entries(scores)) {
      customStats.push({
        id: `score-${playerId}`,
        label: `Score (${playerId.slice(0, 6)})`,
        value: score,
      });
    }
  }
  if (bags) {
    for (const [playerId, bag] of Object.entries(bags)) {
      if (bag > 0)
        customStats.push({
          id: `bags-${playerId}`,
          label: `Bags (${playerId.slice(0, 6)})`,
          value: bag,
        });
    }
  }
  if (bids) {
    const bidValues = Object.values(bids).filter(
      (b): b is number => b !== null,
    );
    const totalBid = bidValues.reduce((s, b) => s + b, 0);
    customStats.push({ id: 'total-bid', label: 'Total Bid', value: totalBid });
  }

  const turns = countLogs(logs);
  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractHearts: StateExtractor = (state) => {
  const scores = state.scores as Record<string, number> | undefined;
  const handNumber = state.handNumber as number | undefined;
  const winType = state.winType as string | undefined;
  const taken = state.taken as Record<string, string[]> | undefined;
  const logs = state.logs;

  const customStats: GameStatItem[] = [];
  if (handNumber !== undefined)
    customStats.push({ id: 'hands', label: 'Hands Played', value: handNumber });
  if (scores) {
    for (const [playerId, score] of Object.entries(scores)) {
      customStats.push({
        id: `score-${playerId}`,
        label: `Score (${playerId.slice(0, 6)})`,
        value: score,
      });
    }
  }
  if (taken) {
    for (const [playerId, cards] of Object.entries(taken)) {
      const hearts = cards.filter((c) => c.startsWith('H')).length;
      const queen = cards.some((c) => c === 'SQ');
      if (hearts > 0 || queen) {
        customStats.push({
          id: `penalty-${playerId}`,
          label: `Penalty (${playerId.slice(0, 6)})`,
          value: queen ? `${hearts}♥ + Q♠` : `${hearts}♥`,
        });
      }
    }
  }
  if (winType === 'shoot_the_moon') {
    customStats.push({
      id: 'win-type',
      label: 'Achievement',
      value: 'Shoot the Moon!',
    });
  }

  const turns = countLogs(logs);
  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractCascade: StateExtractor = (state) => {
  const discardPile = state.discardPile as unknown[] | undefined;
  const players = state.players as
    Array<{ playerId: string; hand?: unknown[]; alive?: boolean }> | undefined;
  const pendingDraw = state.pendingDraw as number | undefined;
  const direction = state.direction as number | undefined;
  const logs = state.logs;

  const customStats: GameStatItem[] = [];
  if (discardPile)
    customStats.push({
      id: 'cards-played',
      label: 'Cards Played',
      value: discardPile.length,
    });
  if (pendingDraw && pendingDraw > 0)
    customStats.push({
      id: 'pending-draw',
      label: 'Pending Draw',
      value: pendingDraw,
    });
  if (direction !== undefined)
    customStats.push({
      id: 'direction',
      label: 'Direction',
      value: direction === 1 ? '→ Clockwise' : '← Counter-CW',
    });
  if (players) {
    const alive = players.filter((p) => p.alive).length;
    customStats.push({ id: 'survivors', label: 'Survivors', value: alive });
  }

  const turns = countLogs(logs);
  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractCritical: StateExtractor = (state) => {
  const discardPile = state.discardPile as unknown[] | undefined;
  const players = state.players as
    Array<{ playerId: string; hand?: unknown[]; alive?: boolean }> | undefined;
  const criticalsRemaining = state.criticalsRemaining as number | undefined;
  const overloadOdds = state.overloadOdds as number | undefined;
  const logs = state.logs;

  const customStats: GameStatItem[] = [];
  if (discardPile)
    customStats.push({
      id: 'cards-played',
      label: 'Cards Played',
      value: discardPile.length,
    });
  if (criticalsRemaining !== undefined && criticalsRemaining !== null)
    customStats.push({
      id: 'criticals-left',
      label: 'Criticals Left',
      value: criticalsRemaining,
    });
  if (overloadOdds !== undefined && overloadOdds !== null)
    customStats.push({
      id: 'overload-odds',
      label: 'Overload Odds',
      value: `${overloadOdds}%`,
    });
  if (players) {
    const alive = players.filter((p) => p.alive).length;
    customStats.push({ id: 'survivors', label: 'Survivors', value: alive });
  }

  const turns = countLogs(logs);
  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractSeaBattle: StateExtractor = (state) => {
  const players = state.players as
    | Array<{
        playerId: string;
        ships?: Array<{
          name: string;
          hits: number;
          size: number;
          sunk: boolean;
        }>;
        shipsRemaining?: number;
      }>
    | undefined;
  const roundNumber = state.roundNumber as number | undefined;
  const specialWeaponUsage = state.specialWeaponUsage as
    Record<string, { sonarUsed?: boolean; radarUsed?: boolean }> | undefined;
  const logs = state.logs;

  const customStats: GameStatItem[] = [];
  if (roundNumber !== undefined)
    customStats.push({ id: 'rounds', label: 'Rounds', value: roundNumber });
  if (players) {
    for (const p of players) {
      const short = p.playerId.slice(0, 6);
      if (p.shipsRemaining !== undefined)
        customStats.push({
          id: `ships-${p.playerId}`,
          label: `Ships Left (${short})`,
          value: p.shipsRemaining,
        });
      if (p.ships) {
        const sunk = p.ships.filter((s) => s.sunk).length;
        const totalHits = p.ships.reduce((acc, s) => acc + s.hits, 0);
        const totalCells = p.ships.reduce((acc, s) => acc + s.size, 0);
        customStats.push({
          id: `sunk-${p.playerId}`,
          label: `Ships Sunk (${short})`,
          value: `${sunk}/${p.ships.length}`,
        });
        if (totalCells > 0) {
          customStats.push({
            id: `accuracy-${p.playerId}`,
            label: `Hit Rate (${short})`,
            value: `${Math.round((totalHits / totalCells) * 100)}%`,
          });
        }
      }
    }
  }
  if (specialWeaponUsage) {
    const weaponsUsed = Object.values(specialWeaponUsage).filter(
      (u) => u.sonarUsed || u.radarUsed,
    ).length;
    if (weaponsUsed > 0)
      customStats.push({
        id: 'special-weapons',
        label: 'Special Weapons Used',
        value: weaponsUsed,
      });
  }

  const turns = countLogs(logs);
  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractCatDash: StateExtractor = (state) => {
  const players = state.players as
    | Array<{
        playerId: string;
        position?: number;
        powerTokens?: number;
        abilitiesUsed?: string[];
        catId?: string;
      }>
    | undefined;
  const turnNumber = state.turnNumber as number | undefined;
  const logs = state.logs;

  const customStats: GameStatItem[] = [];
  if (turnNumber !== undefined)
    customStats.push({ id: 'turns', label: 'Turns', value: turnNumber });
  if (players) {
    const sorted = [...players].sort(
      (a, b) => (b.position ?? 0) - (a.position ?? 0),
    );
    sorted.forEach((p, idx) => {
      const short = p.playerId.slice(0, 6);
      customStats.push({
        id: `pos-${p.playerId}`,
        label: `#${idx + 1} (${short})`,
        value: `Pos ${p.position ?? 0}`,
      });
      if (p.abilitiesUsed && p.abilitiesUsed.length > 0) {
        customStats.push({
          id: `abilities-${p.playerId}`,
          label: `Abilities (${short})`,
          value: p.abilitiesUsed.length,
        });
      }
    });
  }

  const turns = countLogs(logs);
  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

export const cardGameExtractors: Record<string, StateExtractor> = {
  spades_v1: extractSpades,
  hearts_v1: extractHearts,
  cascade_v1: extractCascade,
  critical_v1: extractCritical,
  sea_battle_v1: extractSeaBattle,
  cat_dash_v1: extractCatDash,
};
