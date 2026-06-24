export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function pickSwatchColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/#[0-9a-fA-F]{3,8}/);
  if (match) return match[0];
  return value.includes('gradient') ? null : value;
}

export function isGradient(value: string | null | undefined): boolean {
  return !!value && value.includes('gradient');
}
