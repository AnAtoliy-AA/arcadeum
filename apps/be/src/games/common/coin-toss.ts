export interface CoinTossResult {
  firstPlayerId: string;
  firstTurnIndex: number;
  toss: 'heads' | 'tails';
  seed: string;
}

export function performFairCoinToss(
  playerIds: string[],
  explicitFirstPlayer?: string,
): CoinTossResult {
  const seed = globalThis.crypto.randomUUID();
  if (
    explicitFirstPlayer &&
    explicitFirstPlayer !== 'random' &&
    playerIds.includes(explicitFirstPlayer)
  ) {
    const idx = playerIds.indexOf(explicitFirstPlayer);
    return {
      firstPlayerId: explicitFirstPlayer,
      firstTurnIndex: idx,
      toss: 'heads',
      seed,
    };
  }

  const randomByte = new Uint8Array(1);
  globalThis.crypto.getRandomValues(randomByte);
  const toss: 'heads' | 'tails' = (randomByte[0] & 1) === 0 ? 'heads' : 'tails';
  const firstTurnIndex = (randomByte[0] & 1) % Math.max(1, playerIds.length);
  const firstPlayerId = playerIds[firstTurnIndex] ?? playerIds[0];

  return {
    firstPlayerId,
    firstTurnIndex,
    toss,
    seed,
  };
}
