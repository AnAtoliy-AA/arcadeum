import type { BaseGameState } from '@arcadeum/games-core';

type AnyState = BaseGameState;

export async function criticalBotDecide(
  state: AnyState,
  botId: string,
): Promise<{ action: string; payload?: Record<string, unknown> } | null> {
  const { CriticalBot, DIFFICULTY_CONFIG } =
    await import('@arcadeum/games-core/games/critical/critical-bot');
  const bot = new CriticalBot();
  const s = state as unknown as Parameters<typeof bot.pickTarget>[0];
  const me = s.players.find((p) => p.playerId === botId);
  if (!me || !me.alive) return null;
  const hand = (me.hand ?? []) as Parameters<typeof bot.filterPlayableCards>[0];

  if (s.pendingFavor && s.pendingFavor.targetId === botId) {
    const card = hand[Math.floor(Math.random() * hand.length)];
    return card ? { action: 'give_favor_card', payload: { card } } : null;
  }
  if (s.pendingDefuse) {
    const deckSize = s.deck?.length ?? 0;
    return {
      action: 'defuse',
      payload: { position: bot.pickDefusePosition(deckSize) },
    };
  }
  if (s.pendingAlter) {
    const count = Math.min(s.pendingAlter.count ?? 3, s.deck?.length ?? 0);
    const top = (s.deck ?? []).slice(0, count) as Parameters<
      typeof bot.decideAlterFutureOrder
    >[0];
    const order = bot.decideAlterFutureOrder(
      top,
      (s.aiDifficulty ?? 'medium') as Parameters<
        typeof bot.decideAlterFutureOrder
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
      bot.isHostileAction(s.pendingAction.type) &&
      s.pendingAction.playerId !== botId &&
      Math.random() < cfg.nopeChance
    ) {
      return { action: 'play_cancel' };
    }
  }

  const playable = bot.filterPlayableCards(hand);
  const deckSize = s.deck?.length ?? 0;
  if (deckSize === 0 && playable.length === 0) return null;
  if (playable.length > 0 && Math.random() < cfg.playChance) {
    const card = playable[Math.floor(Math.random() * playable.length)];
    return {
      action: 'play_card',
      payload: {
        card,
        targetPlayerId: bot.pickTarget(s, botId, cfg),
      },
    };
  }
  return deckSize > 0 ? { action: 'draw_card' } : null;
}
