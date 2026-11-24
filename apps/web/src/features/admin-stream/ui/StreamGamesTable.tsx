'use client';

import { FilterChip, GlassCard, Toggle, Typography } from '@arcadeum/ui';
import { gameMetadata } from '@/features/games/registry';
import {
  STREAM_GAME_IDS,
  STREAM_THEMES,
  type StreamGameId,
  type StreamSettings,
} from '../server/stream.types';
import {
  LIMITS,
  minToSec,
  secToMin,
  setGame,
  type FieldErrors,
} from '../lib/streamSettings';
import { errorText } from './FormField';
import type { StreamT } from './useStreamT';

const cell =
  'flex items-center justify-between gap-3 md:table-cell md:px-3 md:py-3 md:align-top';
const label = 'text-xs font-semibold text-[var(--neutral)] md:hidden';

function gameName(id: string): string {
  return (
    (gameMetadata as Record<string, { name: string } | undefined>)[id]?.name ??
    id
  );
}

interface Props {
  settings: StreamSettings;
  errors: FieldErrors;
  disabled: boolean;
  onChange: (next: StreamSettings) => void;
  t: StreamT;
}

/** Per-game rotation table: toggle, weight, themes, max duration. Cards on phones. */
export function StreamGamesTable({
  settings,
  errors,
  disabled,
  onChange,
  t,
}: Props) {
  const toggleTheme = (id: StreamGameId, theme: string) => {
    const cur = settings.games[id].themes;
    const next = cur.includes(theme)
      ? cur.filter((x) => x !== theme)
      : [...cur, theme];
    onChange(setGame(settings, id, 'themes', next));
  };

  return (
    <GlassCard className="flex flex-col gap-3 p-4" data-testid="stream-games">
      <Typography variant="heading" level={3} uiSize="md">
        {t('games.caption')}
      </Typography>
      <p className="m-0 text-xs text-[var(--neutral)]">
        {t('games.weightHint')}
      </p>
      {errors.games ? (
        <p
          role="alert"
          className="m-0 text-sm font-semibold text-[var(--danger)]"
          data-testid="stream-games-error"
        >
          {errorText(t, errors.games)}
        </p>
      ) : null}
      <table className="w-full border-collapse text-sm md:table block">
        <caption className="sr-only">{t('games.caption')}</caption>
        <thead className="sr-only md:table-header-group md:not-sr-only">
          <tr className="text-left text-xs text-[var(--neutral)]">
            <th scope="col" className="px-3 py-2">
              {t('games.game')}
            </th>
            <th scope="col" className="px-3 py-2">
              {t('games.enabled')}
            </th>
            <th scope="col" className="px-3 py-2">
              {t('games.weight')}
            </th>
            <th scope="col" className="px-3 py-2">
              {t('games.themes')}
            </th>
            <th scope="col" className="px-3 py-2">
              {t('games.maxDuration')}
            </th>
          </tr>
        </thead>
        <tbody className="flex flex-col gap-3 md:table-row-group">
          {STREAM_GAME_IDS.map((id) => {
            const g = settings.games[id];
            const name = gameName(id);
            const weightErr = errors[`games.${id}.weight`];
            const durErr = errors[`games.${id}.maxDurationMin`];
            const themeErr = errors[`games.${id}.themes`];
            return (
              <tr
                key={id}
                data-testid={`stream-game-${id}`}
                className="flex flex-col gap-2 rounded-xl border border-[var(--borderColor)] p-3 md:table-row md:rounded-none md:border-0 md:border-t md:p-0"
              >
                <th
                  scope="row"
                  className="text-left text-base font-bold md:table-cell md:px-3 md:py-3 md:align-top md:text-sm"
                >
                  {name}
                </th>
                <td className={cell}>
                  <span className={label}>{t('games.enabled')}</span>
                  <Toggle
                    checked={g.enabled}
                    disabled={disabled}
                    ariaLabel={t('games.enableGame', { game: name })}
                    onLabel={t('games.enabled')}
                    offLabel="-"
                    testId={`stream-game-${id}-enabled`}
                    onCheckedChange={(v) =>
                      onChange(setGame(settings, id, 'enabled', v))
                    }
                  />
                </td>
                <td className={cell}>
                  <span className={label}>{t('games.weight')}</span>
                  <div className="flex flex-col items-end gap-1 md:items-start">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={LIMITS.weight.min}
                      max={LIMITS.weight.max}
                      step={1}
                      value={Number.isFinite(g.weight) ? g.weight : ''}
                      disabled={disabled}
                      aria-label={t('games.weightFor', { game: name })}
                      aria-invalid={weightErr ? true : undefined}
                      data-testid={`stream-game-${id}-weight`}
                      onChange={(e) =>
                        onChange(
                          setGame(
                            settings,
                            id,
                            'weight',
                            e.target.value === ''
                              ? Number.NaN
                              : Number(e.target.value),
                          ),
                        )
                      }
                      className="h-9 w-20 rounded-xl border border-[var(--borderColor)] bg-[var(--background)] px-2 text-[var(--color)]"
                    />
                    {weightErr ? (
                      <span
                        role="alert"
                        className="text-xs text-[var(--danger)]"
                      >
                        {errorText(t, weightErr)}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="flex flex-col gap-1 md:table-cell md:px-3 md:py-3 md:align-top">
                  <span className={label}>{t('games.themes')}</span>
                  <div
                    className="flex flex-wrap gap-1.5"
                    role="group"
                    aria-label={t('games.themesFor', { game: name })}
                  >
                    {STREAM_THEMES.map((theme) => (
                      <FilterChip
                        key={theme}
                        active={g.themes.includes(theme)}
                        disabled={disabled}
                        data-testid={`stream-game-${id}-theme-${theme}`}
                        onClick={() => toggleTheme(id, theme)}
                      >
                        <span className="capitalize">{theme}</span>
                      </FilterChip>
                    ))}
                  </div>
                  {themeErr ? (
                    <span role="alert" className="text-xs text-[var(--danger)]">
                      {errorText(t, themeErr)}
                    </span>
                  ) : null}
                </td>
                <td className={cell}>
                  <span className={label}>{t('games.maxDuration')}</span>
                  <div className="flex flex-col items-end gap-1 md:items-start">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={LIMITS.maxDurationMin.min}
                      max={LIMITS.maxDurationMin.max}
                      step={1}
                      value={
                        Number.isFinite(g.maxDurationSec)
                          ? secToMin(g.maxDurationSec)
                          : ''
                      }
                      disabled={disabled}
                      aria-label={t('games.durationFor', { game: name })}
                      aria-invalid={durErr ? true : undefined}
                      data-testid={`stream-game-${id}-duration`}
                      onChange={(e) =>
                        onChange(
                          setGame(
                            settings,
                            id,
                            'maxDurationSec',
                            e.target.value === ''
                              ? Number.NaN
                              : minToSec(Number(e.target.value)),
                          ),
                        )
                      }
                      className="h-9 w-20 rounded-xl border border-[var(--borderColor)] bg-[var(--background)] px-2 text-[var(--color)]"
                    />
                    {durErr ? (
                      <span
                        role="alert"
                        className="text-xs text-[var(--danger)]"
                      >
                        {errorText(t, durErr)}
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </GlassCard>
  );
}
