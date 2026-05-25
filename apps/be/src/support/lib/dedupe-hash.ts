import { createHash } from 'crypto';

export type DedupeInput = {
  ip?: string;
  email: string;
  subject: string;
  message: string;
};

// Stable hash for catching duplicate submissions from the same IP within a
// short window. Email + subject + message catch the same template being
// re-sent; the IP component prevents one bad actor from blocking everyone
// who wants to send a common message ("hi", "test", etc.).
export function dedupeHash(input: DedupeInput): string {
  const parts = [
    input.ip ?? '',
    input.email.trim().toLowerCase(),
    input.subject.trim(),
    input.message.trim(),
  ];
  return createHash('sha256').update(parts.join('|')).digest('hex');
}
