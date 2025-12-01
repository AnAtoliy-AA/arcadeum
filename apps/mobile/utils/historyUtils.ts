import { gamesCatalog } from '@/pages/GamesScreen/catalog';

const gameNameLookup = new Map(
  gamesCatalog.map((game) => [game.id, game.name]),
);

export function resolveGameName(gameId: string): string | undefined {
  return gameNameLookup.get(gameId.trim());
}

export function formatParticipantDisplayName(
  id: string,
  username: string | null | undefined,
  email?: string | null | undefined
) {
  const normalizedUsername = username?.trim();
  if (normalizedUsername) {
    return normalizedUsername;
  }

  const normalizedEmail = email?.trim();
  if (normalizedEmail) {
    const [localPart] = normalizedEmail.split('@');
    const candidate = localPart?.trim();
    return candidate || normalizedEmail;
  }

  return id;
}