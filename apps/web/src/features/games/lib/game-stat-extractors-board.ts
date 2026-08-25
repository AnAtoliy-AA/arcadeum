import type { GameStatItem } from '../ui/GameResultStatsGrid';
import { countLogs, type StateExtractor } from './game-stat-extractors.types';

const extractCheckers: StateExtractor = (state) => {
  const players = state.players as
    Array<{ playerId: string; piecesRemaining?: number }> | undefined;
  const logs = state.logs;
  const turns = countLogs(logs);

  const customStats: GameStatItem[] = [];
  if (players) {
    for (const p of players) {
      if (p.piecesRemaining !== undefined) {
        customStats.push({
          id: `pieces-${p.playerId}`,
          label: `Pieces (${p.playerId.slice(0, 6)})`,
          value: p.piecesRemaining,
        });
      }
    }
  }

  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractGo: StateExtractor = (state) => {
  const captures = state.captures as
    { black?: number; white?: number } | undefined;
  const scores = state.scores as { black?: number; white?: number } | undefined;
  const boardSize = state.boardSize as number | undefined;
  const logs = state.logs;
  const turns = countLogs(logs);

  const customStats: GameStatItem[] = [];
  if (captures) {
    if (captures.black !== undefined)
      customStats.push({
        id: 'captures-black',
        label: 'Black Captures',
        value: captures.black,
      });
    if (captures.white !== undefined)
      customStats.push({
        id: 'captures-white',
        label: 'White Captures',
        value: captures.white,
      });
  }
  if (scores) {
    if (scores.black !== undefined)
      customStats.push({
        id: 'score-black',
        label: 'Black Score',
        value: scores.black,
      });
    if (scores.white !== undefined)
      customStats.push({
        id: 'score-white',
        label: 'White Score',
        value: scores.white,
      });
  }
  if (boardSize) {
    customStats.push({
      id: 'board-size',
      label: 'Board Size',
      value: `${boardSize}×${boardSize}`,
    });
  }

  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractBackgammon: StateExtractor = (state) => {
  const players = state.players as
    | Array<{
        playerId: string;
        pipCount?: number;
        borneOff?: number;
        bar?: number;
      }>
    | undefined;
  const winType = state.winType as string | undefined;
  const logs = state.logs;
  const turns = countLogs(logs);

  const customStats: GameStatItem[] = [];
  if (players) {
    for (const p of players) {
      const short = p.playerId.slice(0, 6);
      if (p.pipCount !== undefined)
        customStats.push({
          id: `pip-${p.playerId}`,
          label: `Pips (${short})`,
          value: p.pipCount,
        });
      if (p.borneOff !== undefined)
        customStats.push({
          id: `borne-${p.playerId}`,
          label: `Borne Off (${short})`,
          value: p.borneOff,
        });
      if (p.bar !== undefined && p.bar > 0)
        customStats.push({
          id: `bar-${p.playerId}`,
          label: `On Bar (${short})`,
          value: p.bar,
        });
    }
  }
  if (winType) {
    customStats.push({
      id: 'win-type',
      label: 'Win Type',
      value: winType.charAt(0).toUpperCase() + winType.slice(1),
    });
  }

  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractTicTacToe: StateExtractor = (state) => {
  const options = state.options as { boardSize?: number } | undefined;
  const winLine = state.winLine as unknown[] | undefined;
  const logs = state.logs;
  const turns = countLogs(logs);

  const customStats: GameStatItem[] = [];
  if (options?.boardSize) {
    customStats.push({
      id: 'board-size',
      label: 'Board Size',
      value: `${options.boardSize}×${options.boardSize}`,
    });
  }
  if (winLine) {
    customStats.push({
      id: 'win-line',
      label: 'Win Length',
      value: winLine.length,
    });
  }

  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

const extractPachisi: StateExtractor = (state) => {
  const tokens = state.tokens as
    Record<string, Array<{ id: string; progress: number }>> | undefined;
  const consecutiveSixes = state.consecutiveSixes as number | undefined;
  const logs = state.logs;
  const turns = countLogs(logs);

  const customStats: GameStatItem[] = [];
  if (tokens) {
    for (const [playerId, playerTokens] of Object.entries(tokens)) {
      const finished = playerTokens.filter((t) => t.progress >= 56).length;
      customStats.push({
        id: `tokens-${playerId}`,
        label: `Finished (${playerId.slice(0, 6)})`,
        value: `${finished}/4`,
      });
    }
  }
  if (consecutiveSixes !== undefined && consecutiveSixes > 0) {
    customStats.push({
      id: 'consecutive-sixes',
      label: 'Consecutive 6s',
      value: consecutiveSixes,
    });
  }

  return {
    turns,
    customStats: customStats.length > 0 ? customStats : undefined,
  };
};

export const boardGameExtractors: Record<string, StateExtractor> = {
  checkers_v1: extractCheckers,
  go_v1: extractGo,
  backgammon_v1: extractBackgammon,
  tic_tac_toe_v1: extractTicTacToe,
  pachisi_v1: extractPachisi,
};
