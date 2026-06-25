interface MemberLike {
  id: string;
  displayName: string;
}

/**
 * Resolve a user ID to a human-readable display name.
 *
 * Handles the three common cases that every game widget faces:
 * 1. The local player → "You" (or custom `youLabel`)
 * 2. Bot IDs (`bot-…`) → "Bot 1", "Bot 2", … (ordered by `playerOrder`)
 * 3. Room members → `displayName` from the room payload
 *
 * Falls back to the raw ID (or `fallback`) when nothing else matches.
 */
export function resolveDisplayName(
  id: string | null | undefined,
  opts: {
    currentUserId?: string | null;
    members?: MemberLike[];
    playerOrder?: string[];
    youLabel?: string;
    botLabel?: string;
    fallback?: string;
  } = {},
): string {
  if (!id) return opts.fallback ?? '';
  if (id === opts.currentUserId) return opts.youLabel ?? 'You';

  if (id.startsWith('bot-')) {
    const botOrder =
      opts.playerOrder?.filter((p) => p.startsWith('bot-')) ?? [];
    const idx = botOrder.indexOf(id);
    const label = opts.botLabel ?? 'Bot';
    if (idx !== -1) return `${label} ${idx + 1}`;
    return label;
  }

  const member = opts.members?.find((m) => m.id === id);
  if (member?.displayName && member.displayName !== 'Unknown')
    return member.displayName;

  return opts.fallback ?? id;
}
