export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '***';
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return '***';

  const local = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);
  if (!domain) return '***';

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  const first = local[0];
  const last = local[local.length - 1];
  return `${first}***${last}@${domain}`;
}

export function maskSensitiveText(
  value: string,
  visibleLeading = 2,
  visibleTrailing = 2,
): string {
  if (!value || typeof value !== 'string') return '***';
  const trimmed = value.trim();
  if (trimmed.length <= visibleLeading + visibleTrailing) {
    return '***';
  }
  const leading = trimmed.substring(0, visibleLeading);
  const trailing = trimmed.substring(trimmed.length - visibleTrailing);
  return `${leading}***${trailing}`;
}
