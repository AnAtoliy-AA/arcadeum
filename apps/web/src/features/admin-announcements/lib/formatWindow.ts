export function formatWindow(
  startsAt: string | null,
  endsAt: string | null,
  locale: string,
  labels: { now: string; forever: string; always: string },
): string {
  const start = startsAt ? new Date(startsAt) : null;
  const end = endsAt ? new Date(endsAt) : null;
  if (!start && !end) return labels.always;
  const fmt = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  });
  const left = start ? fmt.format(start) : labels.now;
  const right = end ? fmt.format(end) : labels.forever;
  return `${left} → ${right}`;
}
