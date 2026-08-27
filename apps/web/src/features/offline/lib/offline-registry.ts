import type { IGameEngine, BaseGameState, GameActionContext } from '@arcadeum/games-core';
import { TicTacToeBot } from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe-bot';
import { TicTacToeEngine } from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe.engine';
import { ChessBot } from '@arcadeum/games-core/games/chess/chess-bot';
import { ChessEngine } from '@arcadeum/games-core/games/chess/chess.engine';
import { CheckersBot } from '@arcadeum/games-core/games/checkers/checkers-bot';
import { CheckersEngine } from '@arcadeum/games-core/games/checkers/checkers.engine';
import { BackgammonBot } from '@arcadeum/games-core/games/backgammon/backgammon-bot';
import { BackgammonEngine } from '@arcadeum/games-core/games/backgammon/backgammon.engine';
import { PachisiBot } from '@arcadeum/games-core/games/pachisi/pachisi-bot';
import { PachisiEngine } from '@arcadeum/games-core/games/pachisi/pachisi.engine';
import { pickStrategyMove } from '@arcadeum/games-core/games/go/go-bot.strategy';
import { GoEngine } from '@arcadeum/games-core/games/go/go.engine';
import { CascadeBot } from '@arcadeum/games-core/games/cascade/cascade-bot';
import { CascadeEngine } from '@arcadeum/games-core/games/cascade/cascade.engine';
import { HeartsBot } from '@arcadeum/games-core/games/hearts/hearts-bot';
import { HeartsEngine } from '@arcadeum/games-core/games/hearts/hearts.engine';
import { SpadesBot } from '@arcadeum/games-core/games/spades/spades-bot';
import { SpadesEngine } from '@arcadeum/games-core/games/spades/spades.engine';
import { SeaBattleBot } from '@arcadeum/games-core/games/sea-battle/sea-battle-bot';
import type { SeaBattleState } from '@arcadeum/games-core/games/sea-battle/sea-battle.types';
import { SeaBattleEngine } from '@arcadeum/games-core/games/sea-battle/sea-battle.engine';
import {
  CriticalBot,
  DIFFICULTY_CONFIG,
} from '@arcadeum/games-core/games/critical/critical-bot';
import { CriticalEngine } from '@arcadeum/games-core/games/critical/critical.engine';
import { CatDashEngine } from '@arcadeum/games-core/games/cat-dash/cat-dash.engine';

export interface BotAction {
  action: string;
  payload?: Record<string, unknown>;
}

export interface OfflineActionMapping {
  action: string;
  /** Rename / restructure client payload keys into engine payload keys. */
  mapPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
}

type AnyState = BaseGameState;

export interface OfflineGameEntry {
  /** Human route slug (e.g. 'chess'). Widget loading uses the engine id. */
  slug: string;
  createEngine(): IGameEngine;
  /**
   * Map a `<namespace>.session.<suffix>` client event suffix to an engine
   * action. Suffixes are lowercase; return null (omit) to ignore.
   */
  actions: Record<string, OfflineActionMapping>;
  /** Decide the next move for a bot player. Return null to skip. */
  botDecide(
    state: AnyState,
    engine: IGameEngine,
    botId: string,
  ): BotAction | null;
}

function ctx(userId: string): GameActionContext {
  return {
    userId,
    roomId: 'offline',
    sessionId: 'offline',
    timestamp: new Date(),
  };
}

const tttBot = new TicTacToeBot();
const chessBot = new ChessBot();
const checkersBot = new CheckersBot();
const backgammonBot = new BackgammonBot();
const pachisiBot = new PachisiBot();
const cascadeBot = new CascadeBot();
const heartsBot = new HeartsBot();
const spadesBot = new SpadesBot();
const seaBattleBot = new SeaBattleBot();
const criticalBot = new CriticalBot();

interface NamedPlayer {
  playerId: string;
  color?: string;
}

function playerColor(state: AnyState, playerId: string): string | null {
  const players = (state as { players?: NamedPlayer[] }).players ?? [];
  return players.find((p) => p.playerId === playerId)?.color ?? null;
}

function difficultyOf(state: AnyState): 'easy' | 'medium' | 'hard' | 'expert' {
  const opts = (state as { options?: { aiDifficulty?: string } }).options;
  return (opts?.aiDifficulty ?? 'medium') as 'easy' | 'medium' | 'hard' | 'expert';
}

export const OFFLINE_GAMES: Record<string, OfflineGameEntry> = {
  tic_tac_toe_v1: {
    slug: 'tic-tac-toe',
    createEngine: () => new TicTacToeEngine(),
    actions: {
      place_mark: { action: 'place_mark' },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const move = tttBot.pickMove(
        state as Parameters<typeof tttBot.pickMove>[0],
        botId,
      );
      return move
        ? { action: 'place_mark', payload: move as unknown as Record<string, unknown> }
        : null;
    },
  },

  chess_v1: {
    slug: 'chess',
    createEngine: () => new ChessEngine(),
    actions: {
      move: { action: 'move' },
      resign: { action: 'resign' },
      draw_offer: { action: 'draw_offer' },
      draw_accept: { action: 'draw_accept' },
    },
    botDecide(state, _engine, _botId) {
      const move = chessBot.findBestMove(
        state as Parameters<typeof chessBot.findBestMove>[0],
      );
      if (!move) return null;
      return {
        action: 'move',
        payload: {
          fromFile: move.from.file,
          fromRank: move.from.rank,
          toFile: move.to.file,
          toRank: move.to.rank,
          promotion: move.promotion ?? undefined,
        },
      };
    },
  },

  checkers_v1: {
    slug: 'checkers',
    createEngine: () => new CheckersEngine(),
    actions: {
      move_piece: { action: 'move_piece' },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const move = checkersBot.pickMove(
        state as Parameters<typeof checkersBot.pickMove>[0],
        botId,
      );
      return move
        ? { action: 'move_piece', payload: move as unknown as Record<string, unknown> }
        : null;
    },
  },

  backgammon_v1: {
    slug: 'backgammon',
    createEngine: () => new BackgammonEngine(),
    actions: {
      roll: { action: 'roll_dice' },
      move: { action: 'move_checker' },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const phase = (state as { phase?: string }).phase;
      if (phase === 'roll') return { action: 'roll_dice' };
      const move = backgammonBot.pickMove(
        state as Parameters<typeof backgammonBot.pickMove>[0],
        botId,
      );
      return move
        ? { action: 'move_checker', payload: move as unknown as Record<string, unknown> }
        : null;
    },
  },

  pachisi_v1: {
    slug: 'pachisi',
    createEngine: () => new PachisiEngine(),
    actions: {
      roll: { action: 'roll_dice' },
      move: { action: 'move_token', mapPayload: (p) => ({ tokenId: p.tokenId }) },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const phase = (state as { phase?: string }).phase;
      if (phase === 'roll') return { action: 'roll_dice' };
      const move = pachisiBot.pickMove(
        state as Parameters<typeof pachisiBot.pickMove>[0],
        botId,
      );
      return move ? { action: 'move_token', payload: { tokenId: move.tokenId } } : null;
    },
  },

  go_v1: {
    slug: 'go',
    createEngine: () => new GoEngine(),
    actions: {
      place_stone: { action: 'place_stone' },
      pass: { action: 'pass' },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const decision = pickStrategyMove(
        state as Parameters<typeof pickStrategyMove>[0],
        (playerColor(state, botId) ?? 'black') as Parameters<
          typeof pickStrategyMove
        >[1],
        difficultyOf(state) as Parameters<typeof pickStrategyMove>[2],
      );
      if (decision === null || decision === 'pass') return { action: 'pass' };
      return {
        action: 'place_stone',
        payload: { row: decision.row, col: decision.col },
      };
    },
  },

  cascade_v1: {
    slug: 'cascade',
    createEngine: () => new CascadeEngine(),
    actions: {
      play_card: { action: 'play_card', mapPayload: (p) => ({ ...p }) },
      draw: { action: 'draw_card' },
      name_color: { action: 'name_color', mapPayload: (p) => ({ color: p.color }) },
      call_cascade: { action: 'call_cascade' },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const move = cascadeBot.pickMove(
        state as Parameters<typeof cascadeBot.pickMove>[0],
        botId,
      );
      if (!move) return null;
      if (move.type === 'play') {
        return {
          action: 'play_card',
          payload: { cardId: move.cardId, chosenColor: move.chosenColor },
        };
      }
      return { action: 'draw_card' };
    },
  },

  hearts_v1: {
    slug: 'hearts',
    createEngine: () => new HeartsEngine(),
    actions: {
      pass_cards: { action: 'pass_cards', mapPayload: (p) => ({ cards: p.cards }) },
      play_card: { action: 'play_card', mapPayload: (p) => ({ card: p.card }) },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const s = state as Parameters<typeof heartsBot.pickPassCards>[0];
      const phase = (state as { phase?: string }).phase;
      if (phase === 'passing') {
        const passed = (
          state as { passedCards?: Record<string, unknown> }
        ).passedCards;
        if (passed?.[botId]) return null;
        return {
          action: 'pass_cards',
          payload: { cards: heartsBot.pickPassCards(s, botId) },
        };
      }
      const actor = heartsBot.currentActorId(s);
      if (actor !== botId) return null;
      const card = heartsBot.pickCardToPlay(s, botId);
      return card ? { action: 'play_card', payload: { card } } : null;
    },
  },

  spades_v1: {
    slug: 'spades',
    createEngine: () => new SpadesEngine(),
    actions: {
      bid: { action: 'bid', mapPayload: (p) => ({ amount: p.amount }) },
      play_card: { action: 'play_card', mapPayload: (p) => ({ card: p.card }) },
      forfeit: { action: 'forfeit' },
    },
    botDecide(state, _engine, botId) {
      const s = state as Parameters<typeof spadesBot.pickBid>[0];
      const phase = (state as { phase?: string }).phase;
      if (phase === 'bidding') {
        const bids = (state as { bids?: Record<string, number | null> }).bids;
        if ((bids?.[botId] ?? null) !== null && bids && botId in bids) return null;
        return { action: 'bid', payload: { amount: spadesBot.pickBid(s, botId) } };
      }
      const card = spadesBot.pickCardToPlay(s, botId);
      return card ? { action: 'play_card', payload: { card } } : null;
    },
  },

  sea_battle_v1: {
    slug: 'sea-battle',
    createEngine: () => new SeaBattleEngine(),
    actions: {
      attack: { action: 'attack' },
      auto_place: { action: 'autoPlace' },
      confirm_placement: { action: 'confirmPlacement' },
      reset_placement: { action: 'resetPlacement' },
      use_sonar: { action: 'useSonar' },
      use_radar: { action: 'useRadar' },
    },
    botDecide(state, _engine, botId) {
      const st = state as unknown as SeaBattleState;
      const me = st.players.find((p) => p.playerId === botId);
      if (!me || !me.alive) return null;

      if (st.phase === 'placement') {
        if (!me.placementComplete) return { action: 'autoPlace' };
        const allPlaced = st.players.every((p) => p.placementComplete);
        return allPlaced ? { action: 'confirmPlacement' } : null;
      }

      const target = seaBattleBot.pickTargetOpponent(st, botId);
      if (!target) return null;
      const gridSize = st.gridSize ?? 10;
      const special = seaBattleBot.pickSpecialWeaponAction(
        st,
        botId,
        target,
        gridSize,
      );
      if (special) {
        return {
          action: special.action,
          payload: special.payload as unknown as Record<string, unknown>,
        };
      }
      const cell = seaBattleBot.pickAttackCell(st, target, gridSize);
      if (!cell) return null;
      return {
        action: 'attack',
        payload: { targetPlayerId: target.playerId, row: cell.r, col: cell.c },
      };
    },
  },

  critical_v1: {
    slug: 'critical',
    createEngine: () => new CriticalEngine(),
    actions: {
      draw: { action: 'draw_card' },
      play_action: {
        action: 'play_card',
        mapPayload: (p) => ({
          card: p.card,
          targetPlayerId: p.targetPlayerId,
          cardsToStash: p.cardsToStash,
          cardsToUnstash: p.cardsToUnstash,
        }),
      },
      play_favor: {
        action: 'play_card',
        mapPayload: (p) => ({ card: 'trade', targetPlayerId: p.targetPlayerId }),
      },
      give_favor_card: {
        action: 'give_favor_card',
        mapPayload: (p) => ({ card: p.card }),
      },
      play_see_the_future: { action: 'play_card', mapPayload: () => ({ card: 'insight' }) },
      play_cat_combo: {
        action: 'play_cat_combo',
        mapPayload: (p) => ({
          catCardIds: [p.cat],
          targetPlayerId: p.targetPlayerId,
          mode: p.mode,
          desiredCard: p.desiredCard,
          selectedIndex: p.selectedIndex,
          requestedDiscardCard: p.requestedDiscardCard,
        }),
      },
      play_defuse: { action: 'defuse', mapPayload: (p) => ({ position: p.position }) },
      play_nope: { action: 'play_cancel' },
      commit_alter_future: {
        action: 'commit_alter_future',
        mapPayload: (p) => ({ newOrder: p.newOrder }),
      },
      history_note: { action: '__ignore__' },
    },
    botDecide(state, _engine, botId) {
      const s = state as unknown as Parameters<
        typeof criticalBot.filterPlayableCards
      > extends never ? never : Parameters<typeof criticalBot.pickTarget>[0];
      const me = s.players.find((p) => p.playerId === botId);
      if (!me || !me.alive) return null;
      const hand = (me.hand ?? []) as Parameters<
        typeof criticalBot.filterPlayableCards
      >[0];

      if (s.pendingFavor && s.pendingFavor.targetId === botId) {
        const card = hand[Math.floor(Math.random() * hand.length)];
        return card ? { action: 'give_favor_card', payload: { card } } : null;
      }
      if (s.pendingDefuse) {
        const deckSize = s.deck?.length ?? 0;
        return {
          action: 'defuse',
          payload: { position: criticalBot.pickDefusePosition(deckSize) },
        };
      }
      if (s.pendingAlter) {
        const count = Math.min(s.pendingAlter.count ?? 3, s.deck?.length ?? 0);
        const top = (s.deck ?? []).slice(0, count) as Parameters<
          typeof criticalBot.decideAlterFutureOrder
        >[0];
        const order = criticalBot.decideAlterFutureOrder(
          top,
          (s.aiDifficulty ?? 'medium') as Parameters<
            typeof criticalBot.decideAlterFutureOrder
          >[1],
        );
        return { action: 'commit_alter_future', payload: { newOrder: order } };
      }

      const cfg =
        DIFFICULTY_CONFIG[
          (s.aiDifficulty ?? 'medium') as keyof typeof DIFFICULTY_CONFIG
        ] ?? DIFFICULTY_CONFIG.medium;

      if (s.pendingAction && hand.includes('cancel')) {
        if (
          criticalBot.isHostileAction(s.pendingAction.type) &&
          s.pendingAction.playerId !== botId &&
          Math.random() < cfg.nopeChance
        ) {
          return { action: 'play_cancel' };
        }
      }

      const playable = criticalBot.filterPlayableCards(hand);
      const deckSize = s.deck?.length ?? 0;
      if (deckSize === 0 && playable.length === 0) return null;
      if (playable.length > 0 && Math.random() < cfg.playChance) {
        const card = playable[Math.floor(Math.random() * playable.length)];
        return {
          action: 'play_card',
          payload: {
            card,
            targetPlayerId: criticalBot.pickTarget(s, botId, cfg),
          },
        };
      }
      return deckSize > 0 ? { action: 'draw_card' } : null;
    },
  },

  cat_dash_v1: {
    slug: 'cat-dash',
    createEngine: () => new CatDashEngine(),
    actions: {
      rolldice: { action: 'rollDice' },
      useability: { action: 'useAbility', mapPayload: (p) => ({ abilityId: p.abilityId }) },
      choosepath: { action: 'choosePath', mapPayload: (p) => ({ pathIndex: p.pathIndex }) },
      forfeit: { action: 'forfeit' },
    },
    botDecide() {
      // Cat-dash bots only ever roll; abilities/path choice are human-only today.
      return { action: 'rollDice' };
    },
  },
};

/** Engine ids that can run fully offline. */
export const OFFLINE_CAPABLE_ENGINE_IDS = Object.keys(OFFLINE_GAMES);

export function isOfflineCapable(engineId: string): boolean {
  return Boolean(OFFLINE_GAMES[engineId]);
}

export function makeOfflineContext(userId: string): GameActionContext {
  return ctx(userId);
}
