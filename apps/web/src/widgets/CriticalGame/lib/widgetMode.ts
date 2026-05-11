/**
 * Feature flag for the Critical game widget rework (ARC-631 onwards).
 *
 * Default is OFF — `ActiveGameView` keeps rendering the existing
 * `ActiveGameContent` layout. When enabled, the same render slot is taken
 * over by `MatchWidget`, which is where the §7 layout restructure (Arena,
 * OpponentsRow, HandZone, ComboCard, etc.) will land in follow-up tickets.
 *
 * Three resolution paths, in priority order:
 *  1. URL search param `?widget_mode=1` (or `0`) — for ad-hoc QA / demos
 *  2. localStorage key `arcadeum.widget_mode` (`1` / `0`) — sticks across reloads
 *  3. env var `NEXT_PUBLIC_CRITICAL_WIDGET_MODE` (`true` / `1`) — production default
 *
 * The URL form always wins so a QA can flip the flag without env access.
 * The localStorage form persists the URL choice across navigation.
 */

export const WIDGET_MODE_PARAM = 'widget_mode';
export const WIDGET_MODE_STORAGE_KEY = 'arcadeum.widget_mode';

function parseFlag(value: string | null | undefined): boolean | null {
  if (value == null) return null;
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return null;
}

export function isWidgetModeEnabledFromEnv(): boolean {
  return parseFlag(process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE) === true;
}

export function resolveWidgetMode(opts: {
  paramValue?: string | null;
  storageValue?: string | null;
}): boolean {
  const fromParam = parseFlag(opts.paramValue);
  if (fromParam !== null) return fromParam;
  const fromStorage = parseFlag(opts.storageValue);
  if (fromStorage !== null) return fromStorage;
  return isWidgetModeEnabledFromEnv();
}
