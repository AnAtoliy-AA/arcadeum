import type { ReactNode } from 'react';
import type { ChatScope, ChatLogEntry } from '../store/gameChatStore';

const RESULT_COLORS: Record<string, string> = {
  HIT: '#F97316',
  MISS: '#94A3B8',
  SUNK: '#EF4444',
};

const RESULT_PATTERN = /\b(HIT|MISS|SUNK)\b/;

const MOVE_PATTERN = /Mark placed at \((-?\d+), (-?\d+)\)/;

const EMOJI_STARTER = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

export type SystemRowKind = 'round' | 'combo' | 'join' | 'elim';

export function parseMoveCell(
  message: string,
): { row: number; col: number } | null {
  const m = MOVE_PATTERN.exec(message);
  if (!m) return null;
  return { row: Number(m[1]), col: Number(m[2]) };
}

export function renderResultHighlights(message: string): ReactNode {
  const match = RESULT_PATTERN.exec(message);
  if (!match) return message;
  const idx = match.index;
  const keyword = match[0];
  const color = RESULT_COLORS[keyword];
  return (
    <>
      {message.slice(0, idx)}
      <span style={{ color, fontWeight: 800 }}>{keyword}</span>
      {message.slice(idx + keyword.length)}
    </>
  );
}

export function inferSysKind(log: ChatLogEntry): SystemRowKind {
  const msg = log.message?.toLowerCase() ?? '';
  if (msg.includes('round')) return 'round';
  if (msg.includes('combo')) return 'combo';
  if (msg.includes('join') || msg.includes('placing') || msg.includes('left '))
    return 'join';
  return log.type === 'action' ? 'combo' : 'elim';
}

export function parseEmoteMessage(
  message: string,
): { emoji: string; name: string } | null {
  const firstCodePoint = message.codePointAt(0);
  if (firstCodePoint === undefined) return null;
  const firstChar = String.fromCodePoint(firstCodePoint);
  if (!EMOJI_STARTER.test(firstChar)) return null;
  const spaceIdx = message.indexOf(' ');
  if (spaceIdx === -1) return { emoji: message, name: '' };
  return {
    emoji: message.slice(0, spaceIdx),
    name: message.slice(spaceIdx + 1),
  };
}

export function logBelongsToScope(
  log: ChatLogEntry,
  scope: ChatScope,
): boolean {
  if (log.type !== 'message') return scope === 'all';
  const logScope = (log as ChatLogEntry & { scope?: ChatScope }).scope;
  if (!logScope) return scope === 'all';
  return logScope === scope;
}

export function lastMessagePreview(logs: ChatLogEntry[]): string {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (log.type === 'message') {
      const name = log.senderName ?? 'Someone';
      const text = log.message ?? '';
      return `${name}: ${text}`;
    }
  }
  return 'No messages yet';
}
