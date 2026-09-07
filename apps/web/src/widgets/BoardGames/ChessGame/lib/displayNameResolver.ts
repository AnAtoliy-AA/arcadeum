import { resolveDisplayName } from '@/features/games/lib/resolveDisplayName';
import { getBotPersonality } from '@arcadeum/games-core/games/chess/chess-bot-personalities';
import type { ChessClientState } from '../types';
import type { GameRoomSummary } from '@/shared/types/games';

export function createDisplayNameResolver(
  currentUserId: string | null,
  room: GameRoomSummary | null | undefined,
  displaySnapshot: ChessClientState | null,
) {
  return (id?: string | null) => {
    const gameOpts = room?.gameOptions as Record<string, unknown> | undefined;
    let botLabel: string | undefined;
    if (id?.startsWith('bot-') && displaySnapshot?.players) {
      const player = displaySnapshot.players.find((p) => p.playerId === id);
      if (player) {
        const perColorKey =
          player.color === 'white'
            ? 'botPersonalityWhite'
            : 'botPersonalityBlack';
        const personalityId =
          (gameOpts?.[perColorKey] as string) ??
          (gameOpts?.botPersonality as string);
        if (personalityId) {
          const personality = getBotPersonality(personalityId);
          if (personality) botLabel = personality.name;
        }
      }
    }
    return resolveDisplayName(id, {
      currentUserId,
      members: room?.members,
      playerOrder: displaySnapshot?.players.map((p) => p.playerId),
      botLabel,
    });
  };
}
