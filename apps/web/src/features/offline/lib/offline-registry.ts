import type {
  IGameEngine,
  BaseGameState,
  GameActionContext,
} from '@arcadeum/games-core';
import type { SeaBattleState as SeaBattleFullState } from '@arcadeum/games-core/games/sea-battle/sea-battle.types';
import { criticalBotDecide } from './critical-bot';

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
  createEngine(): Promise<IGameEngine>;
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
  ): Promise<BotAction | null>;
}

function ctx(userId: string): GameActionContext {
  return {
    userId,
    roomId: 'offline',
    sessionId: 'offline',
    timestamp: new Date(),
  };
}

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
  return (opts?.aiDifficulty ?? 'medium') as
    'easy' | 'medium' | 'hard' | 'expert';
}

export const OFFLINE_GAMES: Record<string, OfflineGameEntry> = {
  tic_tac_toe_v1: {
    slug: 'tic-tac-toe',
    async createEngine() {
      const { TicTacToeEngine } =
        await import('@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe.engine');
      return new TicTacToeEngine();
    },
    actions: {
      place_mark: { action: 'place_mark' },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const { TicTacToeBot } =
        await import('@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe-bot');
      const bot = new TicTacToeBot();
      const move = bot.pickMove(
        state as Parameters<typeof bot.pickMove>[0],
        botId,
      );
      return move
        ? {
            action: 'place_mark',
            payload: move as unknown as Record<string, unknown>,
          }
        : null;
    },
  },

  chess_v1: {
    slug: 'chess',
    async createEngine() {
      const { ChessEngine } =
        await import('@arcadeum/games-core/games/chess/chess.engine');
      return new ChessEngine();
    },
    actions: {
      move: { action: 'move' },
      resign: { action: 'resign' },
      draw_offer: { action: 'draw_offer' },
      draw_accept: { action: 'draw_accept' },
    },
    async botDecide(state, _engine, _botId) {
      const { ChessBot } =
        await import('@arcadeum/games-core/games/chess/chess-bot');
      const bot = new ChessBot();
      const move = bot.findBestMove(
        state as Parameters<typeof bot.findBestMove>[0],
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
    async createEngine() {
      const { CheckersEngine } =
        await import('@arcadeum/games-core/games/checkers/checkers.engine');
      return new CheckersEngine();
    },
    actions: {
      move_piece: { action: 'move_piece' },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const { CheckersBot } =
        await import('@arcadeum/games-core/games/checkers/checkers-bot');
      const bot = new CheckersBot();
      const move = bot.pickMove(
        state as Parameters<typeof bot.pickMove>[0],
        botId,
      );
      return move
        ? {
            action: 'move_piece',
            payload: move as unknown as Record<string, unknown>,
          }
        : null;
    },
  },

  backgammon_v1: {
    slug: 'backgammon',
    async createEngine() {
      const { BackgammonEngine } =
        await import('@arcadeum/games-core/games/backgammon/backgammon.engine');
      return new BackgammonEngine();
    },
    actions: {
      roll: { action: 'roll_dice' },
      move: { action: 'move_checker' },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const phase = (state as { phase?: string }).phase;
      if (phase === 'roll') return { action: 'roll_dice' };
      const { BackgammonBot } =
        await import('@arcadeum/games-core/games/backgammon/backgammon-bot');
      const bot = new BackgammonBot();
      const move = bot.pickMove(
        state as Parameters<typeof bot.pickMove>[0],
        botId,
      );
      return move
        ? {
            action: 'move_checker',
            payload: move as unknown as Record<string, unknown>,
          }
        : null;
    },
  },

  pachisi_v1: {
    slug: 'pachisi',
    async createEngine() {
      const { PachisiEngine } =
        await import('@arcadeum/games-core/games/pachisi/pachisi.engine');
      return new PachisiEngine();
    },
    actions: {
      roll: { action: 'roll_dice' },
      move: {
        action: 'move_token',
        mapPayload: (p) => ({ tokenId: p.tokenId }),
      },
      pass: { action: 'pass_turn' },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const phase = (state as { phase?: string }).phase;
      if (phase === 'roll') return { action: 'roll_dice' };
      const { PachisiBot } =
        await import('@arcadeum/games-core/games/pachisi/pachisi-bot');
      const bot = new PachisiBot();
      const move = bot.pickMove(
        state as Parameters<typeof bot.pickMove>[0],
        botId,
      );
      return move
        ? { action: 'move_token', payload: { tokenId: move.tokenId } }
        : null;
    },
  },

  go_v1: {
    slug: 'go',
    async createEngine() {
      const { GoEngine } =
        await import('@arcadeum/games-core/games/go/go.engine');
      return new GoEngine();
    },
    actions: {
      place_stone: { action: 'place_stone' },
      pass: { action: 'pass' },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const { pickStrategyMove } =
        await import('@arcadeum/games-core/games/go/go-bot.strategy');
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
    async createEngine() {
      const { CascadeEngine } =
        await import('@arcadeum/games-core/games/cascade/cascade.engine');
      return new CascadeEngine();
    },
    actions: {
      play_card: { action: 'play_card', mapPayload: (p) => ({ ...p }) },
      draw: { action: 'draw_card' },
      name_color: {
        action: 'name_color',
        mapPayload: (p) => ({ color: p.color }),
      },
      call_cascade: { action: 'call_cascade' },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const { CascadeBot } =
        await import('@arcadeum/games-core/games/cascade/cascade-bot');
      const bot = new CascadeBot();
      const move = bot.pickMove(
        state as Parameters<typeof bot.pickMove>[0],
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
    async createEngine() {
      const { HeartsEngine } =
        await import('@arcadeum/games-core/games/hearts/hearts.engine');
      return new HeartsEngine();
    },
    actions: {
      pass_cards: {
        action: 'pass_cards',
        mapPayload: (p) => ({ cards: p.cards }),
      },
      play_card: { action: 'play_card', mapPayload: (p) => ({ card: p.card }) },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const { HeartsBot } =
        await import('@arcadeum/games-core/games/hearts/hearts-bot');
      const bot = new HeartsBot();
      const s = state as Parameters<typeof bot.pickPassCards>[0];
      const phase = (state as { phase?: string }).phase;
      if (phase === 'passing') {
        const passed = (state as { passedCards?: Record<string, unknown> })
          .passedCards;
        if (passed?.[botId]) return null;
        return {
          action: 'pass_cards',
          payload: { cards: bot.pickPassCards(s, botId) },
        };
      }
      const actor = bot.currentActorId(s);
      if (actor !== botId) return null;
      const card = bot.pickCardToPlay(s, botId);
      return card ? { action: 'play_card', payload: { card } } : null;
    },
  },

  spades_v1: {
    slug: 'spades',
    async createEngine() {
      const { SpadesEngine } =
        await import('@arcadeum/games-core/games/spades/spades.engine');
      return new SpadesEngine();
    },
    actions: {
      bid: { action: 'bid', mapPayload: (p) => ({ amount: p.amount }) },
      play_card: { action: 'play_card', mapPayload: (p) => ({ card: p.card }) },
      forfeit: { action: 'forfeit' },
    },
    async botDecide(state, _engine, botId) {
      const { SpadesBot } =
        await import('@arcadeum/games-core/games/spades/spades-bot');
      const bot = new SpadesBot();
      const s = state as Parameters<typeof bot.pickBid>[0];
      const phase = (state as { phase?: string }).phase;
      if (phase === 'bidding') {
        const bids = (state as { bids?: Record<string, number | null> }).bids;
        if ((bids?.[botId] ?? null) !== null && bids && botId in bids)
          return null;
        return { action: 'bid', payload: { amount: bot.pickBid(s, botId) } };
      }
      const card = bot.pickCardToPlay(s, botId);
      return card ? { action: 'play_card', payload: { card } } : null;
    },
  },

  sea_battle_v1: {
    slug: 'sea-battle',
    async createEngine() {
      const { SeaBattleEngine } =
        await import('@arcadeum/games-core/games/sea-battle/sea-battle.engine');
      return new SeaBattleEngine();
    },
    actions: {
      attack: { action: 'attack' },
      auto_place: { action: 'autoPlace' },
      confirm_placement: { action: 'confirmPlacement' },
      reset_placement: { action: 'resetPlacement' },
      use_sonar: { action: 'useSonar' },
      use_radar: { action: 'useRadar' },
    },
    async botDecide(state, _engine, botId) {
      const { SeaBattleBot } =
        await import('@arcadeum/games-core/games/sea-battle/sea-battle-bot');
      const bot = new SeaBattleBot();
      const st = state as unknown as SeaBattleFullState;
      const me = st.players.find((p) => p.playerId === botId);
      if (!me || !me.alive) return null;

      if (st.phase === 'placement') {
        if (!me.placementComplete) return { action: 'autoPlace' };
        const allPlaced = st.players.every((p) => p.placementComplete);
        return allPlaced ? { action: 'confirmPlacement' } : null;
      }

      const target = bot.pickTargetOpponent(st, botId);
      if (!target) return null;
      const gridSize = st.gridSize ?? 10;
      const special = bot.pickSpecialWeaponAction(st, botId, target, gridSize);
      if (special) {
        return {
          action: special.action,
          payload: special.payload as unknown as Record<string, unknown>,
        };
      }
      const cell = bot.pickAttackCell(st, target, gridSize);
      if (!cell) return null;
      return {
        action: 'attack',
        payload: { targetPlayerId: target.playerId, row: cell.r, col: cell.c },
      };
    },
  },

  critical_v1: {
    slug: 'critical',
    async createEngine() {
      const { CriticalEngine } =
        await import('@arcadeum/games-core/games/critical/critical.engine');
      return new CriticalEngine();
    },
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
        mapPayload: (p) => ({
          card: 'trade',
          targetPlayerId: p.targetPlayerId,
        }),
      },
      give_favor_card: {
        action: 'give_favor_card',
        mapPayload: (p) => ({ card: p.card }),
      },
      play_see_the_future: {
        action: 'play_card',
        mapPayload: () => ({ card: 'insight' }),
      },
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
      play_defuse: {
        action: 'defuse',
        mapPayload: (p) => ({ position: p.position }),
      },
      play_nope: { action: 'play_cancel' },
      commit_alter_future: {
        action: 'commit_alter_future',
        mapPayload: (p) => ({ newOrder: p.newOrder }),
      },
      history_note: { action: '__ignore__' },
    },
    async botDecide(state, _engine, botId) {
      return criticalBotDecide(state, botId);
    },
  },

  cat_dash_v1: {
    slug: 'cat-dash',
    async createEngine() {
      const { CatDashEngine } =
        await import('@arcadeum/games-core/games/cat-dash/cat-dash.engine');
      return new CatDashEngine();
    },
    actions: {
      rolldice: { action: 'rollDice' },
      useability: {
        action: 'useAbility',
        mapPayload: (p) => ({ abilityId: p.abilityId }),
      },
      choosepath: {
        action: 'choosePath',
        mapPayload: (p) => ({ pathIndex: p.pathIndex }),
      },
      forfeit: { action: 'forfeit' },
    },
    botDecide() {
      // Cat-dash bots only ever roll; abilities/path choice are human-only today.
      return Promise.resolve({ action: 'rollDice' });
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
