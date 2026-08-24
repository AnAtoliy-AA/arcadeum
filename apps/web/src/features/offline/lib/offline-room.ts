/** Offline room ids are prefixed so transport layers can route them locally. */
export const OFFLINE_ROOM_PREFIX = 'offline_';

export function isOfflineRoomId(roomId: string): boolean {
  return roomId.startsWith(OFFLINE_ROOM_PREFIX);
}

export function createOfflineRoomId(gameSlug: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${OFFLINE_ROOM_PREFIX}${gameSlug}_${rand}`;
}
